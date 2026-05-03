# 极光职途 — 完整迁移指南

## 核心原则

> 数据库用 **Schema 重建**（最简单），代码用 **Git 同步**（最可靠）。
> 不需要导出/导入 SQL 文件，不需要手动建表，一条命令自动重建。

---

## 方案一：完整迁移（推荐）

### 第 1 步：在原电脑打包代码

```bash
# 进入项目目录
cd /mnt/agents/output/app

# 方式 A：推送到 GitHub/GitLab（推荐，后续可更新）
git init
git add .
git commit -m "极光职途 v1.0"
git remote add origin https://github.com/你的用户名/aurora-career.git
git push -u origin main

# 方式 B：压缩成 zip（最简单，一次性迁移）
zip -r aurora-career.zip . -x "node_modules/*" -x "dist/*" -x ".git/*"
# 然后复制 zip 到新电脑解压
```

### 第 2 步：在新电脑重建数据库（一键完成）

**这是最关键的一步，也是最简单的一步。**

我们的数据库使用 Drizzle ORM，所有表结构都在 `db/schema.ts` 中定义好了。你只需要：

```bash
# 1. 安装 MySQL（如果你还没有）
# macOS:
brew install mysql
brew services start mysql

# Ubuntu/Debian:
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql

# Windows: 下载 MySQL Installer 安装

# 2. 创建数据库（一条命令）
mysql -u root -p -e "CREATE DATABASE aurora_career CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. 在项目目录执行 Drizzle 自动同步
npm run db:push
# 或
npx drizzle-kit push
```

**`db:push` 会自动做什么？**
- 读取 `db/schema.ts` 中的表定义
- 在数据库中创建所有表（users, resumes, interview_sessions, ai_personas, user_settings, saved_jobs）
- 自动处理字段类型、外键、默认值
- **完全不需要手写 SQL！**

### 第 3 步：配置环境变量

复制原电脑的 `.env` 文件到新电脑，**修改数据库连接地址**：

```env
# .env
APP_ID=19db3beb-5192-8e81-8000-00006809e986
APP_SECRET=LTgZ3VUlX40nzlnngjrFzB6Q457UjWa7
VITE_APP_ID=19db3beb-5192-8e81-8000-00006809e986
VITE_KIMI_AUTH_URL=https://auth.kimi.com

# ===== 修改这里：换成你的新数据库地址 =====
DATABASE_URL=mysql://root:你的密码@localhost:3306/aurora_career
# 格式：mysql://用户名:密码@主机:端口/数据库名

KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com
OWNER_UNION_ID=d7esihkchmtl9am0cu60

# ===== Kimi API Key（你的AI引擎）=====
# 访问 https://platform.moonshot.cn/ 获取
# KIMI_API_KEY=sk-your-api-key-here
```

### 第 4 步：安装依赖并启动

```bash
# 进入项目目录
cd aurora-career

# 安装依赖
npm install

# 开发模式启动（前后端一起）
npm run dev

# 访问 http://localhost:3000
```

---

## 方案二：Docker 一键部署（更专业）

如果你想要**零配置**在新电脑运行，用 Docker Compose：

### 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: aurora_mysql
    environment:
      MYSQL_ROOT_PASSWORD: your_password
      MYSQL_DATABASE: aurora_career
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  app:
    build: .
    container_name: aurora_app
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://root:your_password@mysql:3306/aurora_career
      APP_ID: ${APP_ID}
      APP_SECRET: ${APP_SECRET}
      KIMI_API_KEY: ${KIMI_API_KEY}
    depends_on:
      - mysql

volumes:
  mysql_data:
