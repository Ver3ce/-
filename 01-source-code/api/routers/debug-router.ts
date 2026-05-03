import { createRouter, publicQuery } from "../middleware";
import { getDb, testConnection } from "../queries/connection";
import { users, systemSettings } from "@db/schema";
import { count } from "drizzle-orm";

/**
 * 调试路由 - 用于诊断系统状态
 * 仅在开发环境使用
 */
export const debugRouter = createRouter({
  // 系统健康检查
  health: publicQuery.query(async () => {
    const dbCheck = await testConnection();
    
    let tables = {};
    let userCount = 0;
    let settingsCount = 0;
    
    if (dbCheck.ok) {
      try {
        const db = getDb();
        // 检查用户表
        const [userResult] = await db.select({ count: count() }).from(users);
        userCount = userResult?.count || 0;
        
        // 检查系统设置表
        const [settingsResult] = await db.select({ count: count() }).from(systemSettings);
        settingsCount = settingsResult?.count || 0;
        
        tables = {
          users: { exists: true, count: userCount },
          systemSettings: { exists: true, count: settingsCount }
        };
      } catch (e: any) {
        tables = { error: e.message };
      }
    }
    
    return {
      timestamp: new Date().toISOString(),
      database: dbCheck,
      tables,
      env: {
        databaseUrlConfigured: !!process.env.DATABASE_URL,
        appId: process.env.APP_ID || "not set"
      }
    };
  }),
  
  // 初始化数据库（插入测试数据）
  initDatabase: publicQuery.mutation(async () => {
    try {
      const db = getDb();
      
      // 检查是否已有数据
      const [existingUsers] = await db.select({ count: count() }).from(users);
      if (existingUsers.count > 0) {
        return { 
          success: false, 
          message: "数据库已有数据，跳过初始化",
          users: existingUsers.count
        };
      }
      
      // 插入测试用户
      await db.insert(users).values([
        {
          username: "admin",
          password: "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW", // admin123
          name: "系统管理员",
          email: "admin@aurora.career",
          role: "admin",
          lastSignInAt: new Date()
        },
        {
          username: "zhangsan",
          password: "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW", // 123456
          name: "张三",
          email: "zhangsan@test.com",
          role: "user",
          lastSignInAt: new Date()
        }
      ]);
      
      // 插入默认系统设置
      await db.insert(systemSettings).values([
        { key: "site_name", value: "极光职途", description: "网站名称" },
        { key: "site_description", value: "AI驱动的职业加速引擎", description: "网站描述" },
        { key: "kimi_api_key", value: "", description: "Kimi AI API Key" }
      ]);
      
      return { 
        success: true, 
        message: "数据库初始化成功",
        users: 2,
        settings: 3
      };
    } catch (e: any) {
      console.error("[initDatabase] Error:", e);
      return { 
        success: false, 
        message: `初始化失败: ${e.message}`,
        error: e.message
      };
    }
  })
});
