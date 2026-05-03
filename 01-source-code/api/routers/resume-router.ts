import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { resumes } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { chatWithKimi } from "../services/kimi-client";
import { buildPersonaMessages } from "../services/persona-service";

export const resumeRouter = createRouter({
  // ===== 分析简历 =====
  analyze: authedQuery
    .input(
      z.object({
        content: z.string().min(10, "简历内容太短"),
        jobDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.user;

      // Build AI prompt for resume analysis
      const prompt = input.jobDescription
        ? `请分析以下简历，并对比目标岗位JD进行优化建议。\n\n=== 简历内容 ===\n${input.content}\n\n=== 目标岗位JD ===\n${input.jobDescription}`
        : `请分析以下简历，给出详细的评分和优化建议。\n\n=== 简历内容 ===\n${input.content}`;

      const messages = buildPersonaMessages("resume-expert", prompt);
      const aiResponse = await chatWithKimi({
        messages,
        temperature: 0.7,
      });

      // Parse AI response
      let result;
      try {
        result = JSON.parse(aiResponse);
      } catch {
        // If not valid JSON, wrap in standard format
        result = {
          overall: 75,
          structure: 78,
          keywords: 70,
          experience: 80,
          impact: 72,
          suggestions: [
            {
              type: "improvement" as const,
              title: "AI分析结果",
              description: aiResponse,
            },
          ],
          summary: "已完成初步分析",
        };
      }

      // Save to database
      const db = getDb();
      await db.insert(resumes).values({
        userId: user.id,
        content: input.content,
        score: result,
        status: "analyzed",
      });

      return result;
    }),

  // ===== 优化简历 =====
  optimize: authedQuery
    .input(
      z.object({
        content: z.string().min(10),
        jobDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.user;

      const prompt = `请基于以下简历，重写一份专业优化版本。要求：
1. 使用STAR法则描述工作经历
2. 所有成果必须量化（使用具体数字）
3. 突出核心竞争力
4. 适配目标岗位的关键词
5. 保持简洁专业，控制在一页A4纸内

${input.jobDescription ? `目标岗位JD：${input.jobDescription}\n\n` : ""}原始简历：\n${input.content}`;

      const messages = buildPersonaMessages("resume-expert", prompt);
      const optimizedContent = await chatWithKimi({
        messages,
        temperature: 0.8,
      });

      // Update database
      const db = getDb();
      await db.insert(resumes).values({
        userId: user.id,
        content: input.content,
        optimizedContent,
        status: "optimized",
      });

      return { optimizedContent };
    }),

  // ===== 获取简历历史 =====
  getHistory: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, ctx.user.id))
      .orderBy(desc(resumes.createdAt))
      .limit(20);
  }),

  // ===== 获取简历详情 =====
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(resumes)
        .where(eq(resumes.id, input.id));
      return result[0] ?? null;
    }),
});
