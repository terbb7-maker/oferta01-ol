import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "olympikus_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 12;

function credentials() {
  return {
    login: process.env.ADMIN_LOGIN?.trim() || "TB",
    password: process.env.ADMIN_PASSWORD || "777",
  };
}

function signingSecret() {
  const { login, password } = credentials();
  return process.env.ADMIN_SESSION_SECRET?.trim() || `olympikus-admin:${login}:${password}`;
}

function signature(payload: string) {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

export function isAdminCredential(login: unknown, password: unknown): boolean {
  const expected = credentials();
  return login === expected.login && password === expected.password;
}

export function createAdminSession(): string {
  const payload = `TB.${Date.now()}`;
  return `${payload}.${signature(payload)}`;
}

export function isAdminSession(value: string | undefined): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "TB") return false;
  const issuedAt = Number(parts[1]);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_MAX_AGE * 1000 || issuedAt > Date.now() + 60_000) return false;
  const expected = Buffer.from(signature(`${parts[0]}.${parts[1]}`));
  const received = Buffer.from(parts[2]);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function readAdminCookie(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const item = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`));
  return item ? decodeURIComponent(item.slice(ADMIN_COOKIE.length + 1)) : undefined;
}

export function sessionCookie(value: string, secure: boolean): string {
  return `${ADMIN_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function expiredSessionCookie(secure: boolean): string {
  return `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}
