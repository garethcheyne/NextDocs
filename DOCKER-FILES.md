# Docker & Environment Files - What's What

## 📁 Files to Commit to Git (Examples/Templates)

These are **SAFE to commit** - they contain no secrets:

### Environment Templates
- ✅ `.env.example` - **Local development** template
- ✅ `.env.docker.example` - **Docker/Production** template
- ✅ `tests/.env.example` - **Testing** template

### Docker Configuration
- ✅ `docker-compose.dev.yml` - **Development** environment config
- ✅ `docker-compose.prod.yml` - **Production** environment config
- ✅ `Dockerfile` - **Production** container build
- ✅ `Dockerfile.dev` - **Development** container build
- ✅ `.dockerignore` - Files to exclude from Docker builds

### Scripts
- ✅ `scripts/backup-db.sh` - Database backup script
- ✅ `scripts/restore-db.sh` - Database restore script
- ✅ `scripts/backup-cron.sh` - Automated backup (runs in container)
- ✅ `scripts/postgres-init.sh` - PostgreSQL initialization
- ✅ `scripts/setup-docker.sh` - First-time setup wizard
- ✅ `scripts/docker-entrypoint.sh` - Container startup script
- ✅ `scripts/validate-docker.sh` - Validate Docker setup

### Documentation
- ✅ `README.md` - **Main documentation** (start here!)
- ✅ `DOCKER.md` - Complete Docker operations guide
- ✅ `DOCKER-WINDOWS.md` - Windows-specific commands
- ✅ `Makefile` - Simplified commands (optional, Linux/Mac)

## 🚫 Files to NEVER Commit (Local Only)

These are **IGNORED by Git** - they contain secrets/data:

### Environment Files (Actual)
- ❌ `.env` - Your actual environment variables (contains passwords!)
- ❌ `.env.local`
- ❌ `.env.production`
- ❌ `.env.development`

### Backups
- ❌ `backups/*.sql` - Database backups
- ❌ `backups/*.sql.gz` - Compressed backups
- ❌ `backups/pre-restore-*.sql` - Safety backups

### Generated Documentation (Optional)
- ❌ `DOCKER-CHANGES.md` - Summary of changes (temporary)
- ❌ `DOCKER-QUICKREF.md` - Quick reference (temporary)

## 🎯 Which File Do I Use?

### Setting Up Environment Variables

**For Local Development (no Docker):**
```bash
cp .env.example .env
# Edit .env with your local values
```

**For Docker (Dev or Prod):**
```bash
cp .env.docker.example .env
# Edit .env with your Docker values
```

### Running the Application

**Development (with Docker):**
```bash
npm run docker:dev
# Uses: docker-compose.dev.yml + Dockerfile.dev
# Ports: 9980, 5433, 6380
```

**Production (with Docker):**
```bash
npm run docker:prod
# Uses: docker-compose.prod.yml + Dockerfile
# Ports: 9981, 5434, 6381
```

**Local (no Docker):**
```bash
npm run dev
# Uses: .env (you manage your own DB/Redis)
# Port: 9980
```

## 📝 Quick Reference

### Environment Files Explained

| File | Purpose | Contains Secrets? | Commit? |
|------|---------|------------------|---------|
| `.env.example` | Template for local dev | No (examples only) | ✅ Yes |
| `.env.docker.example` | Template for Docker | No (examples only) | ✅ Yes |
| `tests/.env.example` | Template for tests | No (examples only) | ✅ Yes |
| `.env` | Your actual config | Yes (passwords!) | ❌ NO |

### Docker Compose Files Explained

| File | Environment | Ports | Features |
|------|------------|-------|----------|
| `docker-compose.dev.yml` | Development | 9980, 5433, 6380 | Hot reload, volumes |
| `docker-compose.prod.yml` | Production | 9981, 5434, 6381 | Optimized, backups, health checks |

### Dockerfile Explained

| File | Purpose | Build Time |
|------|---------|-----------|
| `Dockerfile` | Production build | ~3-5 min (optimized) |
| `Dockerfile.dev` | Development build | ~1 min (no optimization) |

## 🔍 File Organization Summary

```
NextDocs/
├── .env.example              ✅ COMMIT - Template for local dev
├── .env.docker.example       ✅ COMMIT - Template for Docker
├── .env                      ❌ LOCAL ONLY - Your secrets
├── docker-compose.dev.yml    ✅ COMMIT - Dev environment
├── docker-compose.prod.yml   ✅ COMMIT - Prod environment
├── Dockerfile                ✅ COMMIT - Prod build
├── Dockerfile.dev            ✅ COMMIT - Dev build
├── .dockerignore             ✅ COMMIT - Build exclusions
├── Makefile                  ✅ COMMIT - Command shortcuts
├── README.md                 ✅ COMMIT - Main docs
├── DOCKER.md                 ✅ COMMIT - Docker guide
├── DOCKER-WINDOWS.md         ✅ COMMIT - Windows guide
├── backups/                  ❌ LOCAL ONLY - Database backups
│   └── .gitkeep              ✅ COMMIT - Keep directory
└── scripts/                  ✅ COMMIT - All scripts
    ├── backup-db.sh
    ├── restore-db.sh
    ├── backup-cron.sh
    ├── postgres-init.sh
    ├── setup-docker.sh
    ├── docker-entrypoint.sh
    └── validate-docker.sh
```

## ⚡ Most Common Questions

**Q: I just cloned the repo, what do I do?**

For Docker (recommended):
```bash
bash scripts/setup-docker.sh  # Creates .env with wizard
npm run docker:prod           # Starts everything
```

For local development:
```bash
cp .env.example .env          # Copy template
# Edit .env with your values
npm install
npm run dev
```

**Q: Which docker-compose file should I use?**

- Developing/testing? → `docker-compose.dev.yml` (via `npm run docker:dev`)
- Deploying/production? → `docker-compose.prod.yml` (via `npm run docker:prod`)

**Q: Where are the seed files?**

- `prisma/seed-standalone.js` - Main seeder (run automatically with `npx prisma db seed`)
- `prisma/seed-categories.js` - Categories only

**Q: How do I backup my database?**

```bash
npm run db:backup
```

Backups saved to `backups/` directory (not committed to git).

**Q: What's the difference between dev and prod?**

| Feature | Development | Production |
|---------|------------|------------|
| Hot Reload | ✅ Yes | ❌ No |
| Build Optimization | ❌ No | ✅ Yes |
| Startup Time | Fast | Slower |
| Runtime Performance | Slower | Fast |
| Source Code Mounted | ✅ Yes | ❌ No |
| Automated Backups | ❌ No | ✅ Yes |
| Port | 9980 | 9981 |

**Q: Can I delete DOCKER-CHANGES.md and DOCKER-QUICKREF.md?**

Yes! Those were temporary summaries. Everything important is in:
- `README.md` (start here)
- `DOCKER.md` (complete guide)
- `DOCKER-WINDOWS.md` (Windows commands)

## 💡 Pro Tips

1. **Never commit `.env`** - It contains your passwords!
2. **Use the wizard** - `bash scripts/setup-docker.sh` generates secure passwords
3. **Backup before changes** - `npm run db:backup` before migrations
4. **Dev for development** - Use dev mode when coding (`npm run docker:dev`)
5. **Prod for deployment** - Use prod mode when deploying (`npm run docker:prod`)
