import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Fitur sesi login: cookie HTTP-only berisi token bertanda tangan, bukan password.
const COOKIE_NAME = "freshwash_session";
function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("AUTH_SECRET harus minimal 32 karakter di .env.local");
  return new TextEncoder().encode(secret);
}
export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "cashier";
};
export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}
export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.id !== "number" || typeof payload.role !== "string")
      return null;
    return {
      id: payload.id,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role === "admin" ? "admin" : "cashier",
    };
  } catch {
    return null;
  }
}
export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}
