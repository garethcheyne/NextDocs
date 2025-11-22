# Production Deployment Guide

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- Domain name configured (optional but recommended)
- SSL certificates (if using Nginx profile)

## Quick Start

### 1. Environment Configuration

Create `.env.production` from the template:

```bash
cp .env.production.example .env.production
```

Update the following required variables in `.env.production`:

```env
# Strong passwords (use openssl rand -base64 32)
DATABASE_URL="postgresql://postgres:YOUR_STRONG_DB_PASSWORD@postgres:5432/nextdocs?schema=public"
REDIS_URL="redis://:YOUR_STRONG_REDIS_PASSWORD@redis:6379"
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET"
ENCRYPTION_KEY="YOUR_GENERATED_KEY"
WORKER_SECRET="YOUR_GENERATED_SECRET"

# Your production domain
NEXTAUTH_URL="https://yourdomain.com"

# Azure AD credentials
AZURE_AD_CLIENT_ID="..."
AZURE_AD_CLIENT_SECRET="..."
AZURE_AD_TENANT_ID="..."

# Azure DevOps credentials
AZURE_DEVOPS_ORG_URL="..."
AZURE_DEVOPS_PAT="..."
AZURE_DEVOPS_PROJECT="..."

# EWS Email (if using notifications)
EWS_USERNAME="notifications@yourdomain.com"
EWS_PASSWORD="..."
```

**Generate secure secrets:**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32

# Generate WORKER_SECRET
openssl rand -base64 32
```

### 2. Update docker-compose.prod.yml

Update the Redis password in `docker-compose.prod.yml` to match your `.env.production`:

```yaml
redis:
  command: redis-server --requirepass YOUR_STRONG_REDIS_PASSWORD --appendonly yes
```

Update the PostgreSQL password environment variable:

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: YOUR_STRONG_DB_PASSWORD
```

### 3. Build and Start Services

```bash
# Build the production image
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Initialize Database

Run Prisma migrations:

```bash
# Access the app container
docker-compose -f docker-compose.prod.yml exec app sh

# Inside container: Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed

# Exit container
exit
```

### 5. Verify Deployment

Check health status:

```bash
curl http://localhost:9980/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "connected",
    "application": "running"
  }
}
```

Check service status:

```bash
docker-compose -f docker-compose.prod.yml ps
```

All services should show "Up (healthy)".

### 6. Access Application

- Application: http://localhost:9980
- With Nginx (if using): http://localhost (port 80) or https://localhost (port 443)

## Using Nginx Reverse Proxy (Optional)

### Setup SSL Certificates

1. Place your SSL certificates:

```bash
mkdir -p nginx/ssl
# Copy your certificates
cp /path/to/fullchain.pem nginx/ssl/
cp /path/to/privkey.pem nginx/ssl/
```

2. Create Nginx configuration:

```bash
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
upstream nextjs {
    server app:9980;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

3. Start with Nginx profile:

```bash
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d
```

## Database Management

### Backup Database

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres nextdocs > backups/nextdocs_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
cat backups/nextdocs_YYYYMMDD_HHMMSS.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres nextdocs
```

### Access Database CLI

```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres nextdocs
```

## Monitoring and Logs

### View Application Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis
```

### Check Resource Usage

```bash
docker stats
```

### Check Health Status

```bash
# All services health check
docker-compose -f docker-compose.prod.yml ps

# Application health endpoint
curl http://localhost:9980/api/health
```

## Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild image
docker-compose -f docker-compose.prod.yml build app

# Restart application
docker-compose -f docker-compose.prod.yml up -d app

# Run new migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart app
```

### Stop Services

```bash
# Stop all services (keeps data)
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (DELETES ALL DATA)
docker-compose -f docker-compose.prod.yml down -v
```

## Security Checklist

- [ ] Strong passwords set for PostgreSQL and Redis
- [ ] `NEXTAUTH_SECRET` generated with `openssl rand -base64 32`
- [ ] `ENCRYPTION_KEY` generated with `openssl rand -base64 32`
- [ ] `WORKER_SECRET` generated with `openssl rand -base64 32`
- [ ] `.env.production` not committed to Git (in `.gitignore`)
- [ ] SSL certificates configured (if using Nginx)
- [ ] Firewall rules configured (only expose necessary ports)
- [ ] Regular database backups scheduled
- [ ] Azure AD credentials are production-specific
- [ ] EWS service account has minimum required permissions

## Troubleshooting

### Container Won't Start

Check logs:

```bash
docker-compose -f docker-compose.prod.yml logs app
```

Common issues:

- Database not ready: Wait for PostgreSQL health check
- Missing environment variables: Check `.env.production`
- Port already in use: Change port in `docker-compose.prod.yml`

### Database Connection Errors

Verify database is healthy:

```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
```

Check connection string in `.env.production`:

```env
# Should use internal Docker network host
DATABASE_URL="postgresql://postgres:PASSWORD@postgres:5432/nextdocs?schema=public"
```

### Redis Connection Errors

Test Redis connectivity:

```bash
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a YOUR_REDIS_PASSWORD ping
```

Should return `PONG`.

### Application Health Check Failing

Access application logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

Test health endpoint manually:

```bash
docker-compose -f docker-compose.prod.yml exec app wget -O- http://localhost:9980/api/health
```

## Performance Tuning

### PostgreSQL

Add to `docker-compose.prod.yml` under postgres service:

```yaml
command:
  - "postgres"
  - "-c"
  - "max_connections=200"
  - "-c"
  - "shared_buffers=256MB"
  - "-c"
  - "effective_cache_size=1GB"
```

### Redis

Already configured with AOF persistence. For more performance:

```yaml
command: redis-server --requirepass PASSWORD --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Next.js

Environment variables in `.env.production`:

```env
# Increase ISR cache time
REVALIDATE_TIME="3600"

# Disable telemetry in production
NEXT_TELEMETRY_DISABLED="1"
```

## Production Architecture

```
┌─────────────────────────────────────────┐
│          Nginx (Optional)               │
│  - SSL Termination                      │
│  - Reverse Proxy                        │
│  - Static Asset Caching                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Next.js Application            │
│  - Port 9980                            │
│  - Multi-stage Docker Build             │
│  - Non-root User (nextjs:nodejs)        │
│  - Health Check: /api/health            │
└──────┬───────────────────────┬──────────┘
       │                       │
┌──────▼──────────┐    ┌──────▼──────────┐
│   PostgreSQL 16 │    │    Redis 7      │
│  - Port 5432    │    │  - Port 6379    │
│  - Named Volume │    │  - AOF Enabled  │
│  - Health Check │    │  - Named Volume │
└─────────────────┘    └─────────────────┘
```

## Scaling Considerations

### Horizontal Scaling

To run multiple app instances behind a load balancer:

1. Use external PostgreSQL and Redis (not Docker containers)
2. Configure session affinity for WebSocket connections
3. Use shared file system for uploaded images (or S3)

### Vertical Scaling

Update resource limits in `docker-compose.prod.yml`:

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

## Support

For issues or questions:

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify health: `curl http://localhost:9980/api/health`
3. Review environment: `.env.production` configuration
4. Check service status: `docker-compose -f docker-compose.prod.yml ps`
