import {
  asObject,
  approvedTransactionStatus,
  cleanText,
  flevoRequest,
  getFlevoConfig,
  isSameOrigin,
  jsonResponse,
  sendTikTokPurchaseEvent,
} from "../_lib";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return jsonResponse({ error: "Requisição inválida." }, 403);

  const config = getFlevoConfig();
  if (!config) return jsonResponse({ error: "O pagamento está temporariamente indisponível." }, 503);

  const url = new URL(request.url);
  const transactionId = cleanText(url.searchParams.get("transaction_id"), 80);
  const reference = cleanText(url.searchParams.get("reference"), 100);
  if (!transactionId || !reference.startsWith(`OLY-${config.storeId}-`)) {
    return jsonResponse({ error: "Pedido não encontrado." }, 404);
  }

  try {
    const { response, data } = await flevoRequest(
      `/query?action=get_transaction&id=${encodeURIComponent(transactionId)}`,
      config.secretKey,
    );
    const envelope = asObject(data);
    const transaction = asObject(envelope?.data) ?? asObject(envelope?.transaction) ?? envelope;
    if (!response.ok || !transaction) {
      return jsonResponse({ error: "Não foi possível consultar o pagamento." }, 502);
    }

    const externalId = cleanText(transaction.external_id ?? transaction.store_reference, 100);
    if (externalId !== reference) return jsonResponse({ error: "Pedido não encontrado." }, 404);

    const status = approvedTransactionStatus(transaction.status);
    if (status === "approved") await sendTikTokPurchaseEvent(request, transaction);

    return jsonResponse({ status, reference });
  } catch {
    return jsonResponse({ error: "Não foi possível consultar o pagamento." }, 502);
  }
}
