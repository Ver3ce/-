# Migration Guide

## Project Info

- **Project Name**: Resume System (idea_0.2)
- **Pack Time**: 2026-04-29 16:24:34
- **Source**: C:\Users\0232\Desktop\idea_0.2

---

## Directory Structure

### 01-source-code
Source code files:
- `api/` - Backend API
- `contracts/` - Type definitions
- `db/` - Database code
- `src/` - Frontend code
- Config files (tsconfig, vite, tailwind, etc.)

### 02-database
Database scripts:
- `init.sql` - Database initialization
- `schema.ts` - Drizzle ORM schema
- `seed.ts` - Seed data

### 03-config
Configuration files:
- `.env.example` - Environment template
- `docker-compose.yml` - Docker config
- `Dockerfile` - Docker image
- `.gitignore` - Git ignore rules
- **⚠️ .env contains sensitive data**

### 04-environment
Environment setup:
- `package.json` - Node.js dependencies
- `requirements.txt` - Python dependencies
- `setup_env.bat` - Auto setup script

### 05-documents
Project documents:
- `README.md` - Project readme
- `ARCHITECTURE.md` - Architecture doc
- `AI-SETUP.md` - AI setup guide
- Other docs

### 06-tools
Utility scripts:
- `gen_resume.py` - Resume generator
- `scripts/` - Helper scripts

---

## Quick Start

### Requirements

1. **Node.js** 18+ 
2. **Python** 3.10+
3. **PostgreSQL** 14+ (or Docker)

### Setup

#### Method 1: Auto Setup

1. Go to `04-environment` folder
2. Run `setup_env.bat`
3. Wait for completion

#### Method 2: Manual Setup

**1. Install Node.js dependencies**
```bash
cd 01-source-code
npm install
```

**2. Install Python dependencies**
```bash
cd 04-environment
pip install -r requirements.txt
```

**3. Configure environment**
```bash
cd 01-source-code
copy .env.example .env
# Edit .env with your settings
```

**4. Initialize database**
```bash
# Using Docker
npm run db:up

# Or manual
psql -U postgres -f ..\02-database\init.sql
```

**5. Start project**
```bash
npm run dev
```

---

## Important Notes

### 1. Environment Variables
- Copy `03-config\.env.example` to `.env`
- Fill in database credentials and API keys
- **Never commit .env to git**

### 2. Database
- Ensure PostgreSQL is running
- Default DB: `resume_system`
- Default user: `postgres`
- Edit `02-database\init.sql` if needed

### 3. Python Environment
- Resume tool needs Python 3.10+
- Packages: reportlab, pillow, charset-normalizer

---

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Database
npm run db:up      # Start DB container
npm run db:down    # Stop DB container
npm run db:push    # Push schema changes
npm run db:studio  # Open Drizzle Studio

# Generate resume
python 06-tools\gen_resume.py
```

---

## Support

See docs in `05-documents\`:
- `README.md` - Project readme
- `WINDOWS_DB_GUIDE.md` - Windows DB setup
- `AI-SETUP.md` - AI configuration

---

**Pack Time**: 2026-04-29 16:24:34
