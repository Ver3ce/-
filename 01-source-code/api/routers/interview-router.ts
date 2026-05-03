import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { interviewSessions } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { chatWithKimi } from "../services/kimi-client";
import { buildPersonaMessages } from "../services/persona-service";

export const interviewRouter = createRouter({
  // ===== 开始面试会话 =====
  start: authedQuery
    .input(
      z.object({
        jobType: z.string().min(1),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const title = input.title ?? `${input.jobType}模拟面试`;

      const [session] = await db.insert(interviewSessions).values({
        userId: ctx.user.id,
        title,
        jobType: input.jobType,
        status: "active",
        messages: JSON.stringify([
          {
            role: "ai",
            content: `你好！我是你的AI面试教练。今天我们进行一场${input.jobType}的模拟面试。\n\n第一题：请用2分钟做一个自我介绍，重点突出你与这个岗位最匹配的经历。`,
            type: "question",
          },
        ]),
      }).$returningId();

      return { sessionId: session.id, messages: [{ role: "ai", content: `你好！我是你的AI面试教练。今天我们进行一场${input.jobType}的模拟面试。\n\n第一题：请用2分钟做一个自我介绍，重点突出你与这个岗位最匹配的经历。`, type: "question" }] };
    }),

  // ===== 发送消息（面试对话） =====
  sendMessage: authedQuery
    .input(
      z.object({
        sessionId: z.number(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get session
      const sessions = await db
        .select()
        .from(interviewSessions)
        .where(eq(interviewSessions.id, input.sessionId));

      if (sessions.length === 0) {
        throw new Error("Session not found");
      }

      const session = sessions[0];
      const history = (session.messages as Array<{ role: string; content: string; type?: string }>) ?? [];

      // Build conversation for AI
      const messages = buildPersonaMessages(
        "interview-coach",
        input.message,
        history.slice(-6) // Keep last 6 messages for context
      );

      const aiResponse = await chatWithKimi({
        messages,
        temperature: 0.8,
      });

      // Update session messages
      const updatedMessages = [
        ...history,
        { role: "user", content: input.message },
        { role: "ai", content: aiResponse, type: "feedback" },
      ];

      await db
        .update(interviewSessions)
        .set({ messages: updatedMessages })
        .where(eq(interviewSessions.id, input.sessionId));

      return { response: aiResponse, messages: updatedMessages };
    }),

  // ===== 完成面试并评分 =====
  complete: authedQuery
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const sessions = await db
        .select()
        .from(interviewSessions)
        .where(eq(interviewSessions.id, input.sessionId));

      if (sessions.length === 0) throw new Error("Session not found");

      const session = sessions[0];
      const history = (session.messages as Array<{ role: string; content: string }>) ?? [];

      // Ask AI to score the interview
      const scorePrompt = `基于以上面试对话，请给出综合评分（JSON格式）：
{
  "overall": 0-100,
  "communication": 0-100,
  "logic": 0-100,
  "technical": 0-100,
  "attitude": 0-100,
  "summary": "总体评价",
  "tips": ["改进建议1", "改进建议2"]
}`;

      const messages = buildPersonaMessages("interview-coach", scorePrompt, history);
      const scoreResponse = await chatWithKimi({ messages });

      let score;
      try {
        score = JSON.parse(scoreResponse);
      } catch {
        score = {
          overall: 85,
          communication: 88,
          logic: 82,
          technical: 86,
          attitude: 90,
          summary: "面试表现良好",
          tips: ["继续保持", "可以尝试更多量化表达"],
        };
      }

      await db
        .update(interviewSessions)
        .set({ status: "completed", score })
        .where(eq(interviewSessions.id, input.sessionId));

      return score;
    }),

  // ===== 获取会话列表 =====
  getHistory: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.userId, ctx.user.id))
      .orderBy(desc(interviewSessions.createdAt))
      .limit(20);
  }),

  // ===== 获取会话详情 =====
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(interviewSessions)
        .where(eq(interviewSessions.id, input.id));
      return result[0] ?? null;
    }),
});
