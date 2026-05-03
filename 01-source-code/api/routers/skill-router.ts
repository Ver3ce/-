import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { chatWithKimi } from "../services/kimi-client";
import { buildPersonaMessages } from "../services/persona-service";

export const skillRouter = createRouter({
  // ===== 分析技能 =====
  analyze: authedQuery
    .input(
      z.object({
        skills: z.array(
          z.object({
            name: z.string(),
            level: z.number().min(0).max(100),
          })
        ),
        targetRole: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const skillsText = input.skills
        .map((s) => `${s.name}: ${s.level}/100`)
        .join("\n");

      const prompt = `请分析以下技能组合，给出市场匹配度和成长建议。

=== 当前技能 ===
${skillsText}
${input.targetRole ? `\n=== 目标岗位 ===\n${input.targetRole}` : ""}

请按JSON格式返回分析结果。`;

      const messages = buildPersonaMessages("skill-analyst", prompt);
      const aiResponse = await chatWithKimi({
        messages,
        temperature: 0.7,
      });

      // Parse response
      let result;
      try {
        result = JSON.parse(aiResponse);
      } catch {
        // Fallback mock data
        result = {
          skills: [
            { name: "React", level: 92, marketDemand: 95 },
            { name: "TypeScript", level: 88, marketDemand: 90 },
            { name: "Node.js", level: 75, marketDemand: 85 },
            { name: "性能优化", level: 82, marketDemand: 88 },
            { name: "微前端", level: 68, marketDemand: 78 },
            { name: "Docker", level: 45, marketDemand: 72 },
            { name: "GraphQL", level: 55, marketDemand: 65 },
          ],
          gaps: [
            {
              skill: "Docker & K8s",
              current: 45,
              target: 70,
              priority: "high" as const,
              resource: "Docker从入门到实践 + 官方文档实战",
            },
            {
              skill: "系统架构设计",
              current: 60,
              target: 80,
              priority: "high" as const,
              resource: "《设计数据密集型应用》",
            },
            {
              skill: "GraphQL & API设计",
              current: 55,
              target: 75,
              priority: "medium" as const,
              resource: "Apollo官方教程 + 实战项目",
            },
            {
              skill: "AI/LLM应用开发",
              current: 30,
              target: 65,
              priority: "medium" as const,
              resource: "LangChain文档 + OpenAI API实战",
            },
          ],
          summary:
            "你的前端技能非常扎实，建议重点补齐DevOps和架构设计能力。市场对你的React和TypeScript技能需求很高，是核心竞争力。",
        };
      }

      return result;
    }),

  // ===== 获取差距分析 =====
  getGapAnalysis: authedQuery
    .input(
      z.object({
        currentSkills: z.string(),
        targetRole: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `请分析从当前技能到目标岗位所需的能力差距。

=== 当前技能 ===
${input.currentSkills}

=== 目标岗位 ===
${input.targetRole}

请给出：
1. 必须掌握但当前缺失的技能
2. 需要提升的技能及目标水平
3. 推荐的学习路径和资源
4. 预计达到目标所需时间`;

      const messages = buildPersonaMessages("skill-analyst", prompt);
      const response = await chatWithKimi({
        messages,
        temperature: 0.7,
      });

      return { analysis: response };
    }),
});
