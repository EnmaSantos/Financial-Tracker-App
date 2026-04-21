import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/**
 * Stateless sessions. The browser holds a signed JWT in an HttpOnly cookie;
 * the server verifies it on every request. Payload is intentionally minimal
 * (just the userId) — everything else is re-fetched from the database.
 *
 * See node_modules/next/dist/docs/01-app/02-guides/authentication.md for the
 * Next.js 16 reference implementation this follows.
 */

const COOKIE_NAME = "session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to apps/web/.env.local.",
    );
  }
  return new TextEncoder().encode(secret);
}

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    // Invalid signature / expired / malformed — treat as logged out.
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = Date.now() + MAX_AGE_MS;
  const token = await encrypt({ userId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt),
    path: "/",
  });
}

export async function readSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  const payload = await decrypt(token);
  if (!payload) return null;
  if (payload.expiresAt && payload.expiresAt < Date.now()) return null;
  return payload;
}

export async function deleteSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
