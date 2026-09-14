import {
  asObject,
  approvedTransactionStatus,
  cleanText,
  flevoRequest,
  getFlevoConfig,
  jsonResponse,
  sendTikTokPurchaseEvent,
} from "../_lib";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const config = getFlevoConfig();
  if (!config) return jsonResponse({ error: "Webhook indisponível." }, 503);

  const notification = asObject(await request.json().catch(() => null));
  const reference = cleanText(notification?.external_id ?? notification?.store_reference, 100);
  if (!reference.startsWith(`OLY-${config.storeId}-`)) {
    return jsonResponse({ received: true });
  }

  try {
    const { response, data } = await flevoRequest(
      `/query?action=list_transactions&external_id=${encodeURIComponent(reference)}`,
      config.secretKey,
    );
    if (!response.ok) return jsonResponse({ error: "Confirmação pendente." }, 503);

    const rows = Array.isArray(data) ? data : (() => {
      const envelope = asObject(data);
      return Array.isArray(envelope?.data) ? envelope.data : [];
    })();
    const transaction = rows
      .map(asObject)
      .find((row) => cleanText(row?.external_id ?? row?.store_reference, 100) === reference);

    if (transaction && approvedTransactionStatus(transaction.status) === "approved") {
      await sendTikTokPurchaseEvent(request, transaction);
    }
    return jsonResponse({ received: true });
  } catch {
    return jsonResponse({ error: "Confirmação pendente." }, 503);
  }
}
