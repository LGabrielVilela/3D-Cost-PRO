import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET não configurada — defina essa variável de ambiente.");
  }
  return new TextEncoder().encode(secret);
}

async function encrypt(expiresAt: number): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(getSecretKey());
}

async function decrypt(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

/** Cria a sessão (login bem-sucedido) e grava o cookie assinado. */
export async function createSession(): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const token = await encrypt(expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt),
    path: "/",
  });
}

/** Remove a sessão (logout). */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Verifica se a sessão do cookie atual é válida. */
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(COOKIE_NAME)?.value);
}

/**
 * Usado dentro de toda Server Action que lê/grava dados do banco: garante que
 * mesmo que o Proxy seja contornado, a mutação exige uma sessão válida.
 */
export async function requireSession(): Promise<void> {
  const authenticated = await verifySession();
  if (!authenticated) {
    throw new Error("Não autenticado.");
  }
}

/** Usado pelo Proxy (não pode importar `next/headers`) — decodifica um token de cookie bruto. */
export async function verifyToken(token: string | undefined): Promise<boolean> {
  return decrypt(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
