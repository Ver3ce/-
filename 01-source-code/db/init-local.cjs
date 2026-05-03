/**
 * 本地数据库一键初始化脚本
 * 运行方式: node db/init-local.cjs
 * 
 * 功能:
 * 1. 连接本地 MySQL 数据库
 * 2. 创建所有数据表
 * 3. 插入测试用户（含正确 bcrypt 密码）
 * 4. 插入 AI 角色、产品套餐、系统设置
 */

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// 数据库配置（从 .env 读取或硬编码）
const DB_URL = process.env.DATABASE_URL || "mysql://aurora:aurora123@localhost:3306/aurora_career";

// 解析数据库 URL
function parseDbUrl(url) {
  const match = url.match(/mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)/);
  if (!match) throw new Error("无法解析 DATABASE_URL");
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

const config = parseDbUrl(DB_URL);

const TABLES = [
  // users
  `CREATE TABLE IF NOT EXISTS users (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    unionId varchar(255) DEFAULT NULL,
    username varchar(100) DEFAULT NULL,
    password varchar(255) DEFAULT NULL,
    name varchar(255) DEFAULT NULL,
    email varchar(320) DEFAULT NULL,
    avatar text,
    role enum('user','admin') NOT NULL DEFAULT 'user',
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastSignInAt timestamp NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY users_unionId_unique (unionId),
    UNIQUE KEY users_username_unique (username),
    UNIQUE KEY users_email_unique (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // user_profiles
  `CREATE TABLE IF NOT EXISTS user_profiles (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    userId bigint unsigned NOT NULL,
    target_role varchar(200) DEFAULT NULL,
    target_industry varchar(200) DEFAULT NULL,
    target_location varchar(200) DEFAULT NULL,
    expected_salary varchar(100) DEFAULT NULL,
    skills json DEFAULT NULL,
    experience varchar(50) DEFAULT NULL,
    education varchar(100) DEFAULT NULL,
    preferences json DEFAULT NULL,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY user_profiles_userId_unique (userId)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // resumes
  `CREATE TABLE IF NOT EXISTS resumes (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    userId bigint unsigned NOT NULL,
    fileName varchar(255) DEFAULT NULL,
    fileUrl text,
    content text,
    parsedData json DEFAULT NULL,
    score int DEFAULT NULL,
    suggestions json DEFAULT NULL,
    status enum('pending','parsed','analyzed') NOT NULL DEFAULT 'pending',
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // interview_sessions
  `CREATE TABLE IF NOT EXISTS interview_sessions (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    userId bigint unsigned NOT NULL,
    jobTitle varchar(200) DEFAULT NULL,
    company varchar(200) DEFAULT NULL,
    type enum('behavioral','technical','system_design','mixed') NOT NULL DEFAULT 'mixed',
    status enum('active','completed') NOT NULL DEFAULT 'active',
    score json DEFAULT NULL,
    messages json DEFAULT NULL,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ai_personas
  `CREATE TABLE IF NOT EXISTS ai_personas (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    description text,
    systemPrompt text NOT NULL,
    icon varchar(50) DEFAULT 'bot',
    category enum('resume','interview','career','skill','custom') DEFAULT 'custom',
    isDefault tinyint(1) DEFAULT 0,
    isCustom tinyint(1) DEFAULT 0,
    userId bigint unsigned DEFAULT NULL,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // saved_jobs
  `CREATE TABLE IF NOT EXISTS saved_jobs (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    userId bigint unsigned NOT NULL,
    externalId varchar(255) NOT NULL,
    title varchar(200) DEFAULT NULL,
    company varchar(200) DEFAULT NULL,
    location varchar(200) DEFAULT NULL,
    salary varchar(100) DEFAULT NULL,
    url text,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // job_sources
  `CREATE TABLE IF NOT EXISTS job_sources (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    externalId varchar(255) NOT NULL,
    title varchar(200) DEFAULT NULL,
    company varchar(200) DEFAULT NULL,
    location varchar(200) DEFAULT NULL,
    salary varchar(100) DEFAULT NULL,
    tags json DEFAULT NULL,
    description text,
    requirements json DEFAULT NULL,
    education varchar(100) DEFAULT NULL,
    experience varchar(100) DEFAULT NULL,
    companySize varchar(100) DEFAULT NULL,
    companyStage varchar(100) DEFAULT NULL,
    source varchar(50) NOT NULL,
    url text,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY job_sources_externalId_unique (externalId)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // products
  `CREATE TABLE IF NOT EXISTS products (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    name varchar(200) NOT NULL,
    description text,
    price decimal(10,2) NOT NULL,
    originalPrice decimal(10,2) DEFAULT NULL,
    type varchar(50) NOT NULL,
    features json DEFAULT NULL,
    isActive tinyint(1) NOT NULL DEFAULT 1,
    sortOrder int NOT NULL DEFAULT 0,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // orders
  `CREATE TABLE IF NOT EXISTS orders (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    orderNo varchar(100) NOT NULL,
    userId bigint unsigned NOT NULL,
    productId bigint unsigned NOT NULL,
    amount decimal(10,2) NOT NULL,
    status varchar(50) NOT NULL DEFAULT 'pending',
    payType varchar(50) DEFAULT NULL,
    payTime timestamp NULL DEFAULT NULL,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY orders_orderNo_unique (orderNo)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // system_settings
  `CREATE TABLE IF NOT EXISTS system_settings (
    id bigint unsigned NOT NULL AUTO_INCREMENT,
    key_name varchar(200) NOT NULL,
    value text,
    description varchar(500) DEFAULT NULL,
    updatedBy bigint unsigned DEFAULT NULL,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY system_settings_key_unique (key_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

async function init() {
  console.log("🌱 开始初始化本地数据库...");
  console.log("📡 连接:", config.host, ":", config.port);

  let conn;
  try {
    conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: "utf8mb4_unicode_ci",
    });
    console.log("✅ 数据库连接成功");
  } catch (e) {
    console.error("❌ 连接失败:", e.message);
    console.log("\n💡 解决方法:");
    console.log("   1. 确认 MySQL 已启动 (services.msc 里找 MySQL80)");
    console.log("   2. 确认用户名密码正确");
    console.log("   3. 确认数据库", config.database, "已创建");
    console.log("\n如果数据库不存在，先创建:");
    console.log("   CREATE DATABASE", config.database, "CHARACTER SET utf8mb4;");
    process.exit(1);
  }

  // 1. 创建表
  console.log("\n📦 创建数据表...");
  for (const sql of TABLES) {
    try {
      await conn.execute(sql);
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
      console.log("   ✅", tableName);
    } catch (e) {
      console.error("   ❌ 建表失败:", e.message);
      console.error("   SQL:", sql.substring(0, 100));
    }
  }

  // 2. 生成密码 hash
  console.log("\n🔐 生成测试账号密码...");
  const hash123456 = await bcrypt.hash("123456", 12);
  const hashAdmin = await bcrypt.hash("admin123", 12);
  console.log("   ✅ 密码 hash 生成完成");

  // 3. 插入测试用户
  console.log("\n👤 插入测试用户...");
  const testUsers = [
    { username: "admin", password: hashAdmin, name: "系统管理员", email: "admin@aurora.career", role: "admin" },
    { username: "zhangsan", password: hash123456, name: "张三", email: "zhangsan@test.com", role: "user" },
    { username: "lisi", password: hash123456, name: "李四", email: "lisi@test.com", role: "user" },
    { username: "wangwu", password: hash123456, name: "王五", email: "wangwu@test.com", role: "user" },
    { username: "zhaoliu", password: hash123456, name: "赵六", email: "zhaoliu@test.com", role: "user" },
    { username: "xiaoming", password: hash123456, name: "小明", email: "xiaoming@test.com", role: "user" },
    { username: "graduate", password: hash123456, name: "应届毕业生", email: "graduate@test.com", role: "user" },
    { username: "senior", password: hash123456, name: "资深专家", email: "senior@test.com", role: "user" },
  ];

  for (const u of testUsers) {
    try {
      await conn.execute(
        `INSERT INTO users (username, password, name, email, role, lastSignInAt) VALUES (?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE password=VALUES(password), name=VALUES(name)`,
        [u.username, u.password, u.name, u.email, u.role]
      );
      console.log("   ✅", u.username, "(" + u.name + ")");
    } catch (e) {
      console.error("   ❌", u.username, ":", e.message);
    }
  }

  // 4. 插入用户画像
  console.log("\n📝 插入用户画像...");
  const profiles = [
    [1, "技术总监", "互联网", "北京", "50-80K", '["管理","架构设计","团队建设"]', "10年以上", "硕士"],
    [2, "前端工程师", "互联网", "上海", "20-35K", '["React","TypeScript","Vue","Node.js"]', "3-5年", "本科"],
    [3, "Java后端工程师", "互联网", "深圳", "25-40K", '["Java","Spring Boot","MySQL","Redis","Kafka"]', "5-7年", "本科"],
    [4, "产品经理", "互联网", "北京", "25-40K", '["需求分析","Axure","数据分析","项目管理"]', "3-5年", "本科"],
    [5, "数据分析师", "金融科技", "上海", "18-30K", '["Python","SQL","Tableau","机器学习"]', "1-3年", "硕士"],
    [6, "UI设计师", "互联网", "杭州", "12-20K", '["Figma","Photoshop","Illustrator"]', "应届生", "本科"],
    [7, "Java开发工程师", "互联网", "成都", "10-18K", '["Java","Spring","MySQL"]', "应届生", "本科"],
    [8, "架构师", "互联网", "北京", "60-100K", '["架构设计","微服务","K8s","云原生"]', "8年以上", "硕士"],
  ];
  for (const p of profiles) {
    try {
      await conn.execute(
        `INSERT INTO user_profiles (userId, target_role, target_industry, target_location, expected_salary, skills, experience, education)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE target_role=VALUES(target_role)`,
        p
      );
    } catch (e) {
      console.error("   ❌ profile:", e.message);
    }
  }
  console.log("   ✅ 8 个用户画像已插入");

  // 5. 插入 AI 角色
  console.log("\n🤖 插入 AI 角色...");
  const personas = [
    ["简历优化师", "专注于简历分析和优化建议", "你是一位资深HR和职业发展顾问。你的任务是分析用户的简历，给出结构、内容、关键词等方面的优化建议。请用中文回答，语气专业且鼓励。", "file-text", "resume", 1, 0],
    ["模拟面试官", "模拟真实面试场景", "你是一位经验丰富的技术面试官。根据用户申请的职位，提出有针对性的面试问题，并在用户回答后给出评价和改进建议。请用中文交流。", "message-circle", "interview", 1, 0],
    ["职业规划师", "帮助用户规划职业发展路径", "你是一位职业规划专家。根据用户的背景、技能和目标，帮助分析职业发展方向，给出具体可行的成长路径建议。请用中文回答。", "compass", "career", 1, 0],
    ["技能导师", "帮助用户提升专业技能", "你是一位技术培训导师。根据用户想提升的技能方向，给出学习路径、推荐资源和练习建议。请用中文回答。", "book-open", "skill", 1, 0],
  ];
  for (const p of personas) {
    try {
      await conn.execute(
        `INSERT INTO ai_personas (name, description, systemPrompt, icon, category, isDefault, isCustom) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        p
      );
    } catch (e) {
      console.error("   ❌ persona:", e.message);
    }
  }
  console.log("   ✅ 4 个 AI 角色已插入");

  // 6. 插入产品
  console.log("\n💎 插入产品套餐...");
  const products = [
    ["免费版", "基础功能体验", 0.00, 0.00, "free", '["3次简历优化","3次模拟面试","基础岗位推荐"]', 1, 1],
    ["专业版", "适合求职者全面提升", 49.90, 99.00, "monthly", '["无限次简历优化","无限次模拟面试","个性化推荐","AI答疑","30天有效"]', 1, 2],
    ["VIP版", "全方位求职加速服务", 199.00, 399.00, "yearly", '["无限次简历优化","无限次模拟面试","个性化推荐","1v1答疑","90天有效"]', 1, 3],
  ];
  for (const p of products) {
    try {
      await conn.execute(
        `INSERT INTO products (name, description, price, originalPrice, type, features, isActive, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        p
      );
    } catch (e) {
      console.error("   ❌ product:", e.message);
    }
  }
  console.log("   ✅ 3 个产品套餐已插入");

  // 7. 插入系统设置
  console.log("\n⚙️  插入系统设置...");
  const settings = [
    ["site_name", "极光职途", "网站名称"],
    ["site_description", "AI驱动的职业加速引擎", "网站描述"],
    ["kimi_api_key", "", "Kimi AI API Key"],
    ["wechat_mch_id", "", "微信支付商户号"],
    ["wechat_app_id", "", "微信支付APPID"],
    ["alipay_app_id", "", "支付宝应用ID"],
  ];
  for (const s of settings) {
    try {
      await conn.execute(
        `INSERT INTO system_settings (key_name, value, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE key_name=VALUES(key_name)`,
        s
      );
    } catch (e) {
      console.error("   ❌ setting:", e.message);
    }
  }
  console.log("   ✅ 6 项系统设置已插入");

  // 完成
  console.log("\n🎉 数据库初始化完成！");
  console.log("\n📋 测试账号（可直接登录）:");
  console.log("   管理员: admin / admin123");
  console.log("   用户:   zhangsan / 123456");
  console.log("   用户:   lisi / 123456");
  console.log("   用户:   wangwu / 123456");
  console.log("   ... 共 8 个账号");

  await conn.end();
}

init().catch((e) => {
  console.error("❌ 初始化失败:", e.message);
  process.exit(1);
});
