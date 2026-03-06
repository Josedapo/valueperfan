import { createHmac } from "node:crypto";
import { env, COOKIE_MAX_AGE } from "./config";

function getSecret(): string {
  return env.claimSecret;
}

function hmac(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("hex");
}

export function signCookie(email: string): string {
  const payload = Buffer.from(`${email}:${Date.now()}`).toString("base64url");
  const signature = hmac(payload);
  return `${payload}.${signature}`;
}

export function verifyCookie(value: string): string | null {
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;

  const payload = value.slice(0, dot);
  const signature = value.slice(dot + 1);

  if (hmac(payload) !== signature) return null;

  const decoded = Buffer.from(payload, "base64url").toString();
  const colonIndex = decoded.lastIndexOf(":");
  if (colonIndex === -1) return null;

  return decoded.slice(0, colonIndex);
}

export function getSetCookieHeader(email: string): string {
  const value = signCookie(email);
  const maxAge = COOKIE_MAX_AGE;
  return `vpf_session=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function adminSignature(action: string, id: number): string {
  return hmac(`${action}:${id}`);
}

export function verifyAdminSignature(
  action: string,
  id: number,
  sig: string
): boolean {
  return hmac(`${action}:${id}`) === sig;
}
