import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb, testConnection } from "./queries/connection";
import { users } from "@db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signJWT, verifyJWT } from "./lib/jwt";
import { env } from "./lib/env";

/**
 * 认证路由
 * 支持三种登录方式：
 * 1. 用户名+密码登录（传统登录）
 * 2. 用户名+密码注册
 * 3. OAuth 2.0 登录（Kimi OAuth）
 */

export const authRouter = createRouter({
  // ===== OAuth: Get Login URL =====
  url: publicQuery
    .input(z.object({ redirectUrl: z.string().optional() }))
    .query(async ({ input }) => {
      const state = Buffer.from(
        JSON.stringify({ redirectUrl: input.redirectUrl ?? `${process.env.VITE_API_URL ?? "http://localhost:3000"}/dashboard` }),
      ).toString("base64");

      const params = new URLSearchParams({
        client_id: env.appId,
        response_type: "code",
        scope: "",
        redirect_uri: `${process.env.VITE_API_URL ?? "http://localhost:3000"}/api/oauth/callback`,
        state,
      });

      const url = `${env.kimiAuthUrl}/login/oauth/authorize?${params.toString()}`;
      return { url };
    }),

  // ===== OAuth: Callback =====
  callback: publicQuery
    .input(
      z.object({
        code: z.string(),
        state: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const tokenRes = await fetch(`${env.kimiAuthUrl}/login/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: env.appId,
          client_secret: env.appSecret,
          grant_type: "authorization_code",
          code: input.code,
          redirect_uri: `${process.env.VITE_API_URL ?? "http://localhost:3000"}/api/oauth/callback`,
        }),
      });

      if (!tokenRes.ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to get access token" });
      }

      const tokenData = await tokenRes.json() as any;
      const accessToken = tokenData.access_token;

      const userRes = await fetch(`${env.kimiOpenUrl}/v1/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userRes.ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to get user info" });
      }

      const kimiUser = await userRes.json() as any;
      const db = getDb();

      let existing = await db
        .select()
        .from(users)
        .where(eq(users.unionId, kimiUser.id))
        .limit(1);

      if (existing.length === 0 && kimiUser.email) {
        existing = await db
          .select()
          .from(users)
          .where(eq(users.email, kimiUser.email))
          .limit(1);
      }

      let user;
      if (existing.length > 0) {
        await db
          .update(users)
          .set({
            name: kimiUser.name ?? existing[0].name,
            avatar: kimiUser.avatar_url ?? existing[0].avatar,
            lastSignInAt: new Date(),
            ...(kimiUser.id ? { unionId: kimiUser.id } : {}),
          })
          .where(eq(users.id, existing[0].id));
        user = { ...existing[0], name: kimiUser.name ?? existing[0].name };
      } else {
        const result = await db.insert(users).values({
          unionId: kimiUser.id,
          name: kimiUser.name,
          email: kimiUser.email,
          avatar: kimiUser.avatar_url,
          role: "user",
          lastSignInAt: new Date(),
        }).$returningId();
        user = { id: result[0].id, ...kimiUser };
      }

      const token = await signJWT({ userId: user.id });
      return { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar_url, role: user.role ?? "user" } };
    }),

  // ===== Traditional: Register =====
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6).max(100),
        email: z.string().email().optional(),
        name: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();

        // Check if username exists
        const existingUsername = await db
          .select()
          .from(users)
          .where(eq(users.username, input.username))
          .limit(1);

        if (existingUsername.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "用户名已存在" });
        }

        // Check if email exists
        if (input.email) {
          const existingEmail = await db
            .select()
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);
          if (existingEmail.length > 0) {
            throw new TRPCError({ code: "CONFLICT", message: "邮箱已被注册" });
          }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 12);

        // Create user
        const result = await db.insert(users).values({
          username: input.username,
          password: hashedPassword,
          name: input.name ?? input.username,
          email: input.email,
          role: "user",
          lastSignInAt: new Date(),
        }).$returningId();

        const userId = result[0].id;

        // Generate token
        const token = await signJWT({ userId });

        return {
          token,
          user: {
            id: userId,
            username: input.username,
            name: input.name ?? input.username,
            email: input.email,
            role: "user",
          },
        };
      } catch (e: any) {
        if (e.code === "CONFLICT") throw e;
        console.error("[register] DB error:", e?.message, e?.cause?.message);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `数据库错误: ${e?.message || "未知错误"}` });
      }
    }),

  // ===== Traditional: Login =====
  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();

        // Find user by username or email
        const userRows = await db
          .select()
          .from(users)
          .where(or(
            eq(users.username, input.username),
            eq(users.email, input.username),
          ))
          .limit(1);

        if (userRows.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
        }

        const user = userRows[0];

        // Check password
        if (!user.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "该用户未设置密码，请使用OAuth登录" });
        }

        const valid = await bcrypt.compare(input.password, user.password);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "密码错误" });
        }

        // Update last sign in
        await db
          .update(users)
          .set({ lastSignInAt: new Date() })
          .where(eq(users.id, user.id));

        // Generate token
        const token = await signJWT({ userId: user.id });

        return {
          token,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          },
        };
      } catch (e: any) {
        if (e.code && ["NOT_FOUND", "UNAUTHORIZED"].includes(e.code)) throw e;
        console.error("[login] ===== DB ERROR =====");
        console.error("[login] message:", e?.message);
        console.error("[login] cause:", e?.cause);
        console.error("[login] cause.message:", e?.cause?.message);
        console.error("[login] cause.code:", e?.cause?.code);
        console.error("[login] stack:", e?.stack);
        console.error("[login] ====================");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `数据库错误: ${e?.cause?.message || e?.message || "未知错误"}` });
      }
    }),

  // ===== Diagnostic: Test DB Connection =====
  testDb: publicQuery.query(async () => {
    const result = await testConnection();
    return result;
  }),

  // ===== Logout =====
  logout: publicQuery.mutation(() => {
    return { success: true };
  }),

  // ===== Get Current User =====
  me: publicQuery.query(async ({ ctx }) => {
    const token = (ctx.req as any)?.headers?.get?.("authorization")?.replace("Bearer ", "") ?? "";
    if (!token) return null;

    try {
      const payload = await verifyJWT<{ userId: number }>(token);
      if (!payload?.userId) return null;

      const db = getDb();
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId));

      if (rows.length === 0) return null;
      const user = rows[0];
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      };
    } catch {
      return null;
    }
  }),
});
