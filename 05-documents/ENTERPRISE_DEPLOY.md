# 极光职途 — 企业级部署方案（2025）

> 基于最新行业趋势：Serverless 数据库 + 容器化部署 + 边缘计算

---

## 方案总览

| 方案 | 数据库 | 部署平台 | 月成本 | 适合场景 |
|------|--------|---------|--------|---------|
| **A. 极速启动** | Docker MySQL | Docker Desktop | ¥0 | 本地开发 |
| **B. 企业标准** | PlanetScale / TiDB | Railway / Render | ¥35-200 | 初创/中小团队 |
| **C. 大规模** | TiDB Cloud | AWS / GCP + K8s | ¥500+ | 高并发/多区域 |
| **D. 零运维** | Supabase | Vercel + Supabase | ¥170+ | 快速上线/最小团队 |

---

## 方案 A：Docker 一键启动（本地/测试）

已包含在项目根目录 `docker-compose.yml` 中，适合开发环境和快速验证。

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: aurora_mysql
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: aurora_career
      MYSQL_USER: aurora
      MYSQL_PASSWORD: 123456
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://aurora:123456@mysql:3306/aurora_career
    depends_on:
      - mysql
volumes:
  mysql_data:
```

启动：`docker-compose up -d`

---

## 方案 B：企业标准 — PlanetScale + Railway（推荐）

### 为什么选择这个组合？

**PlanetScale** = MySQL 的 Serverless 升级版（Vitess 核心，GitHub 在用）
- 零运维、自动扩缩容、分支数据库（像 Git 一样管理 schema）
- **与项目现有 Drizzle ORM 完全兼容**，无需改代码
- 免费额度：5GB 存储 / 10 亿行读取 / 1 千万写入

**Railway** = 2025 年最火的零配置部署平台（Heroku 继任者）
- 自动检测 Node.js，一键部署
- 内置 SSL、环境变量管理、自动扩缩容
- 定价：$5/月/服务，按量计费

### 部署步骤

#### 1. 创建 PlanetScale 数据库

```bash
# 安装 CLI
brew install planetscale/tap/pscale    # macOS
# 或下载 Windows 安装包

# 登录
pscale auth login

# 创建数据库
pscale database create aurora-career --region aws-ap-southeast-1

# 创建分支（像 Git branch 一样管理 schema）
pscale branch create aurora-career initial-setup

# 获取连接地址（在 PlanetScale Dashboard 中查看）
# 格式：mysql://user:pass@aws.connect.psdb.cloud/aurora-career?sslaccept=strict
```

#### 2. 修改项目配置

```env
# .env
DATABASE_URL=mysql://你的用户名:你的密码@aws.connect.psdb.cloud/aurora-career?sslaccept=strict
```

**无需改任何代码**，Drizzle ORM 直接兼容 PlanetScale 的 MySQL 协议。

#### 3. 部署到 Railway

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 添加环境变量（在 Railway Dashboard 中配置）
# DATABASE_URL = mysql://...
# APP_ID = ...
# APP_SECRET = ...
# KIMI_API_KEY = sk-...

# 部署
railway up
```

完成！Railway 会自动：
- 检测 `package.json` 中的构建脚本
- 运行 `npm run build`
- 启动生产服务器
- 分配 HTTPS 域名

---

## 方案 C：大规模 — TiDB Cloud + AWS

### 适合场景
- 日活用户 > 10 万
- 需要多区域部署
- 需要 HTAP（交易+分析混合）

### TiDB Cloud 优势
- **原生水平扩展**：加节点即可扩容，无需分库分表
- **MySQL 协议兼容**：项目代码零修改
- **HTAP**：同一套数据既做交易又做分析，无需 ETL
- **多区域**：数据自动跨区复制

### 部署架构

```
用户 → AWS CloudFront (CDN) → AWS ALB (负载均衡)
                                    ↓
              ┌─────────────────────────────────────┐
              │     AWS ECS / EKS (容器集群)         │
              │  ┌─────────┐ ┌─────────┐            │
              │  │ App Pod │ │ App Pod │  ...        │
              │  └────┬────┘ └────┬────┘            │
              └───────┼───────────┼─────────────────┘
                      └───────────┘
                          ↓
              TiDB Cloud (Serverless Tier)
              ┌─────────┐ ┌─────────┐
              │ TiDB    │ │ TiKV    │
              │ Server  │ │ Node    │
              └─────────┘ └─────────┘
```

### 部署步骤

