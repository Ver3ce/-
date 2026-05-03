import { z } from "zod";
import { createRouter, adminQuery, authedQuery, publicQuery } from "../middleware";
import { getDb, testConnection } from "../queries/connection";
import { systemSettings } from "@db/schema";
import { eq } from "drizzle-orm";

export const systemSettingsRouter = createRouter({
  // 健康检查 - 诊断数据库连接
  healthCheck: publicQuery.query(async () => {
    const result = await testConnection();
    return result;
  }),
  // Admin: Get a setting
  get: adminQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, input.key));
      return rows[0] ?? null;
    }),

  // Admin: Set a setting
  set: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = getDb();
        await db
          .insert(systemSettings)
          .values({
            key: input.key,
            value: input.value,
            description: input.description,
            updatedBy: ctx.user.id,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: input.value,
              description: input.description,
              updatedBy: ctx.user.id,
              updatedAt: new Date(),
            },
          });
        return { success: true };
      } catch (error: any) {
        console.error("[systemSettings.set] Error:", error);
        throw new Error(`保存失败: ${error?.message || "数据库操作错误"}`);
      }
    }),

  // Admin: List all settings
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(systemSettings);
  }),

  // Public: Get the active API key (returns masked for non-admin)
  getApiKey: authedQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "kimi_api_key"));
    const setting = rows[0];
    if (!setting?.value) return { configured: false, key: null };
    const key = setting.value;
    return {
      configured: true,
      key: key.length > 12 ? `${key.slice(0, 6)}...${key.slice(-6)}` : "***",
    };
  }),
});
