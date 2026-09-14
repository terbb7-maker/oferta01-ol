import {
  asObject,
  cleanText,
  flevoRequest,
  getPublicOrigin,
  getCheckoutItems,
  getFlevoConfig,
  getShipping,
  getTrackingFromUrl,
  isSameOrigin,
  jsonResponse,
  makeOrderReference,
} from "../_lib";

export const runtime = "nodejs";

function digits(value: unknown): string {
  return cleanText(value, 40).replace(/\D/g, "");
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return jsonResponse({ error: "Requisição inválida." }, 403);

  const config = getFlevoConfig();
  if (!config) return jsonResponse({ error: "O pagamento está temporariamente indisponível." }, 503);

  const body = asObject(await request.json().catch(() => null));
  if (!body) return jsonResponse({ error: "Confira os dados do pedido e tente novamente." }, 400);

  const customerInput = asObject(body.customer) ?? {};
  const addressInput = asObject(body.address) ?? {};
  const customer = {
    name: cleanText(customerInput.name, 100),
    email: cleanText(customerInput.email, 254).toLowerCase(),
    document: digits(customerInput.document),
    phone: digits(customerInput.phone),
  };
  if (
    customer.name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
    customer.document.length !== 11 ||
    customer.phone.length < 10 ||
    customer.phone.length > 13
  ) {
    return jsonResponse({ error: "Confira nome, e-mail, CPF e celular." }, 400);
  }

  const checkout = getCheckoutItems(body.items, body.couponCode);
  const shipping = getShipping(body.shipping);
  const address = {
    street: cleanText(addressInput.street, 120),
    number: cleanText(addressInput.number, 30),
    complement: cleanText(addressInput.complement, 100),
    neighborhood: cleanText(addressInput.neighborhood, 100),
    city: cleanText(addressInput.city, 100),
    state: cleanText(addressInput.state, 2).toUpperCase(),
    zipcode: digits(addressInput.zipcode),
  };
  if (!checkout || !shipping) return jsonResponse({ error: "Seu pedido mudou. Atualize a sacola e tente novamente." }, 400);
  if (
    address.street.length < 2 || !address.number || address.neighborhood.length < 2 ||
    address.city.length < 2 || !/^[A-Z]{2}$/.test(address.state) || address.zipcode.length !== 8
  ) {
    return jsonResponse({ error: "Confira o endereço de entrega." }, 400);
  }

  const amount = checkout.total + shipping.price;
  if (!Number.isSafeInteger(amount) || amount > 100000000) {
    return jsonResponse({ error: "O valor do pedido é inválido." }, 400);
  }

  const reference = makeOrderReference(config.storeId);
  const origin = getPublicOrigin(request);
  const itemSummary = checkout.items
    .slice(0, 4)
    .map((item) => `${item.name} tam. ${item.size}${item.color ? ` ${item.color}` : ""} x${item.quantity}`)
    .join("; ");
  const payload = {
    amount,
    description: `${itemSummary} · ${shipping.name}`.slice(0, 240),
    reference,
    postback_url: new URL("/api/flevo/webhook", origin).toString(),
    source: "api_externa",
    customer,
    address,
    tracking: getTrackingFromUrl(new URL(request.url)),
  };

  try {
    const { response, data } = await flevoRequest("/transaction", config.secretKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const envelope = asObject(data);
    const transaction = asObject(envelope?.data) ?? envelope;
    const transactionId = transaction?.transaction_id ?? transaction?.id;
    const qrCode = transaction?.qr_code ?? transaction?.pix_code;
    const qrImage = transaction?.qr_code_base64;

    if (
      !response.ok ||
      !transaction ||
      !transactionId ||
      typeof qrCode !== "string" ||
      !qrCode.trim()
    ) {
      console.error("FlevoPay could not create the Pix charge:", response.status);
      return jsonResponse({ error: "Não foi possível gerar o Pix. Confira os dados e tente novamente." }, 502);
    }

    return jsonResponse({
      transactionId: String(transactionId),
      reference,
      qrCode,
      qrCodeImage: typeof qrImage === "string" && qrImage.startsWith("data:image/") ? qrImage : null,
      amount,
      expiresAt: cleanText(transaction.expires_at, 48) || null,
    }, 201);
  } catch {
    return jsonResponse({ error: "Não foi possível conectar ao serviço de pagamento. Tente novamente." }, 502);
  }
}
