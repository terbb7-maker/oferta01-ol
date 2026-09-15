import {
  approvedTransactionStatus,
  asObject,
  cleanText,
  flevoRequest,
  getFlevoConfig,
  jsonResponse,
} from "../../flevo/_lib";
import { isAdminSession, readAdminCookie } from "../_auth";

export const runtime = "nodejs";

type Transaction = Record<string, unknown>;

function transactionRows(data: unknown): Transaction[] {
  if (Array.isArray(data)) return data.map(asObject).filter((row): row is Transaction => Boolean(row));
  const envelope = asObject(data);
  const rows = envelope?.data ?? envelope?.transactions ?? envelope?.results;
  return Array.isArray(rows) ? rows.map(asObject).filter((row): row is Transaction => Boolean(row)) : [];
}

function nestedText(transaction: Transaction, keys: string[]): string {
  const candidates: unknown[] = [transaction];
  for (const key of keys) {
    const next: unknown[] = [];
    for (const candidate of candidates) {
      const object = asObject(candidate);
      if (object?.[key] !== undefined) next.push(object[key]);
    }
    candidates.push(...next);
  }
  for (const candidate of candidates) {
    const value = cleanText(candidate, 120);
    if (value) return value;
  }
  return "";
}

function transactionAmount(row: Transaction): number {
  for (const key of ["amount", "total", "value", "price"]) {
    const amount = Number(row[key]);
    if (Number.isFinite(amount) && amount > 0) return amount > 100000 ? amount / 100 : amount;
  }
  return 0;
}

function transactionTime(row: Transaction): number {
  for (const key of ["created_at", "updated_at", "date", "createdAt"]) {
    const time = Date.parse(cleanText(row[key], 60));
    if (Number.isFinite(time)) return time;
  }
  return 0;
}

function locationFor(row: Transaction) {
  const state = nestedText(row, ["address", "state"]) || nestedText(row, ["customer", "state"]) || nestedText(row, ["customer_data", "address", "state"]);
  const city = nestedText(row, ["address", "city"]) || nestedText(row, ["customer", "city"]) || nestedText(row, ["customer_data", "address", "city"]);
  return { city: city || "Não informado", state: state.toUpperCase() || "--" };
}

function productName(row: Transaction): string {
  const description = nestedText(row, ["description"]);
  if (description) return description.split(" · ")[0].slice(0, 44);
  return nestedText(row, ["product", "name"]) || "Pedido Pix";
}

export async function GET(request: Request): Promise<Response> {
  if (!isAdminSession(readAdminCookie(request))) return jsonResponse({ error: "Não autorizado." }, 401);
  const config = getFlevoConfig();
  if (!config) return jsonResponse({ error: "FlevoPay não configurado." }, 503);

  try {
    const { response, data } = await flevoRequest("/query?action=list_transactions", config.secretKey);
    if (!response.ok) return jsonResponse({ error: "Não foi possível consultar as transações." }, 502);
    const transactions = transactionRows(data).sort((a, b) => transactionTime(b) - transactionTime(a));
    const normalized = transactions.map((row, index) => {
      const status = approvedTransactionStatus(row.status);
      const location = locationFor(row);
      return {
        id: cleanText(row.external_id ?? row.store_reference ?? row.id, 80) || `pedido-${index + 1}`,
        status,
        amount: transactionAmount(row),
        createdAt: transactionTime(row) || Date.now(),
        city: location.city,
        state: location.state,
        product: productName(row),
      };
    });
    const approved = normalized.filter((row) => row.status === "approved");
    const pending = normalized.filter((row) => row.status === "pending");
    const failed = normalized.filter((row) => row.status === "failed");
    const revenue = approved.reduce((sum, row) => sum + row.amount, 0);
    const averageTicket = approved.length ? revenue / approved.length : 0;
    const locations = new Map<string, { city: string; state: string; leads: number; approved: number }>();
    for (const row of normalized) {
      const key = `${row.city}|${row.state}`;
      const item = locations.get(key) ?? { city: row.city, state: row.state, leads: 0, approved: 0 };
      item.leads += 1;
      if (row.status === "approved") item.approved += 1;
      locations.set(key, item);
    }
    const topProducts = new Map<string, { name: string; orders: number; revenue: number }>();
    for (const row of approved) {
      const item = topProducts.get(row.product) ?? { name: row.product, orders: 0, revenue: 0 };
      item.orders += 1;
      item.revenue += row.amount;
      topProducts.set(row.product, item);
    }

    return jsonResponse({
      generatedAt: Date.now(),
      source: "FlevoPay",
      totals: { leads: normalized.length, approved: approved.length, pending: pending.length, failed: failed.length, revenue, averageTicket, approvalRate: normalized.length ? approved.length / normalized.length : 0 },
      funnel: [
        { label: "Pedidos iniciados", value: normalized.length, detail: "transações recebidas" },
        { label: "Pix pendentes", value: pending.length, detail: "aguardando pagamento" },
        { label: "Pagamentos aprovados", value: approved.length, detail: "confirmados pela FlevoPay" },
      ],
      locations: [...locations.values()].sort((a, b) => b.leads - a.leads).slice(0, 8),
      products: [...topProducts.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6),
      live: normalized.slice(0, 10),
    });
  } catch {
    return jsonResponse({ error: "Não foi possível carregar as métricas agora." }, 502);
  }
}
