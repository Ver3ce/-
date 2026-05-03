/**
 * Database Seeder - Initialize system data and test users
 * Run: npx tsx db/seed.ts
 */
import { getDb } from "../api/queries/connection";
import { products, systemSettings, users, userProfiles } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();

  console.log("🌱 Seeding database...");

  // ===== 1. Seed products =====
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    await db.insert(products).values([
      {
        name: "简历诊断（单次）",
        description: "AI深度分析简历，生成评分报告和优化建议",
        price: "9.9",
        originalPrice: "29.9",
        type: "resume",
        features: JSON.stringify(["简历评分", "优化建议", "关键词分析", "1次使用"]),
        sortOrder: 1,
      },
      {
        name: "简历优化包",
        description: "简历重写+排版优化+求职信生成",
        price: "49",
        originalPrice: "99",
        type: "resume",
        features: JSON.stringify(["简历重写", "排版优化", "求职信", "7天有效"]),
        sortOrder: 2,
      },
      {
        name: "模拟面试（单次）",
        description: "1v1沉浸式AI面试训练，含评分报告",
        price: "19.9",
        originalPrice: "49.9",
        type: "interview",
        features: JSON.stringify(["5道精选题", "实时反馈", "评分报告", "1次使用"]),
        sortOrder: 3,
      },
      {
        name: "全能求职套餐",
        description: "简历优化+面试训练+岗位推荐+技能分析",
        price: "99",
        originalPrice: "199",
        type: "combo",
        features: JSON.stringify(["简历优化", "模拟面试", "岗位推荐", "技能分析", "30天有效"]),
        sortOrder: 4,
      },
      {
        name: "VIP求职陪跑",
        description: "专属AI顾问全程陪跑，无限次使用所有功能",
        price: "299",
        originalPrice: "599",
        type: "vip",
        features: JSON.stringify(["无限次简历优化", "无限次模拟面试", "个性化推荐", "1v1答疑", "90天有效"]),
        sortOrder: 5,
      },
    ]);
    console.log("✅ Products seeded");
  }

  // ===== 2. Seed system settings =====
  const existingSettings = await db.select().from(systemSettings);
  if (existingSettings.length === 0) {
    await db.insert(systemSettings).values([
      { key: "site_name", value: "极光职途", description: "网站名称" },
      { key: "site_description", value: "AI驱动的职业加速引擎", description: "网站描述" },
      { key: "kimi_api_key", value: "", description: "Kimi AI API Key（管理员配置后所有用户共享）" },
      { key: "wechat_mch_id", value: "", description: "微信支付商户号" },
      { key: "wechat_app_id", value: "", description: "微信支付APPID" },
      { key: "alipay_app_id", value: "", description: "支付宝应用ID" },
    ]);
    console.log("✅ System settings seeded");
  }

  // ===== 3. Seed test users =====
  const testUsers = [
    {
      username: "admin",
      password: "admin123",
      name: "系统管理员",
      email: "admin@aurora.career",
      role: "admin" as const,
      profile: {
        targetRole: "技术总监",
        targetIndustry: "互联网",
        targetLocation: "北京",
        expectedSalary: "50-80K",
        skills: ["管理", "架构设计", "团队建设"],
        experience: "10年以上",
        education: "硕士",
      },
    },
    {
      username: "zhangsan",
      password: "123456",
      name: "张三",
      email: "zhangsan@example.com",
      role: "user" as const,
      profile: {
        targetRole: "前端工程师",
        targetIndustry: "互联网",
        targetLocation: "北京",
        expectedSalary: "20-35K",
        skills: ["React", "TypeScript", "Vue", "Webpack"],
        experience: "3-5年",
        education: "本科",
      },
    },
    {
      username: "lisi",
      password: "123456",
      name: "李四",
      email: "lisi@example.com",
      role: "user" as const,
      profile: {
        targetRole: "Java后端工程师",
        targetIndustry: "金融科技",
        targetLocation: "上海",
        expectedSalary: "25-40K",
        skills: ["Java", "Spring Boot", "MySQL", "Redis", "微服务"],
        experience: "5-7年",
        education: "本科",
      },
    },
    {
      username: "wangwu",
      password: "123456",
      name: "王五",
      email: "wangwu@example.com",
      role: "user" as const,
      profile: {
        targetRole: "产品经理",
        targetIndustry: "互联网",
        targetLocation: "深圳",
        expectedSalary: "25-40K",
        skills: ["需求分析", "Axure", "数据分析", "用户研究"],
        experience: "3-5年",
        education: "本科",
      },
    },
    {
      username: "zhaoliu",
      password: "123456",
      name: "赵六",
      email: "zhaoliu@example.com",
      role: "user" as const,
      profile: {
        targetRole: "数据分析师",
        targetIndustry: "电商",
        targetLocation: "杭州",
        expectedSalary: "18-30K",
        skills: ["Python", "SQL", "Tableau", "机器学习"],
        experience: "1-3年",
        education: "硕士",
      },
    },
    {
      username: "xiaoming",
      password: "123456",
      name: "小明",
      email: "xiaoming@example.com",
      role: "user" as const,
      profile: {
        targetRole: "UI设计师",
        targetIndustry: "互联网",
        targetLocation: "成都",
        expectedSalary: "12-20K",
        skills: ["Figma", "Photoshop", "Illustrator", "交互设计"],
        experience: "应届生",
        education: "本科",
      },
    },
    {
      username: "graduate",
      password: "123456",
      name: "应届毕业生",
      email: "graduate@example.com",
      role: "user" as const,
      profile: {
        targetRole: "Java开发工程师",
        targetIndustry: "互联网",
        targetLocation: "武汉",
        expectedSalary: "8-15K",
        skills: ["Java", "Spring", "MySQL", "Git"],
        experience: "应届生",
        education: "本科",
      },
    },
    {
      username: "senior",
      password: "123456",
      name: "资深专家",
      email: "senior@example.com",
      role: "user" as const,
      profile: {
        targetRole: "架构师",
        targetIndustry: "互联网",
        targetLocation: "北京",
        expectedSalary: "40-70K",
        skills: ["架构设计", "微服务", "K8s", "云原生", "Go"],
        experience: "8年以上",
        education: "硕士",
      },
    },
  ];

  for (const testUser of testUsers) {
    // Check if exists
    const existing = await db
      .select()
      .from(users)
      .where(users.username ? eq(users.username, testUser.username) : undefined)
      .limit(1);

    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash(testUser.password, 12);

      const result = await db.insert(users).values({
        username: testUser.username,
        password: hashedPassword,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
        lastSignInAt: new Date(),
      }).$returningId();

      const userId = result[0].id;

      // Create profile
      await db.insert(userProfiles).values({
        userId,
        targetRole: testUser.profile.targetRole,
        targetIndustry: testUser.profile.targetIndustry,
        targetLocation: testUser.profile.targetLocation,
        expectedSalary: testUser.profile.expectedSalary,
        skills: JSON.stringify(testUser.profile.skills),
        experience: testUser.profile.experience,
        education: testUser.profile.education,
      });

      console.log(`✅ User created: ${testUser.username} (${testUser.name}) - ${testUser.role}`);
    } else {
      console.log(`⏭️ User exists: ${testUser.username}`);
    }
  }

  console.log("🎉 Seeding complete!");
  console.log("\n📋 测试账号列表:");
  console.log("  管理员: admin / admin123");
  console.log("  用户1: zhangsan / 123456 (前端工程师, 3-5年)");
  console.log("  用户2: lisi / 123456 (Java后端, 5-7年)");
  console.log("  用户3: wangwu / 123456 (产品经理, 3-5年)");
  console.log("  用户4: zhaoliu / 123456 (数据分析师, 1-3年)");
  console.log("  用户5: xiaoming / 123456 (UI设计师, 应届生)");
  console.log("  用户6: graduate / 123456 (Java开发, 应届生)");
  console.log("  用户7: senior / 123456 (架构师, 8年以上)");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
