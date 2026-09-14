import { createHash, randomUUID } from "node:crypto";

const FLEVO_API = "https://app.flevopay.com.br/api/v1";
const DEFAULT_FLEVOPAY_STORE_ID = "10529";
const DEFAULT_TIKTOK_PIXEL_ID = "DAK3TN3C77UDHLL41DAG";

export type JsonObject = Record<string, unknown>;

export const PRODUCTS: Record<string, { name: string; price: number }> = {
  "core-pace": { name: "Corre Pace", price: 18490 },
  "core-4": { name: "Corre 4 50 Anos", price: 5990 },
  "supra-2": { name: "Corre Supra 2", price: 12990 },
  "trilha-2": { name: "Corre Trilha 2", price: 5990 },
  "grafeno-3": { name: "Corre Grafeno 3", price: 7990 },
  "corre-max": { name: "Corre Max", price: 5490 },
  "corre-5": { name: "Corre 5", price: 5990 },
  "corre-vento-3": { name: "Corre Vento 3", price: 4990 },
  "corre-trilha-3": { name: "Corre Trilha 3", price: 5990 },
  "corre-max-2": { name: "Corre Max 2", price: 5990 },
  "corre-turbo": { name: "Corre Turbo", price: 6990 },
  "corre-nuvem": { name: "Corre Nuvem", price: 3990 },
};

const UPSELLS = [
  { name: "Jaqueta Corre 51 Anos", price: 42990 },
  { name: "Camiseta Corre Essencial", price: 11990 },
  { name: "Shorts Run 51", price: 13990 },
  { name: "Corta-vento Corre", price: 36990 },
  { name: "Regata Movimento", price: 9990 },
  { name: "Calça Run Comfort", price: 25990 },
  { name: "Moletom 51 Anos", price: 28990 },
  { name: "Boné Corre", price: 8990 },
  { name: "Meia Performance", price: 4990 },
];

const SHIPPING: Record<string, { name: string; price: number }> = {
  economico: { name: "Correios Econômico", price: 0 },
  pac: { name: "Correios Pacote", price: 1691 },
  express: { name: "Correios Express", price: 2492 },
};

export function asObject(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

export function cleanText(value: unknown, maxLength = 160): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function jsonResponse(
  body: JsonObject,
  status = 200,
): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === getPublicOrigin(request);
  } catch {
    return false;
  }
}

export function getPublicOrigin(request: Request): string {
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
    || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
    || requestUrl.protocol.slice(0, -1);
  if (!host) return requestUrl.origin;
  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return requestUrl.origin;
  }
}

export function getFlevoConfig(): { storeId: string; secretKey: string } | null {
  const storeId = process.env.FLEVOPAY_STORE_ID?.trim() || DEFAULT_FLEVOPAY_STORE_ID;
  const secretKey = process.env.FLEVOPAY_SECRET_KEY?.trim();
  return storeId && secretKey ? { storeId, secretKey } : null;
}

