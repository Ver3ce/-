import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyJWT } from "./lib/jwt";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { verifySessionToken } from "./kimi/session";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

async function authenticateJWT(headers: Headers): Promise<User | null> {
  const authHeader = headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  
  const token = authHeader.slice(7);
  const payload = await verifyJWT<{ userId: number }>(token);
  if (!payload?.userId) return null;
  
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId));
  
  return rows[0] || null;
}

async function authenticateCookie(headers: Headers): Promise<User | null> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) return null;
  
  const claim = await verifySessionToken(token);
  if (!claim?.unionId) return null;
  
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.unionId, claim.unionId));
  
  return rows[0] || null;
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    // Try JWT authentication first (for local login)
    ctx.user = await authenticateJWT(opts.req.headers);
    
    // Fall back to cookie authentication (for OAuth)
    if (!ctx.user) {
      ctx.user = await authenticateCookie(opts.req.headers);
    }
  } catch (e) {
    // Authentication is optional here
    console.warn("[context] Authentication failed:", e);
  }
  return ctx;
}