```

### 创建 Dockerfile

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 启动命令

```bash
docker-compose up -d
# 自动：拉取MySQL镜像 → 创建数据库 → 构建应用 → 启动服务
```

---

## 数据库重建原理（为什么这么简单）

```
┌─────────────────┐
│  db/schema.ts   │  ← 表结构定义（代码里已有）
│  (TypeScript)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  drizzle-kit    │  ← CLI工具，读取schema
│    push         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    MySQL        │  ← 自动创建所有表
│   aurora_career │
└─────────────────┘
```

**你不需要：**
- ❌ 导出 `.sql` 文件
- ❌ 手动 `CREATE TABLE`
- ❌ 担心字段类型不匹配
- ❌ 处理外键关系

**你只需要：**
- ✅ 一个空的 MySQL 数据库
- ✅ 运行 `npm run db:push`

---

## 常见问题

### Q1: 数据库里已有用户数据，迁移会丢失吗？

**开发环境**：`db:push` 会重新同步表结构，但不会主动删除已有数据（除非字段冲突）。如果数据很重要，建议先备份：

```bash
# 导出数据备份
mysqldump -u root -p aurora_career > backup.sql

# 新电脑恢复
mysql -u root -p aurora_career < backup.sql
```

**生产环境**：使用迁移文件（migrations）：

```bash
# 在原电脑生成迁移文件
npm run db:generate

# 复制 db/migrations/ 文件夹到新电脑
# 新电脑执行
npm run db:migrate
```

### Q2: 新电脑没有 Node.js 环境怎么办？

```bash
# 安装 Node.js 20（推荐用 nvm）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 验证
node -v  # v20.x.x
npm -v   # 10.x.x
```

### Q3: 我的数据库在云端（阿里云/腾讯云）怎么连？

```env
# .env 中修改 DATABASE_URL
DATABASE_URL=mysql://用户名:密码@阿里云主机地址:3306/aurora_career

# 如果云端数据库已有数据，只需要：
npm run db:push
# 它会自动添加新表，不影响已有数据
```

### Q4: 如何在新电脑验证迁移成功？

```bash
# 1. 检查数据库连接
npm run db:push
# 应该显示 "[✓] Changes applied" 而不是报错

# 2. 启动服务
npm run dev

# 3. 浏览器访问 http://localhost:3000
# 应该正常显示网站

# 4. 检查 API 是否正常
curl http://localhost:3000/api/trpc/ping
# 应该返回 {"ok":true}
```

---

## 快速检查清单

迁移到新电脑后，按顺序执行：

- [ ] 安装 Node.js 20
- [ ] 安装 MySQL 并启动服务
- [ ] 创建数据库 `aurora_career`
- [ ] 复制项目代码并 `npm install`
- [ ] 复制/修改 `.env` 文件（特别是 DATABASE_URL）
- [ ] 运行 `npm run db:push` 建表
- [ ] 运行 `npm run dev` 启动
- [ ] 浏览器访问 `http://localhost:3000`
- [ ] （可选）在设置页配置 Kimi API Key

---

## 最小化启动脚本（保存为 start.sh）

```bash
#!/bin/bash

echo "🚀 启动极光职途..."

# 检查 MySQL
if ! pgrep -x "mysqld" > /dev/null; then
    echo "⚠️  MySQL 未运行，尝试启动..."
    brew services start mysql  # macOS
    # sudo systemctl start mysql  # Linux
fi

# 检查数据库是否存在
mysql -u root -e "CREATE DATABASE IF NOT EXISTS aurora_career CHARACTER SET utf8mb4;" 2>/dev/null

# 推送表结构
echo "📦 同步数据库..."
npm run db:push

# 启动开发服务器
echo "🌐 启动服务..."
npm run dev
```

然后只需要：
```bash
chmod +x start.sh
./start.sh
```

---

## 总结

| 步骤 | 操作 | 耗时 |
|------|------|------|
| 代码迁移 | Git clone / 解压 zip | 1 分钟 |
| 安装依赖 | `npm install` | 1-2 分钟 |
| 创建数据库 | `mysql -e "CREATE DATABASE..."` | 5 秒 |
| 同步表结构 | `npm run db:push` | 10 秒 |
| 启动服务 | `npm run dev` | 5 秒 |
| **总计** | | **3-5 分钟** |

**核心就是：Drizzle ORM 的 `db:push` 让数据库重建变得和 `npm install` 一样简单。**