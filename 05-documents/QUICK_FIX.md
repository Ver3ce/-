# 极光职途 - 快速修复指南

## 刚刚完成的修复

### 1. ✅ 修复了 API 配置保存问题
- 文件：`src/pages/admin/ApiSettings.tsx`
- 问题：保存按钮点击后没有真正等待保存完成
- 修复：使用 async/await 和 mutateAsync，添加错误处理

### 2. ✅ 创建了 .env 配置文件
- 文件：`.env`
- 配置了本地数据库连接

### 3. ✅ 改进了后端错误处理
- 文件：`api/routers/system-settings-router.ts`
- 添加了数据库健康检查接口
- 改进了错误信息返回

### 4. ✅ 创建了诊断工具
- 文件：`api/routers/debug-router.ts`
- 文件：`src/pages/DebugPage.tsx`
- 可以在浏览器中检查数据库状态和初始化数据库

---

## 现在需要做的

### 第一步：重启项目

在项目目录中：
```bash
# 如果已经在运行，按 Ctrl+C 停止
# 然后重新启动
npm run dev
```

### 第二步：访问诊断页面

打开浏览器，访问：
```
http://localhost:3000/debug
```

你会看到：
- 数据库连接状态
- 数据表状态（用户表、系统设置表）
- 初始化数据库按钮

### 第三步：初始化数据库

如果显示"数据表为空"或"表不存在"：
1. 点击"初始化数据库"按钮
2. 这会创建：
   - 管理员账号：`admin` / `admin123`
   - 测试用户：`zhangsan` / `123456`
   - 默认系统设置

### 第四步：测试 API 配置保存

1. 访问 `http://localhost:3000/login`
2. 用 `admin` / `admin123` 登录
3. 进入"系统设置"页面
4. 输入 Kimi API Key
5. 点击保存

---

## 如果还有问题

### 数据库连接失败

检查 MySQL 是否运行：
- 打开服务管理器（Win+R，输入 services.msc）
- 找到 MySQL 服务，确保正在运行

### 表不存在错误

如果诊断页面显示表不存在，点击"初始化数据库"按钮即可。

### 其他错误

打开浏览器开发者工具（F12）：
- 查看 Console 标签中的错误信息
- 查看 Network 标签中的 API 请求响应

---

## 修复的文件列表

1. `src/pages/admin/ApiSettings.tsx` - 修复保存逻辑
2. `api/routers/system-settings-router.ts` - 添加健康检查
3. `api/routers/debug-router.ts` - 新增诊断路由
4. `api/router.ts` - 添加 debug 路由
5. `src/pages/DebugPage.tsx` - 新增诊断页面
6. `src/App.tsx` - 添加 debug 页面路由
7. `.env` - 创建环境配置

---

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| zhangsan | 123456 | 普通用户 |

---

## 下一步

1. 重启项目
2. 访问 `/debug` 检查状态
3. 点击"初始化数据库"
4. 登录并测试 API 配置保存

如果还有问题，把 `/debug` 页面的截图发给我！