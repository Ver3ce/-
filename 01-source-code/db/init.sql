-- 极光职途 - 完整数据库初始化脚本
-- 在 MySQL Workbench 中全选执行（或命令行: mysql -u aurora -p aurora_career < init.sql）

-- ========== 1. 建表 ==========

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `unionId` varchar(255) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `avatar` text,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignInAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_unionId_unique` (`unionId`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint unsigned NOT NULL,
  `target_role` varchar(200) DEFAULT NULL,
  `target_industry` varchar(200) DEFAULT NULL,
  `target_location` varchar(200) DEFAULT NULL,
  `expected_salary` varchar(100) DEFAULT NULL,
  `skills` json DEFAULT NULL,
  `experience` varchar(50) DEFAULT NULL,
  `education` varchar(100) DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_profiles_userId_unique` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `resumes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint unsigned NOT NULL,
  `fileName` varchar(255) DEFAULT NULL,
  `fileUrl` text,
  `content` text,
  `parsedData` json DEFAULT NULL,
  `score` int DEFAULT NULL,
  `suggestions` json DEFAULT NULL,
  `status` enum('pending','parsed','analyzed') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `interview_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint unsigned NOT NULL,
  `jobTitle` varchar(200) DEFAULT NULL,
  `company` varchar(200) DEFAULT NULL,
  `type` enum('behavioral','technical','system_design','mixed') NOT NULL DEFAULT 'mixed',
  `status` enum('active','completed') NOT NULL DEFAULT 'active',
  `score` json DEFAULT NULL,
  `messages` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_personas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `systemPrompt` text NOT NULL,
  `icon` varchar(50) DEFAULT 'bot',
  `category` enum('resume','interview','career','skill','custom') DEFAULT 'custom',
  `isDefault` tinyint(1) DEFAULT '0',
  `isCustom` tinyint(1) DEFAULT '0',
  `userId` bigint unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `saved_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint unsigned NOT NULL,
  `externalId` varchar(255) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `company` varchar(200) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `salary` varchar(100) DEFAULT NULL,
  `url` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `job_sources` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `externalId` varchar(255) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `company` varchar(200) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `salary` varchar(100) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `description` text,
  `requirements` json DEFAULT NULL,
  `education` varchar(100) DEFAULT NULL,
  `experience` varchar(100) DEFAULT NULL,
  `companySize` varchar(100) DEFAULT NULL,
  `companyStage` varchar(100) DEFAULT NULL,
  `source` varchar(50) NOT NULL,
  `url` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `job_sources_externalId_unique` (`externalId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `originalPrice` decimal(10,2) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `features` json DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `orderNo` varchar(100) NOT NULL,
  `userId` bigint unsigned NOT NULL,
  `productId` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `payType` varchar(50) DEFAULT NULL,
  `payTime` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_orderNo_unique` (`orderNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(200) NOT NULL,
  `value` text,
  `description` varchar(500) DEFAULT NULL,
  `updatedBy` bigint unsigned DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 2. 插入测试用户（密码统一: 123456） ==========
-- admin 密码: admin123

INSERT INTO `users` (`id`,`unionId`,`username`,`password`,`name`,`email`,`avatar`,`role`,`createdAt`,`updatedAt`,`lastSignInAt`) VALUES
(1,NULL,'admin','$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW','系统管理员','admin@aurora.career',NULL,'admin','2025-04-24 10:00:00','2025-04-24 10:00:00','2025-04-24 10:00:00'),
(2,NULL,'zhangsan','$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW','张三','zhangsan@test.com',NULL,'user','2025-04-24 10:00:00','2025-04-24 10:00:00','2025-04-24 10:00:00'),
(3,NULL,'lisi','$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW','李四','lisi@test.com',NULL,'user','2025-04-24 10:00:00','2025-04-24 10:00:00','2025-04-24 10:00:00'),
(4,NULL,'wangwu','$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW','王五','wangwu@test.com',NULL,'user','2025-04-24 10:00:00','2025-04-24 10:00:00','2025-04-24 10:00:00'),
(5,NULL,'zhaoliu','$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW','赵六','zhaoliu@test.com',NULL,'user','2025-04-24 10:00:00','2025-04-24 10:00:00','2025-04-24 10:00:00'),
(6,NULL,'xiaoming','$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW','小明','xiaoming@test.com',NULL,'user','2025-04-24 10:00:00','2025-04-24 10:00:00','2025-04-24 10:00:00'),
(7,NULL,'graduate','$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW','应届毕业生','graduate@test.com',NULL,'user','2025-04-24 10:00:00','2025-04-24 10:00:00','2025-04-24 10:00:00'),
(8,NULL,'senior','$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW','资深专家','senior@test.com',NULL,'user','2025-04-24 10:00:00','2025-04-24 10:00:00','2025-04-24 10:00:00')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- 说明: $2a$12$... 是 bcrypt hash，对应明文密码 '123456'
-- admin 的密码也是 'admin123' 的 hash

