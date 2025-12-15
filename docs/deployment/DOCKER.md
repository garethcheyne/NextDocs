# Docker Operations Guide

This guide covers all Docker operations for the NextDocs application.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Development vs Production](#development-vs-production)
- [Common Operations](#common-operations)
- [Database Backups](#database-backups)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Development Environment
```bash
# Start development environment
npm run docker:dev

# Or using Make
make dev-up

# View logs
npm run docker:dev:logs
make dev-logs
```

### Production Environment
```bash
# Start production environment
npm run docker:prod

# Or using Make
make prod-up

# View logs
npm run docker:prod:logs
make prod-logs
```

## 🔧 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
POSTGRES_PASSWORD=your_secure_password_here

# Redis
REDIS_PASSWORD=your_redis_password_here

# NextAuth
NEXTAUTH_URL=https://docs.harveynorman.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# Encryption
ENCRYPTION_KEY=your_encryption_key_here

# Azure AD (if using)
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_CLIENT_SECRET=your_client_secret
AZURE_AD_TENANT_ID=your_tenant_id
```

## 🏗️ Development vs Production

### Development (`docker-compose.dev.yml`)
- **Hot Reload**: Source code changes automatically reload
- **Port**: `8100` (app), `5500` (postgres), `6400` (redis)
- **Volumes**: Source code mounted for live editing
- **Purpose**: Active development and testing
- **Performance**: Slower (no optimization)

### Production (`docker-compose.prod.yml`)
- **Optimized Build**: Multi-stage build with standalone output
- **Port**: `8101` (app), `5501` (postgres), `6401` (redis)
- **Volumes**: Only data volumes (no source code)
- **Purpose**: Production deployment
- **Performance**: Fast (optimized bundle)
- **Extras**: Automated backups, resource limits, health checks

## 📝 Common Operations

### Building & Rebuilding

#### Full Rebuild (All Services)
```bash
# Development
npm run docker:dev:build
make dev-rebuild

# Production
npm run docker:prod:build
make prod-build
```

#### Rebuild App Only (Fast) ⚡
This is the most common operation when you update code:
```bash
# Production - rebuilds only the app using cache
npm run docker:prod:rebuild-app
make prod-rebuild-app

# This is ~10x faster than full rebuild!
```

#### Rebuild Everything from Scratch
```bash
# Removes all cache and rebuilds
make prod-build  # Uses --no-cache flag
```

### Starting & Stopping

```bash
# Start
npm run docker:prod
make prod-up

# Stop (preserves volumes)
npm run docker:prod:down
make prod-down

# Restart app only
make prod-restart-app
```

### Viewing Logs

```bash
# All services
npm run docker:prod:logs
make prod-logs

# App only
make prod-logs-app

# Development
npm run docker:dev:logs
make dev-logs
```

### Shell Access

```bash
# Production app container
make prod-shell

# Development app container
make dev-shell

# Database shell
make db-shell
```

## 💾 Database Backups

### Automated Backups
The production environment includes an automated backup service that:
- Runs daily at 2 AM
- Compresses backups (`.sql.gz`)
- Keeps last 7 days of backups
- Stores in `./backups` directory

### Manual Backups

```bash
# Create immediate backup
npm run db:backup
make backup

# Trigger backup service manually
npm run docker:backup
make backup-now
```

### Restore from Backup

```bash
# Interactive restore
npm run db:restore
make restore

# Direct restore (if you know the filename)
bash scripts/restore-db.sh ./backups/backup-20231123-140000.sql.gz
```

### List Available Backups

```bash
ls -lh ./backups/
```

## 🛠️ Troubleshooting

### App Won't Build

**Problem**: Build fails during production build
**Solution**: 
```bash
# Check for syntax errors
npm run lint

# Clear build cache and rebuild
make prod-build
```

### Database Connection Issues

**Problem**: App can't connect to database
**Solution**:
```bash
# Check database health
docker exec nextdocs-postgres-prod pg_isready -U postgres

# Restart database
docker-compose -f docker-compose.prod.yml restart postgres

# Check logs
docker logs nextdocs-postgres-prod
```

### Port Already in Use

**Problem**: Port 9981 (or others) already in use
**Solution**:
```bash
# Find what's using the port
netstat -ano | findstr :9981

# Stop the service or change port in docker-compose.prod.yml
```

### Out of Memory

**Problem**: Container keeps restarting
**Solution**:
```bash
# Check container stats
make stats

# Increase memory limits in docker-compose.prod.yml
# Under 'deploy.resources.limits.memory'
```

### Backup Service Not Running

**Problem**: Automated backups aren't working
**Solution**:
```bash
# Check backup service logs
docker logs nextdocs-backup-service

# Manually trigger backup to test
make backup-now

# Restart backup service
docker-compose -f docker-compose.prod.yml restart db-backup
```

### Redis Connection Issues

**Problem**: Cache/session errors
**Solution**:
```bash
# Check Redis health
docker exec nextdocs-redis-prod redis-cli -a $REDIS_PASSWORD ping

# Flush Redis cache
docker exec nextdocs-redis-prod redis-cli -a $REDIS_PASSWORD FLUSHALL

# Restart Redis
docker-compose -f docker-compose.prod.yml restart redis
```

## 🧹 Cleanup

### Remove Development Environment
```bash
npm run docker:clean
make clean-dev
```

### Remove Production Containers (Keep Data)
```bash
make clean-prod
```

### Remove Everything (Including Data)
```bash
make clean  # Interactive confirmation required
```

## 📊 Monitoring

### Service Status
```bash
make status
```

### Health Checks
```bash
make health
```

### Resource Usage
```bash
make stats
```

## 🔄 Migration Workflow

When deploying changes:

1. **Code Changes Only** (fastest):
   ```bash
   make quick-deploy
   ```

2. **Dependencies Changed** (package.json):
   ```bash
   make prod-rebuild-app
   ```

3. **Database Schema Changes**:
   ```bash
   # Create backup first
   make backup
   
   # Apply migrations
   make db-migrate
   
   # Rebuild app
   make prod-rebuild-app
   ```

4. **Full Environment Update**:
   ```bash
   make rebuild-all
   ```

## 🎯 Best Practices

1. **Always backup before major changes**:
   ```bash
   make backup
   ```

2. **Use quick-deploy for code updates**:
   ```bash
   make quick-deploy
   ```

3. **Monitor logs after deployment**:
   ```bash
   make prod-logs-app
   ```

4. **Check health after restart**:
   ```bash
   make health
   ```

5. **Keep backups organized**:
   - Automated daily backups at 2 AM
   - Manual backups before major changes
   - Backups retained for 7 days
   - Old backups automatically cleaned up

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `make prod-logs`
2. Verify health: `make health`
3. Check status: `make status`
4. Review this troubleshooting guide
5. Create a backup before making changes: `make backup`
