/**
 * Kimi API Client - 极光职途的AI引擎
 * 
 * API Key 优先级：
 * 1. 管理员配置的全局 API Key（所有用户使用）
 * 2. 环境变量 KIMI_API_KEY
 * 3. 模拟模式（返回预设数据）
 * 
 * 管理员请在管理后台 → API设置 中配置全局 API Key
 * 用户无需关心 API Key，系统自动使用管理员配置的 Key
 */

import { getDb } from "../queries/connection";
import { systemSettings } from "@db/schema";
import { eq } from "drizzle-orm";

// ===== Types =====
export interface KimiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface KimiChatOptions {
  messages: KimiMessage[];
  model?: string;
  temperature?: number;
  stream?: boolean;
  apiKey?: string;
}

// ===== Constants =====
const KIMI_API_BASE = "https://api.moonshot.cn/v1";
const DEFAULT_MODEL = "moonshot-v1-8k";

// ===== Get Admin API Key =====
async function getAdminApiKey(): Promise<string | null> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "kimi_api_key"));
    if (rows[0]?.value) return rows[0].value;
  } catch {
    // Database might not be available during build
  }

  // Fallback to env
  const envKey = process.env.KIMI_API_KEY;
  if (envKey?.startsWith("sk-")) return envKey;
  return null;
}

// ===== Get effective API key =====
async function getEffectiveApiKey(userApiKey?: string): Promise<string | null> {
  // Priority 1: User's own key (if provided)
  if (userApiKey?.startsWith("sk-")) return userApiKey;
  // Priority 2: Admin configured global key
  const adminKey = await getAdminApiKey();
  if (adminKey) return adminKey;
  // Priority 3: Fallback
  return null;
}

// ===== Check if API is available =====
export async function isKimiAvailable(userApiKey?: string): Promise<boolean> {
  const key = await getEffectiveApiKey(userApiKey);
  return key !== null;
}

// ===== Core: Chat with Kimi =====
export async function chatWithKimi(options: KimiChatOptions): Promise<string> {
  const apiKey = await getEffectiveApiKey(options.apiKey);

  if (!apiKey) {
    console.warn("[KimiClient] No API key configured. Using mock mode.");
    return getMockResponse(options.messages);
  }

  try {
    const response = await fetch(`${KIMI_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[KimiClient] API error: ${response.status} ${errorText}`);
      return getMockResponse(options.messages);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content ?? "暂无回复";
  } catch (error) {
    console.error("[KimiClient] Error:", error);
    return getMockResponse(options.messages);
  }
}

// ===== Stream Chat =====
export async function* streamChatWithKimi(options: KimiChatOptions) {
  const apiKey = await getEffectiveApiKey(options.apiKey);

  if (!apiKey) {
    const response = getMockResponse(options.messages);
    for (const chunk of response.split("")) {
      await new Promise((r) => setTimeout(r, 10));
      yield chunk;
    }
    return;
  }

  const response = await fetch(`${KIMI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch { /* skip */ }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ===== Mock Responses =====
function getMockResponse(messages: KimiMessage[]): string {
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content ?? "";
  const systemMsg = messages.find((m) => m.role === "system")?.content ?? "";

  if (systemMsg.includes("简历")) {
    return JSON.stringify({
      overall: 78, structure: 82, keywords: 65, experience: 85, impact: 72,
      suggestions: [
        { type: "critical", title: "缺少量化成果", description: "工作经历中使用了'负责'、'参与'等模糊词汇，建议改用数据驱动的表述。" },
        { type: "critical", title: "技能关键词不匹配", description: "目标岗位JD中出现的关键词在简历中未体现。" },
        { type: "improvement", title: "个人优势不突出", description: "建议在前3行添加'个人亮点'模块。" },
        { type: "good", title: "教育背景完整", description: "学历信息、专业等关键信息齐全。" },
      ],
      summary: "简历整体结构良好，但需要加强量化表达和关键词匹配。",
    });
  }

  if (systemMsg.includes("面试")) {
    if (lastUserMsg.includes("自我介绍")) {
      return `💡 **点评**：自我介绍结构清晰，但可更精炼。\n\n**改进建议**：\n1. 控制在90秒内\n2. 使用「标签+数据+匹配度」公式\n3. 加入一个让人记住的亮点\n\n**示范**：\n"我是一个喜欢把加载时间从4秒变成1秒的人。5年前端经验，主导过3个千万级用户产品的架构升级。"`;
    }
    return `💡 **点评**：很好的回答角度。\n\n**建议**：尝试用STAR法则组织答案，并加入量化数据。\n\n**得分参考**：\n- 沟通表达：8/10\n- 逻辑结构：7/10\n- 内容深度：8/10`;
  }

  if (systemMsg.includes("技能")) {
    return JSON.stringify({
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
        { skill: "Docker & K8s", current: 45, target: 70, priority: "high", resource: "Docker从入门到实践" },
        { skill: "系统架构设计", current: 60, target: 80, priority: "high", resource: "设计数据密集型应用" },
      ],
      summary: "前端技能扎实，建议补齐DevOps和架构设计能力。",
    });
  }

  return `收到你的问题！作为你的AI职业顾问，我的建议是：\n\n1. **短期目标**（3个月内）：完善简历量化成果，补齐高市场需求技能\n2. **中期目标**（6-12个月）：争取晋升或跳槽到更匹配的平台\n3. **长期目标**（3-5年）：建立个人品牌\n\n如果需要更详细的规划，告诉我更多背景信息。`;
}
