# Windows Docker Commands

Since `make` is not available on Windows by default, here are the equivalent npm scripts for all common operations.

## 🚀 Quick Commands (Copy & Paste)

### Production

```powershell
# Start production
npm run docker:prod

# Quick deploy (app rebuild only - FASTEST)
npm run docker:prod:rebuild-app

# Full rebuild
npm run docker:prod:build

# Stop
npm run docker:prod:down

# View logs
npm run docker:prod:logs
```

### Development

```powershell
# Start development
npm run docker:dev

# Rebuild
npm run docker:dev:build

# View logs
npm run docker:dev:logs

# Stop
npm run docker:dev:down
```

### Database

```powershell
# Backup
npm run db:backup

# Restore
npm run db:restore

# Trigger automated backup
npm run docker:backup
```

### Cleanup

```powershell
# Remove all containers and volumes
npm run docker:clean
```

## 📋 Full Command Reference

| Operation | npm Command |
|-----------|------------|
| **Production** |
| Start production | `npm run docker:prod` |
| Build & start | `npm run docker:prod:build` |
| Rebuild app only | `npm run docker:prod:rebuild-app` |
| Stop production | `npm run docker:prod:down` |
| View logs | `npm run docker:prod:logs` |
| **Development** |
| Start development | `npm run docker:dev` |
| Build & start | `npm run docker:dev:build` |
| Stop development | `npm run docker:dev:down` |
| View logs | `npm run docker:dev:logs` |
| **Database** |
| Backup database | `npm run db:backup` |
| Restore database | `npm run db:restore` |
| Trigger backup service | `npm run docker:backup` |
| **Cleanup** |
| Clean all | `npm run docker:clean` |

## 🔧 Advanced Operations (Direct Docker Compose)

For operations not covered by npm scripts, use docker-compose directly:

### Production Environment

```powershell
# Restart app only
docker-compose -f docker-compose.prod.yml restart app

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis

# Check status
docker-compose -f docker-compose.prod.yml ps

# Stop specific service
docker-compose -f docker-compose.prod.yml stop app

# Remove containers (keep volumes)
docker-compose -f docker-compose.prod.yml down

# Remove everything including volumes
docker-compose -f docker-compose.prod.yml down -v

# Rebuild specific service
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d app
```

### Development Environment

```powershell
# Restart app only
docker-compose -f docker-compose.dev.yml restart app

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Shell access
docker-compose -f docker-compose.dev.yml exec app sh
```

## 🐚 Container Shell Access

```powershell
# Production app
docker exec -it nextdocs-app-prod sh

# Development app
docker exec -it nextdocs-app-dev sh

# PostgreSQL (production)
docker exec -it nextdocs-postgres-prod psql -U postgres -d nextdocs

# PostgreSQL (development)
docker exec -it nextdocs-postgres-dev psql -U postgres -d nextdocs

# Redis (production)
docker exec -it nextdocs-redis-prod redis-cli -a YOUR_REDIS_PASSWORD

# Redis (development)
docker exec -it nextdocs-redis-dev redis-cli -a YOUR_REDIS_PASSWORD
```

## 📊 Monitoring

```powershell
# View all containers
docker ps

# View logs of specific container
docker logs nextdocs-app-prod
docker logs nextdocs-postgres-prod
docker logs nextdocs-redis-prod
docker logs nextdocs-backup-service

# Follow logs
docker logs -f nextdocs-app-prod

# View resource usage
docker stats --no-stream

# View container details
docker inspect nextdocs-app-prod
```

## 🔍 Troubleshooting

### Check Service Health

```powershell
# All containers status
docker ps --filter "name=nextdocs"

# Specific health check
docker exec nextdocs-postgres-prod pg_isready -U postgres
docker exec nextdocs-redis-prod redis-cli -a YOUR_REDIS_PASSWORD ping

# Check app health endpoint
curl http://localhost:9981/api/health
```

### View Configuration

```powershell
# See resolved docker-compose config
docker-compose -f docker-compose.prod.yml config

# See environment variables
docker-compose -f docker-compose.prod.yml exec app env
```

### Restart Services

```powershell
# Restart app
docker-compose -f docker-compose.prod.yml restart app

# Restart database
docker-compose -f docker-compose.prod.yml restart postgres

# Restart redis
docker-compose -f docker-compose.prod.yml restart redis

# Restart everything
docker-compose -f docker-compose.prod.yml restart
```

## 🛠️ Common Workflows

### Deploy Code Changes

```powershell
# 1. Rebuild app only (fastest - ~30 seconds)
npm run docker:prod:rebuild-app

# 2. Check logs
npm run docker:prod:logs

# 3. Verify health
docker ps --filter "name=nextdocs"
```

### Deploy with Dependencies Update

```powershell
# 1. Backup first
npm run db:backup

# 2. Full rebuild
npm run docker:prod:build

# 3. Monitor startup
npm run docker:prod:logs
```

### Database Migration

```powershell
# 1. Backup database
npm run db:backup

# 2. Run migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 3. Restart app
docker-compose -f docker-compose.prod.yml restart app
```

### Switch Between Environments

```powershell
# Stop production, start development
npm run docker:prod:down
npm run docker:dev

# Stop development, start production
npm run docker:dev:down
npm run docker:prod
```

## 📝 Creating Shortcuts (Optional)

Create PowerShell aliases by adding to your PowerShell profile:

```powershell
# Open profile
notepad $PROFILE

# Add these aliases
function docker-prod { npm run docker:prod }
function docker-dev { npm run docker:dev }
function docker-logs { npm run docker:prod:logs }
function docker-rebuild { npm run docker:prod:rebuild-app }
function docker-backup { npm run db:backup }

# Save and reload
. $PROFILE
```

Then you can use:
```powershell
docker-prod      # Start production
docker-logs      # View logs
docker-rebuild   # Rebuild app
docker-backup    # Backup database
```

## 🎯 Most Used Commands Summary

```powershell
# Daily development
npm run docker:dev              # Start dev
# (make changes - auto reloads)
npm run docker:dev:down         # Stop

# Production deployment
npm run docker:prod:rebuild-app # Deploy code changes
npm run docker:prod:logs        # Check logs

# Database operations  
npm run db:backup               # Before changes
npm run db:restore              # If needed

# Emergency
docker-compose -f docker-compose.prod.yml restart app  # Restart app
docker-compose -f docker-compose.prod.yml down         # Stop all
```

## 🆘 Help

- For npm script help: `npm run`
- For Docker help: `docker --help`
- For docker-compose help: `docker-compose --help`

See **DOCKER.md** for complete documentation.