1. **注册 TiDB Cloud**：https://tidbcloud.com/
2. 创建 Serverless Tier 集群（免费起步）
3. 获取连接字符串：`mysql://user:pass@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/aurora-career`
4. 修改 `.env` 中的 `DATABASE_URL`
5. AWS 上部署容器（ECS/EKS/Fargate）

---

## 方案 D：零运维 — Supabase + Vercel

### 适合场景
- 1-3 人小团队
- 追求最快上线速度
- 不介意使用 PostgreSQL（需改 Drizzle 配置）

### Supabase 优势（2025 年企业首选 BaaS）
- **PostgreSQL + 实时订阅**：数据变更自动推送到前端
- **内置 Auth**：邮件/短信/社交登录/SSO
- **Edge Functions**：Deno 运行的无服务器函数，全球边缘节点
- **零供应商锁定**：数据是标准 PostgreSQL，随时导出
- **价格透明**：Pro $25/月，无意外账单

### 架构调整

由于 Supabase 使用 PostgreSQL，需要将 Drizzle ORM 从 MySQL 适配器切换到 PostgreSQL 适配器：

```bash
# 安装 PostgreSQL 驱动
npm install pg
npm install -D @types/pg

# 修改 db/queries/connection.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const getDb = () => drizzle(pool);
```

### 部署到 Vercel

```bash
# Vercel 自动检测 Next.js/React，一键部署
npm i -g vercel
vercel --prod
```

Supabase 数据库连接地址直接填入 Vercel 环境变量。

---

## 数据库方案对比

| 特性 | Docker MySQL | PlanetScale | TiDB Cloud | Supabase |
|------|-------------|-------------|------------|----------|
| **类型** | 自建 | Serverless MySQL | 分布式 SQL | PostgreSQL BaaS |
| **扩展性** | 垂直扩展 | 自动扩缩容 | 水平扩展 | 垂直扩展 |
| **代码改动** | 0 | 0 | 0 | 需切 PostgreSQL |
| **分支管理** | ❌ | ✅ Git-like | ✅ | ❌ |
| **实时推送** | ❌ | ❌ | ❌ | ✅ |
| **价格** | ¥0 | ¥0 起步 | ¥0 起步 | $25/月 |
| **供应商锁定** | 无 | 中 | 低 | 低 |

---

## 部署平台对比

| 平台 | 类型 | 价格 | 特点 |
|------|------|------|------|
| **Railway** | PaaS | $5/月 | 零配置，自动扩缩容 |
| **Render** | PaaS | $7/月 | 预测定价，内置 Cron |
| **Fly.io** | Edge | $2/月 | 全球边缘部署，Docker |
| **Vercel** | Edge | $0/月 | 前端最优，Edge Function |
| **AWS ECS** | IaaS | $30+/月 | 完全控制，复杂 |

---

## 推荐组合（按场景）

### 🏃 极速上线（1 人团队，今天就要上线）
```
Supabase（数据库+Auth+存储）+ Vercel（前端+API）
```

### 🚀 标准企业（3-10 人团队，预期增长）
```
PlanetScale（数据库）+ Railway（应用）+ Cloudflare（CDN）
```

### 🏢 大规模（10+ 人，高并发）
```
TiDB Cloud（数据库）+ AWS ECS/EKS（容器）+ AWS ALB（负载均衡）
```

### 💻 本地开发（所有方案）
```
Docker Desktop（MySQL + App 容器）
```

---

## 迁移检查清单

从当前 Docker MySQL 迁移到企业级方案：

- [ ] 选择数据库方案（PlanetScale / TiDB / 保持 MySQL）
- [ ] 注册平台账号（PlanetScale / Railway / AWS）
- [ ] 创建数据库并获取连接地址
- [ ] 修改 `.env` 中的 `DATABASE_URL`
- [ ] 运行 `npm run db:push` 在新数据库建表
- [ ] （可选）导出原数据并导入新数据库
- [ ] 部署应用代码到目标平台
- [ ] 配置环境变量（Kimi API Key、OAuth 等）
- [ ] 测试 API 连通性（`curl /api/trpc/ping`）
- [ ] 配置域名和 HTTPS
- [ ] 配置监控（Uptime / 日志）

---

## 一句话总结

| 你想怎么发展 | 选这个 |
|-------------|--------|
| 今天上线，最小团队 | Supabase + Vercel |
| 稳步增长，控制成本 | PlanetScale + Railway |
| 大规模，高并发，不差钱 | TiDB Cloud + AWS |
| 本地开发/测试 | Docker Desktop |
