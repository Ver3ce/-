# 极光职途 - 后端架构设计

## 概述

将纯前端Demo升级为完整的全栈产品，接入Kimi API实现AI功能，并建立专属AI角色系统。

## 技术栈

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui（已有）
- **后端**: Hono + tRPC 11 + Drizzle ORM + MySQL
- **AI**: Kimi API (Moonshot AI)
- **认证**: Kimi OAuth 2.0

## 数据库Schema

### users（用户表 - 由auth模块自动生成）
```
id          serial          PK
name        varchar(255)
avatar      varchar(500)
role        enum['user','admin']  default 'user'
createdAt   timestamp
```

### resumes（简历表）
```
id          serial          PK
userId      bigint          FK -> users.id
filename    varchar(255)
content     text            -- 简历文本内容
parsedData  json            -- 结构化解析结果
score       json            -- AI评分结果
status      enum['pending','analyzed','optimized']  default 'pending'
createdAt   timestamp
updatedAt   timestamp
```

### interviewSessions（面试会话表）
```
id          serial          PK
userId      bigint          FK -> users.id
title       varchar(255)    -- 会话标题
jobType     varchar(100)    -- 目标岗位类型
status      enum['active','completed']  default 'active'
score       json            -- 最终评分
messages    json            -- 消息历史
createdAt   timestamp
updatedAt   timestamp
```

### aiPersonas（AI角色/专属AI表）
```
id          serial          PK
name        varchar(100)    -- 角色名称
description text            -- 角色描述
systemPrompt text           -- 系统提示词
icon        varchar(50)     -- 图标标识
isDefault   boolean         default false
isCustom    boolean         default false
userId      bigint          FK -> users.id (nullable, null=系统预设)
createdAt   timestamp
```

### userSettings（用户设置表）
```
id          serial          PK
userId      bigint          FK -> users.id
activePersonaId bigint      FK -> aiPersonas.id
kimiApiKey  varchar(255)    -- 用户自己的Kimi API Key
preferences json            -- 其他偏好设置
createdAt   timestamp
updatedAt   timestamp
```

## API设计（tRPC Routers）

### resume router
- `resume.analyze` - 分析简历（调用Kimi API）
- `resume.getById` - 获取简历详情
- `resume.getHistory` - 获取用户简历历史
- `resume.optimize` - 优化简历（调用Kimi API）

### interview router
- `interview.start` - 开始面试会话
- `interview.sendMessage` - 发送消息（调用Kimi API）
- `interview.getById` - 获取会话详情
- `interview.getHistory` - 获取会话列表
- `interview.complete` - 完成面试并评分

### persona router（专属AI系统）
- `persona.list` - 列出所有AI角色
- `persona.getById` - 获取角色详情
- `persona.create` - 创建自定义角色
- `persona.update` - 更新角色
- `persona.delete` - 删除角色
- `persona.setActive` - 设置当前使用角色

### settings router
- `settings.get` - 获取用户设置
- `settings.update` - 更新设置
- `settings.setApiKey` - 设置Kimi API Key

### job router（岗位雷达）
- `job.list` - 获取推荐岗位（Mock数据/后续接入真实API）
- `job.save` - 收藏岗位
- `job.getSaved` - 获取收藏列表

### skill router（技能图谱）
- `skill.analyze` - 分析技能（调用Kimi API）
- `skill.getGapAnalysis` - 获取能力差距分析
- `skill.getHistory` - 获取历史分析

## Kimi API接入设计

### 基础调用层
```typescript
// api/lib/kimi.ts
class KimiClient {
  async chat(messages: Message[], systemPrompt?: string): Promise<string>
  async streamChat(messages: Message[], systemPrompt?: string): ReadableStream
}
```

### AI角色系统（专属AI）
每个AI角色有一个systemPrompt，定义其专业身份：

**预设角色：**
1. **简历优化师** (resume-expert)
   - System Prompt: "你是一位资深HR和职业规划师，擅长简历优化..."

2. **面试教练** (interview-coach)
   - System Prompt: "你是一位专业的面试教练，擅长模拟真实面试场景..."

3. **职业顾问** (career-advisor)
   - System Prompt: "你是一位职业发展规划专家..."

4. **技能分析师** (skill-analyst)
   - System Prompt: "你是一位技术能力评估专家..."

**用户可以创建自定义角色**

### 调用流程
1. 前端调用tRPC API
2. 后端根据功能选择对应的AI角色（systemPrompt）
3. 将用户输入 + systemPrompt 发送给Kimi API
4. 返回AI响应给前端
5. 前端展示结果

## 需要你完成的工作（用户接入部分）

### 1. 获取Kimi API Key
- 访问 https://platform.moonshot.cn/
- 注册账号 → 创建API Key
- 将Key填入系统设置

### 2. 配置AI角色
- 可以在"专属AI"页面创建自定义角色
- 为每个角色设置名称、描述、系统提示词

### 3. 个性化调优
- 根据实际使用效果调整system prompt
- 添加行业特定的术语和知识

## 实现步骤
1. 初始化后端
2. 设计并实现数据库schema
3. 实现Kimi API调用层
4. 实现tRPC路由
5. 修改前端接入API
6. 构建部署