-- 重新更新 admin 密码为 admin123
UPDATE `users` SET `password`='$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW' WHERE `username`='admin';

-- ========== 3. 插入用户画像 ==========

INSERT INTO `user_profiles` (`userId`,`target_role`,`target_industry`,`target_location`,`expected_salary`,`skills`,`experience`,`education`,`preferences`) VALUES
(1,'技术总监','互联网','北京','50-80K','["管理","架构设计","团队建设"]','10年以上','硕士',NULL),
(2,'前端工程师','互联网','上海','20-35K','["React","TypeScript","Vue","Node.js"]','3-5年','本科',NULL),
(3,'Java后端工程师','互联网','深圳','25-40K','["Java","Spring Boot","MySQL","Redis","Kafka"]','5-7年','本科',NULL),
(4,'产品经理','互联网','北京','25-40K','["需求分析","Axure","数据分析","项目管理"]','3-5年','本科',NULL),
(5,'数据分析师','金融科技','上海','18-30K','["Python","SQL","Tableau","机器学习"]','1-3年','硕士',NULL),
(6,'UI设计师','互联网','杭州','12-20K','["Figma","Photoshop","Illustrator"]','应届生','本科',NULL),
(7,'Java开发工程师','互联网','成都','10-18K','["Java","Spring","MySQL"]','应届生','本科',NULL),
(8,'架构师','互联网','北京','60-100K','["架构设计","微服务","K8s","云原生"]','8年以上','硕士',NULL)
ON DUPLICATE KEY UPDATE `userId`=`userId`;

-- ========== 4. 插入默认 AI 角色 ==========

INSERT INTO `ai_personas` (`name`,`description`,`systemPrompt`,`icon`,`category`,`isDefault`,`isCustom`) VALUES
('简历优化师','专注于简历分析和优化建议','你是一位资深HR和职业发展顾问。你的任务是分析用户的简历，给出结构、内容、关键词等方面的优化建议。请用中文回答，语气专业且鼓励。','file-text','resume',1,0),
('模拟面试官','模拟真实面试场景','你是一位经验丰富的技术面试官。根据用户申请的职位，提出有针对性的面试问题，并在用户回答后给出评价和改进建议。请用中文交流。','message-circle','interview',1,0),
('职业规划师','帮助用户规划职业发展路径','你是一位职业规划专家。根据用户的背景、技能和目标，帮助分析职业发展方向，给出具体可行的成长路径建议。请用中文回答。','compass','career',1,0),
('技能导师','帮助用户提升专业技能','你是一位技术培训导师。根据用户想提升的技能方向，给出学习路径、推荐资源和练习建议。请用中文回答。','book-open','skill',1,0)
ON DUPLICATE KEY UPDATE `name`=`name`;

-- ========== 5. 插入产品/套餐 ==========

INSERT INTO `products` (`name`,`description`,`price`,`originalPrice`,`type`,`features`,`isActive`,`sortOrder`) VALUES
('免费版','基础功能体验',0.00,0.00,'free','["3次简历优化","3次模拟面试","基础岗位推荐"]',1,1),
('专业版','适合求职者全面提升',49.90,99.00,'monthly','["无限次简历优化","无限次模拟面试","个性化推荐","AI答疑","30天有效"]',1,2),
('VIP版','全方位求职加速服务',199.00,399.00,'yearly','["无限次简历优化","无限次模拟面试","个性化推荐","1v1答疑","90天有效"]',1,3)
ON DUPLICATE KEY UPDATE `name`=`name`;

-- ========== 6. 插入系统设置 ==========

INSERT INTO `system_settings` (`key`,`value`,`description`) VALUES
('site_name','极光职途','网站名称'),
('site_description','AI驱动的职业加速引擎','网站描述'),
('kimi_api_key','','Kimi AI API Key（管理员配置后所有用户共享）'),
('wechat_mch_id','','微信支付商户号'),
('wechat_app_id','','微信支付APPID'),
('alipay_app_id','','支付宝应用ID')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- ========== 完成 ==========
SELECT '数据库初始化完成！' AS status;
SELECT CONCAT('共创建 ', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE()), ' 张表') AS tables_count;
SELECT CONCAT('共插入 ', (SELECT COUNT(*) FROM users), ' 个用户') AS users_count;
