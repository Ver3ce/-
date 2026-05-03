# 认证问题修复报告

## 问题诊断

**错误信息**: `Authentication required`

**根本原因**: 系统支持两种登录方式，但后端 context 只识别其中一种：
1. ✅ **Kimi OAuth** → 使用 cookie 中的 session token
2. ❌ **本地账号登录** → 使用 JWT token 在 Authorization header 中

后端 `context.ts` 只检查了 cookie，没有检查 JWT header，导致本地登录后无法通过认证。

## 修复内容

### 文件: `api/context.ts`

**修改前**: 只支持 cookie 认证
```typescript
export async function createContext(opts: FetchCreateContextFnOptions): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    ctx.user = await authenticateRequest(opts.req.headers);  // 只检查 cookie
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
```

**修改后**: 同时支持 JWT 和 cookie 认证
```typescript
export async function createContext(opts: FetchCreateContextFnOptions): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    // Try JWT authentication first (for local login)
    ctx.user = await authenticateJWT(opts.req.headers);
    
    // Fall back to cookie authentication (for OAuth)
    if (!ctx.user) {
      ctx.user = await authenticateCookie(opts.req.headers);
    }
  } catch (e) {
    console.warn("[context] Authentication failed:", e);
  }
  return ctx;
}
```

## 测试步骤

### 1. 重启项目
```bash
cd C:\Users\0232\Desktop\idea_0.2\app
# 按 Ctrl+C 停止
npm run dev
```

### 2. 登录系统
访问 `http://localhost:3000/login`
- 用户名: `admin`
- 密码: `admin123`

### 3. 测试 API 配置保存
1. 进入"系统设置"页面
2. 输入任意测试内容（如 Kimi API Key: `test-key-123`）
3. 点击"保存所有设置"

### 4. 预期结果
- ✅ 保存成功，显示"保存成功！"提示
- ✅ 刷新页面后，配置仍然保留

## 如果仍有问题

### 检查浏览器控制台
1. 按 F12 打开开发者工具
2. 切换到 Network 标签
3. 点击保存按钮
4. 查看 `system.set` 请求的：
   - Request Headers 中是否有 `Authorization: Bearer xxx`
   - Response 返回什么错误

### 检查后端日志
查看终端中是否有错误信息输出。

## 技术细节

### 认证流程对比

| 登录方式 | Token 存储位置 | 后端验证方式 |
|---------|--------------|-------------|
| Kimi OAuth | Cookie (`session_token`) | `verifySessionToken()` |
| 本地账号 | localStorage + Header | `verifyJWT()` |

### 修复后的验证顺序
1. 先检查 `Authorization: Bearer <token>` header
2. 如果没有，再检查 `Cookie: session_token=<token>`
3. 如果都没有，用户未认证

---

**修复时间**: 2025-04-29
**修复文件**: `api/context.ts`
