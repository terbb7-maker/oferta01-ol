import { createAdminSession, expiredSessionCookie, isAdminCredential, sessionCookie } from "../_auth";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null) as { login?: unknown; password?: unknown } | null;
  if (!body || !isAdminCredential(body.login, body.password)) {
    return Response.json({ error: "Login ou senha inválidos." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const secure = new URL(request.url).protocol === "https:";
  return Response.json({ ok: true }, {
    headers: { "Cache-Control": "no-store", "Set-Cookie": sessionCookie(createAdminSession(), secure) },
  });
}

export async function DELETE(request: Request): Promise<Response> {
  const secure = new URL(request.url).protocol === "https:";
  return Response.json({ ok: true }, {
    headers: { "Cache-Control": "no-store", "Set-Cookie": expiredSessionCookie(secure) },
  });
}
