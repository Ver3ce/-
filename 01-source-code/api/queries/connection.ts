import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    instance = drizzle(env.databaseUrl, {
      mode: "default",
      schema: fullSchema,
    });
  }
  return instance;
}

/**
 * 测试数据库连接，用于诊断
 */
export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const conn = await createConnection(env.databaseUrl);
    const [rows] = await conn.execute("SELECT 1 as test, version() as version");
    await conn.end();
    return { ok: true, message: `连接成功: ${JSON.stringify(rows)}` };
  } catch (e: any) {
    return { ok: false, message: `连接失败: ${e?.message || String(e)}` };
  }
}
