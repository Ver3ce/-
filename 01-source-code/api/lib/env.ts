import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// 获取当前文件目录（ESM 兼容）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 显式从项目根目录加载 .env（解决 Windows 路径问题）
const envPaths = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "..", ".env"),
  resolve(__dirname, "..", "..", ".env"),
  resolve(__dirname, "..", "..", "..", ".env"),
];

let loaded = false;
for (const p of envPaths) {
  try {
    const result = config({ path: p });
    if (!result.error) {
      loaded = true;
      break;
    }
  } catch {
    // 忽略错误，尝试下一个路径
  }
}

if (!loaded) {
  console.warn("[env] 警告: 未能从任何路径加载 .env 文件，将使用环境变量或默认值");
}

function required(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (fallback) return fallback;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`缺少必要的环境变量: ${name}`);
  }
  console.warn(`[env] 警告: 环境变量 ${name} 未设置`);
  return "";
}

// 本地开发 fallback：如果 DATABASE_URL 没设置，默认连本地 MySQL
const localDbUrl = "mysql://root:123456@localhost:3306/aurora_career";

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL", localDbUrl),
  kimiAuthUrl: required("KIMI_AUTH_URL", "https://auth.kimi.com"),
  kimiOpenUrl: required("KIMI_OPEN_URL", "https://open.kimi.com"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};

// 开发环境打印（确认配置加载正确）
if (!env.isProduction) {
  console.log("[env] DATABASE_URL:", env.databaseUrl.replace(/\/\/.*?:.*?@/, "//***:***@"));
}
