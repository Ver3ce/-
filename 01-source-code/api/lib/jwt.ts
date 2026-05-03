import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

const SECRET = new TextEncoder().encode(env.appSecret || "default-secret-key-change-in-production");

export async function signJWT(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyJWT<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
    return payload as T;
  } catch {
    return null;
  }
}
