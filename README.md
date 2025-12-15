# NextDocs

Enterprise documentation platform with Azure DevOps & GitHub sync, feature requests, and comprehensive admin tools.

## Quick Start

### Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (copy and edit)
cp .env.example .env

# 3. Start database with Docker
npm run docker:dev

# 4. In another terminal, run migrations and seed
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
```

Access at: http://localhost:8100

### Production (Docker)

```bash
# 1. Set up environment
cp .env.docker.example .env
# Edit .env with your production values

# 2. Start all services (PostgreSQL, Redis, Next.js)
npm run docker:prod

# 3. View logs
npm run docker:prod:logs
```

Access at: http://localhost:8101

## What's Included

- **Next.js 16** - React framework with App Router
- **PostgreSQL** - Primary database with Prisma ORM
- **Redis** - Caching and session storage
- **NextAuth.js** - Azure AD SSO authentication
- **TailwindCSS** - Styling with shadcn/ui components
- **MDX** - Enhanced markdown for documentation
- **Full-text Search** - PostgreSQL vector search
- **Azure DevOps/GitHub Sync** - Automated repository syncing
- **Admin Portal** - User management, settings, analytics
- **API Documentation** - Swagger/Redoc integration

## Project Structure

The project follows a clean, organized structure. See [`PROJECT-STRUCTURE.md`](PROJECT-STRUCTURE.md) for detailed documentation.

```
├── src/                 # Application source code
├── scripts/             # Organized operational scripts (6 categories)
├── docs/                # Comprehensive documentation
├── prisma/              # Database schema and migrations
├── public/              # Static assets  
├── backups/             # Database backups (automated)
├── docker-compose.*.yml # Docker configurations
└── [config files]      # TypeScript, Next.js, Tailwind, etc.
```

## Environment Setup

### Required Environment Variables

Copy `.env.example` (for local dev) or `.env.docker.example` (for Docker) to `.env`:

**Database:**
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_PASSWORD` - Database password

**Authentication:**
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Random secret (min 32 chars)
- `ENCRYPTION_KEY` - 64-char hex string

**Azure AD (for SSO):**
- `AZURE_AD_CLIENT_ID`
- `AZURE_AD_CLIENT_SECRET`
- `AZURE_AD_TENANT_ID`

**Redis:**
- `REDIS_URL` - Redis connection string
- `REDIS_PASSWORD` - Redis password

## Database

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name description

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Seeding

```bash
# Seed the database
npx prisma db seed

# Seed specific data
node prisma/seed-categories.js
```

**Seed Files:**
- `prisma/seed-standalone.js` - Main seeder (users, categories, sample docs)
- `prisma/seed-categories.js` - Categories only

### Studio

```bash
# Open Prisma Studio to view/edit data
npm run db:studio
```

## Docker Commands

### Development Mode

```bash
npm run docker:dev           # Start dev containers
npm run docker:dev:build     # Rebuild dev containers
npm run docker:dev:logs      # View logs
npm run docker:dev:down      # Stop containers
```

**Features:**
- Hot reload enabled
- Source code mounted as volumes
- Fast startup, no build optimization

**Ports:**
- App: 8100
- PostgreSQL: 5500
- Redis: 6400

### Production Mode

```bash
npm run docker:prod              # Start production
npm run docker:prod:build        # Full rebuild (dependencies changed)
npm run docker:prod:rebuild-app  # Quick rebuild (code only, ~30s)
npm run docker:prod:logs         # View logs
npm run docker:prod:down         # Stop containers
```

**Features:**
- Optimized multi-stage build
- Standalone Next.js output
- Resource limits & health checks
- Automated daily backups (2 AM)

**Ports:**
- App: 8101
- PostgreSQL: 5501
- Redis: 6401

### Database Backups

```bash
npm run db:backup    # Manual backup
npm run db:restore   # Restore from backup
npm run docker:backup # Trigger automated backup
```

Backups stored in `./backups/` directory (automatically cleaned after 7 days).

## Common Tasks

### Update Code in Production

```bash
# Fastest - rebuild app only (~30 seconds)
npm run docker:prod:rebuild-app
npm run docker:prod:logs
```

### Update Dependencies

```bash
# Full rebuild needed
npm run docker:prod:build
```

### Database Schema Changes

```bash
# 1. Backup first!
npm run db:backup

# 2. Apply migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 3. Restart app
docker-compose -f docker-compose.prod.yml restart app
```

### Switch Between Dev/Prod

```bash
# Dev to Prod
npm run docker:dev:down
npm run docker:prod

# Prod to Dev  
npm run docker:prod:down
npm run docker:dev
```

## Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:cli

# E2E tests (Playwright)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

## Troubleshooting

### Container won't start

```bash
# Check what's running
docker ps

# Check logs
npm run docker:prod:logs

# Restart
npm run docker:prod:down
npm run docker:prod
```

### Database connection issues

```bash
# Check database health
docker exec nextdocs-postgres-prod pg_isready -U postgres

# Verify .env has correct DATABASE_URL
# Should be: postgresql://postgres:YOUR_PASSWORD@postgres:5432/nextdocs
```

### Port already in use

Change ports in `docker-compose.prod.yml` or `docker-compose.dev.yml`:

```yaml
ports:
  - "YOUR_PORT:8100"  # Change YOUR_PORT
```

## Documentation

- **DOCKER.md** - Complete Docker operations guide
- **DOCKER-WINDOWS.md** - Windows-specific commands (no Make required)
- **.env.example** - Local development environment template
- **.env.docker.example** - Docker/production environment template

## Technology Stack

- **Framework:** Next.js 16 (React 19)
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **ORM:** Prisma
- **Auth:** NextAuth.js v5
- **Styling:** TailwindCSS + shadcn/ui
- **Testing:** Jest + Playwright
- **Deployment:** Docker + Docker Compose

## License

Private/Enterprise Use

## Support

For issues or questions, see detailed guides:
- Docker setup: `DOCKER.md`
- Windows commands: `DOCKER-WINDOWS.md`
