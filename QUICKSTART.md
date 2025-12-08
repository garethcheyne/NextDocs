# NextDocs - Quick Start Cheat Sheet

## 🚀 First Time Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd NextDocs

# 2. Setup environment (creates .env with secure passwords)
bash scripts/setup-docker.sh

# 3. Start production
npm run docker:prod

# 4. View logs to confirm it's running
npm run docker:prod:logs
```

**Access:** http://localhost:8101

---

## 📝 Daily Commands

### Production (Yes, this is for production! ✅)

```bash
# Start
npm run docker:prod

# Deploy code changes (fastest - 30 seconds)
npm run docker:prod:rebuild-app

# View logs
npm run docker:prod:logs

# Stop
npm run docker:prod:down

# Backup database
npm run db:backup

# Restore database
npm run db:restore
```

### Development

```bash
# Start
npm run docker:dev

# View logs
npm run docker:dev:logs

# Stop
npm run docker:dev:down
```

---

## 🗂️ Files Overview

### ✅ Commit These (Templates)
- `.env.example` - Local dev template
- `.env.docker.example` - Docker template
- `tests/.env.example` - Testing template
- `docker-compose.dev.yml` - Dev config
- `docker-compose.prod.yml` - Prod config
- All files in `scripts/`
- All `.md` docs

### ❌ Never Commit (Secrets/Data)
- `.env` - Your passwords!
- `backups/*.sql` - Database dumps

---

## 🌱 Database Seeding

```bash
# Seed database (creates sample data)
npx prisma db seed

# OR specific seeders
node prisma/seed-categories.js
node prisma/seed-standalone.js
```

---

## 📍 Ports

| Service | Development | Production |
|---------|------------|------------|
| App | 8100 | 8101 |
| PostgreSQL | 5500 | 5501 |
| Redis | 6400 | 6401 |

---

## 🆘 Help

- Full guide: `README.md`
- Docker details: `DOCKER.md`
- Windows commands: `DOCKER-WINDOWS.md`
- File organization: `DOCKER-FILES.md`

---

## Common Issues

**Port already in use?**
```bash
# Stop conflicting containers
docker ps
docker stop <container-name>
```

**Database won't connect?**
```bash
# Check .env has correct DATABASE_URL
# Should be: postgresql://postgres:YOUR_PASSWORD@postgres:5432/nextdocs
```

**Need to start fresh?**
```bash
npm run docker:clean  # Removes everything
bash scripts/setup-docker.sh  # Setup again
npm run docker:prod
```
