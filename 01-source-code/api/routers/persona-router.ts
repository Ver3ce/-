import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { aiPersonas } from "@db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { listPersonas as listDefaultPersonas } from "../services/persona-service";

export const personaRouter = createRouter({
  // ===== 列出所有AI角色（系统预设 + 用户自定义） =====
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    // Get system defaults
    const defaults = await db
      .select()
      .from(aiPersonas)
      .where(and(eq(aiPersonas.isDefault, true), isNull(aiPersonas.userId)));

    // Get user's custom personas
    const customs = await db
      .select()
      .from(aiPersonas)
      .where(eq(aiPersonas.userId, ctx.user.id));

    return [...defaults, ...customs];
  }),

  // ===== 获取角色详情 =====
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(aiPersonas)
        .where(eq(aiPersonas.id, input.id));
      return result[0] ?? null;
    }),

  // ===== 创建自定义角色 =====
  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        systemPrompt: z.string().min(10),
        icon: z.string().optional(),
        category: z.enum(["resume", "interview", "career", "skill", "custom"]).default("custom"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [result] = await db.insert(aiPersonas).values({
        name: input.name,
        description: input.description,
        systemPrompt: input.systemPrompt,
        icon: input.icon ?? "bot",
        category: input.category,
        isCustom: true,
        userId: ctx.user.id,
      }).$returningId();

      return { id: result.id };
    }),

  // ===== 更新角色 =====
  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        systemPrompt: z.string().min(10).optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      await db
        .update(aiPersonas)
        .set(data)
        .where(eq(aiPersonas.id, id));

      return { success: true };
    }),

  // ===== 删除角色 =====
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(aiPersonas).where(eq(aiPersonas.id, input.id));
      return { success: true };
    }),

  // ===== 设置当前活跃角色 =====
  setActive: authedQuery
    .input(z.object({ personaId: z.number() }))
    .mutation(async () => {
      // TODO: Store active persona preference in user_profiles or localStorage
      return { success: true };
    }),

  // ===== 获取系统默认角色列表 =====
  listDefaults: publicQuery.query(() => {
    return listDefaultPersonas();
  }),
});