export async function flevoRequest(
  path: string,
  secretKey: string,
  init?: RequestInit,
): Promise<{ response: Response; data: JsonObject | unknown[] | null }> {
  const response = await fetch(`${FLEVO_API}${path}`, {
    ...init,
    headers: {
      "X-API-Key": secretKey,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const parsed: unknown = await response.json().catch(() => null);
  const data = asObject(parsed) ?? (Array.isArray(parsed) ? parsed : null);
  return { response, data };
}

export function approvedTransactionStatus(value: unknown):
  | "approved"
  | "failed"
  | "pending" {
  const status = cleanText(value).toLowerCase();
  if (["approved", "paid", "completed", "success"].includes(status)) {
    return "approved";
  }
  if (["failed", "refunded", "chargeback", "cancelled", "canceled", "expired"].includes(status)) {
    return "failed";
  }
  return "pending";
}

export function newOrderReference(storeId: string): string {
  return `OLY-${storeId}-${randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

export function getCheckoutItems(
  itemsValue: unknown,
  couponCode: unknown,
): { items: Array<{ id: string; name: string; size: number; quantity: number; unitPrice: number; color: string }>; total: number } | null {
  if (!Array.isArray(itemsValue) || itemsValue.length === 0 || itemsValue.length > 20) {
    return null;
  }

  const coupon = cleanText(couponCode, 24);
  if (coupon && coupon !== "CORRE51") return null;

  const items: Array<{ id: string; name: string; size: number; quantity: number; unitPrice: number; color: string }> = [];
  let total = 0;

  for (const value of itemsValue) {
    const row = asObject(value);
    if (!row) return null;
    const id = cleanText(row.productId, 48);
    const size = Number(row.size);
    const quantity = Number(row.quantity);
    if (!Number.isInteger(size) || size < 33 || size > 42) return null;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return null;

    let product = PRODUCTS[id];
    let unitPrice = product?.price ?? 0;
    if (!product && id.startsWith("upsell-")) {
      const index = Number(id.slice("upsell-".length));
      const offer = Number.isInteger(index) ? UPSELLS[index] : undefined;
      if (offer) {
        product = offer;
        unitPrice = Math.round(offer.price * 0.15);
      }
    }
    if (!product) return null;
    if (coupon && !id.startsWith("upsell-")) unitPrice = Math.round(unitPrice * 0.15);
    total += unitPrice * quantity;
    items.push({ id, name: product.name, size, quantity, unitPrice, color: cleanText(row.color, 36) });
  }

  return total > 0 ? { items, total } : null;
}

export function getShipping(value: unknown): { name: string; price: number } | null {
  const shippingId = cleanText(value, 24);
  return SHIPPING[shippingId] ?? null;
}

export function getTrackingFromUrl(url: URL): Record<string, string> | undefined {
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"];
  const entries = Object.fromEntries(
    keys
      .map((key) => [key, url.searchParams.get(key)?.slice(0, 200) ?? ""] as const)
      .filter(([, value]) => value.length > 0),
  );
  return Object.keys(entries).length > 0 ? entries : undefined;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function getCookie(request: Request, name: string): string {
  const cookie = request.headers.get("cookie") ?? "";
  const item = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!item) return "";
  const value = item.slice(name.length + 1);
  try {
    return decodeURIComponent(value).slice(0, 250);
  } catch {
    return value.slice(0, 250);
  }
}

export async function sendTikTokPurchaseEvent(
  request: Request,
  transaction: JsonObject,
): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() || DEFAULT_TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN?.trim();
  if (!pixelId || !accessToken) return;

  const reference = cleanText(transaction.external_id ?? transaction.store_reference, 100);
  const amount = Number(transaction.amount);
  if (!reference || !Number.isFinite(amount) || amount <= 0) return;

  const customerData = asObject(transaction.customer_data) ?? {};
  const customer = asObject(customerData.customer) ?? customerData;
  const email = cleanText(customer.email, 254).toLowerCase();
  const digits = cleanText(customer.phone, 24).replace(/\D/g, "");
  const phone = digits && !digits.startsWith("55") ? `55${digits}` : digits;
  const user: JsonObject = {};
  if (email) user.email = sha256(email);
  if (phone) user.phone = sha256(phone);
  const ttp = getCookie(request, "_ttp");
  if (ttp) user.ttp = ttp;
  const url = new URL(request.url);
  const ttclid = url.searchParams.get("ttclid")?.slice(0, 250);
  if (ttclid) user.ttclid = ttclid;
  const ip = request.headers.get("x-nf-client-connection-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) user.ip = ip.slice(0, 80);
  const userAgent = request.headers.get("user-agent");
  if (userAgent) user.user_agent = userAgent.slice(0, 300);

  try {
    const response = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_source: "web",
        event_source_id: pixelId,
        data: [{
          event: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: reference,
          user,
          properties: {
            currency: "BRL",
            value: Number((amount / 100).toFixed(2)),
            content_type: "product",
            contents: [{ content_id: reference, content_type: "product", quantity: 1, price: Number((amount / 100).toFixed(2)) }],
          },
          page: { url: `${getPublicOrigin(request)}/?pedido=${encodeURIComponent(reference)}` },
        }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) console.error("TikTok Events API rejected a purchase event:", response.status);
  } catch {
    console.error("TikTok Events API could not be reached.");
  }
}

export function makeOrderReference(storeId: string): string {
  return newOrderReference(storeId);
}
