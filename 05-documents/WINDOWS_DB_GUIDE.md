# Windows 10 数据库部署指南 — 极光职途

## 推荐方案

> **MySQL 8.0 + MySQL Workbench** — 项目已配置好 MySQL，无需改代码，可视化界面管理数据库。

或者如果你追求**极简**，用 **Docker Desktop** 一键启动（不用安装 MySQL，推荐）。

---

## 方案一：Docker Desktop（最简单，推荐新手）

Docker 是一个"集装箱"，可以一键启动 MySQL，用完随时删除，不影响系统。

### 步骤 1：下载安装 Docker Desktop

1. 访问 https://www.docker.com/products/docker-desktop/
2. 点击 **"Download for Windows"** 下载
3. 双击安装，一路默认选项，提示开启 WSL2 时选择 **"Yes"**
4. 重启电脑
5. 打开 Docker Desktop，等左下角显示 **"Engine running"**（绿色）

### 步骤 2：一键启动 MySQL

在桌面新建一个文件夹，比如 `C:\Users\你的用户名\aurora-mysql`，里面创建两个文件：

**docker-compose.yml**
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

volumes:
  mysql_data:
```

然后打开 PowerShell（Win+X 按 A），进入这个文件夹：

```powershell
cd C:\Users\你的用户名\aurora-mysql
docker-compose up -d
```

看到 `Done` 就完成了！MySQL 已经在后台运行。

### 步骤 3：修改项目 .env

```env
DATABASE_URL=mysql://aurora:123456@localhost:3306/aurora_career
```

### 步骤 4：建表

```bash
cd aurora-career
npm run db:push
```

**优点**：不用装 MySQL、不会污染系统、随时删除重装、可视化看容器状态。

---

## 方案二：安装 MySQL + MySQL Workbench（经典方案）

### 步骤 1：下载 MySQL Installer

1. 访问 https://dev.mysql.com/downloads/installer/
2. 下载 **Windows (x86, 64-bit), MSI Installer** 较大的那个（约 300MB）
3. 选择 **"No thanks, just start my download."**

### 步骤 2：安装（关键步骤）

双击安装包，选择 **"Server only"**（只安装服务器，最小化安装）：

1. **Choosing a Setup Type** → 选 **"Server only"** → Next
2. **Installation** → Execute → Next
3. **Product Configuration** → Next
4. **Type and Networking** → 默认即可 → Next
5. **Authentication Method** → 选 **"Use Strong Password Encryption"** → Next
6. **Accounts and Roles** → 
   - Root Password: 输入 `123456`（记住这个密码！）
   - Add User: 可选，暂时不加 → Next
7. **Windows Service** → 默认勾选 → Next
8. **Apply Configuration** → Execute → Finish

MySQL 已经安装完成，并且自动作为 Windows 服务启动。

### 步骤 3：安装 MySQL Workbench（可视化界面）

回到安装器（或者重新运行安装包），选择 **"Add"**，然后选 **"Applications" → "MySQL Workbench"**。

或者单独下载：https://dev.mysql.com/downloads/workbench/

### 步骤 4：用 Workbench 创建数据库

打开 MySQL Workbench：

1. 点击左侧 **"Local instance MySQL80"**
2. 输入 root 密码 `123456`
3. 看到界面后，点击上方 **Query 1** 标签
4. 粘贴以下 SQL，点击 **闪电按钮**（Execute）执行：

```sql
CREATE DATABASE aurora_career CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. 左侧 Navigator → **Schemas** 标签 → 刷新，看到 `aurora_career` 说明成功！

### 步骤 5：修改项目配置

打开项目根目录的 `.env` 文件，修改：

```env
DATABASE_URL=mysql://root:123456@localhost:3306/aurora_career
```

### 步骤 6：建表并启动

```bash
cd aurora-career
npm run db:push
npm run dev
```

---

## 方案对比

| 方案 | 难度 | 可视化 | 系统影响 | 推荐度 |
|------|------|--------|----------|--------|
| **Docker** | 低 | Docker Desktop 看容器 | 零污染 | ⭐⭐⭐⭐⭐ |
| **MySQL安装** | 中 | Workbench 功能全 | 安装到系统 | ⭐⭐⭐⭐ |

---

## 常见问题

### Q: 提示 "mysql 命令不存在"

Docker 方案：不需要 mysql 命令，直接 `docker-compose up -d`

MySQL 安装方案：把 MySQL 的 bin 目录加入系统 PATH：
- `C:\Program Files\MySQL\MySQL Server 8.0\bin`
- 控制面板 → 系统 → 高级系统设置 → 环境变量 → Path → 新建 → 粘贴上面路径

### Q: 怎么确认 MySQL 在运行？

```powershell
# 查看服务状态
Get-Service MySQL80

# 或者 Workbench 能连上就是运行中
```

### Q: Workbench 怎么查看表？

左侧 Navigator → Schemas → 展开 `aurora_career` → Tables → 双击表名查看数据。

### Q: 怎么重置数据库？

```sql
-- Workbench 中执行
DROP DATABASE aurora_career;
CREATE DATABASE aurora_career CHARACTER SET utf8mb4;
```

然后 `npm run db:push` 重新建表。

### Q: 密码忘了怎么办？

```powershell
# 停止 MySQL
net stop MySQL80

# 跳过权限启动（重置密码）
mysqld --console --skip-grant-tables --shared-memory

# 新开一个命令行
mysql -u root

# 在 mysql> 提示符下执行
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
FLUSH PRIVILEGES;
EXIT;
```