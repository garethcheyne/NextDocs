# Prisma Configuration Notes

## Current Version
- **Prisma ORM**: `6.19.0`
- **@prisma/client**: `6.19.0`
- **Node.js**: `20.x` (Alpine in Docker)

---

## Recent Changes (January 2026)

### 1. Removed Deprecated `package.json#prisma` Config
**Issue**: Deprecation warning about `package.json#prisma` configuration
```
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7.
```

**Action Taken**: Removed the following from `package.json`:
```json
"prisma": {
  "seed": "node prisma/seed-standalone.js"
}
```

**Reason**: This config is deprecated in Prisma 6 and will be removed in Prisma 7. The seed script is available for manual execution when needed.

---

### 2. Docker Build DATABASE_URL Fix
**Issue**: `npm run build` requires DATABASE_URL during Prisma Client generation, but real database isn't available at build time.

**Solution**: Added dummy DATABASE_URL in `Dockerfile` builder stage:
```dockerfile
# Stage 2: Builder
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
```

**Important**: 
- ✅ This is a **dummy value** only for build time
- ✅ Real DATABASE_URL is injected by `docker-compose` at runtime
- ✅ Production database connection is NOT affected
- ✅ This is a standard pattern for Next.js + Prisma Docker builds

---

## Production Deployment Notes

### Database Migrations
Migrations are **automatically applied** when Docker containers start via:
```bash
npx prisma db push --accept-data-loss
```

This happens in:
- **Dev mode**: `Dockerfile.dev` CMD runs `prisma db push`
- **Production**: `docker-entrypoint.sh` runs migrations before starting app

### Manual Database Seeding
If seeding is required:
```bash
# Inside container
docker-compose -f docker-compose.prod.yml exec app node prisma/seed-standalone.js

# Or locally (if database accessible)
node prisma/seed-standalone.js
```

### Environment Variables Required
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

---

## Prisma 7 Upgrade Considerations

**When upgrading to Prisma 7** (future), the following breaking changes will apply:

### Required Changes:
1. **Create `prisma.config.ts`** at project root:
```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed-standalone.js',
  },
})
```

2. **Update Prisma Client instantiation** - requires driver adapters:
```typescript
// Before (Prisma 6)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// After (Prisma 7)
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });
```

3. **Update schema.prisma generator**:
```prisma
generator client {
  provider = "prisma-client"  // Changed from "prisma-client-js"
  output   = "./generated/prisma"  // Now required
}
```

4. **Install driver adapter**:
```bash
npm install @prisma/adapter-pg
```

5. **ESM support** - Add to `package.json`:
```json
{
  "type": "module"
}
```

### Breaking Changes to Watch:
- ❌ Client middleware removed (use extensions)
- ❌ Automatic seeding removed from `migrate dev`
- ❌ Metrics removed from client extensions
- ❌ Several environment variables removed
- ⚠️ SSL certificate validation now enforced

---

## Current Production Setup

### Schema Location
```
prisma/schema.prisma
```

### Migrations
```
prisma/migrations/
```

### Connection Pooling
- Default Prisma connection pooling
- Configure in DATABASE_URL query params if needed:
  ```
  ?connection_limit=10&pool_timeout=20
  ```

### Prisma Studio
Access via:
```bash
npm run studio
```

Accessible at: `http://localhost:5556`

---

## Troubleshooting

### Build Errors: "Environment variable not found: DATABASE_URL"
✅ **Fixed** - Dummy DATABASE_URL added to Dockerfile builder stage

### Migration Errors During `npm run upgrade`
✅ **Fixed** - Migrations now skipped in upgrade script (handled by Docker)

### Seed Script Not Running
🔧 **Manual execution required** - Run seed script manually when needed:
```bash
node prisma/seed-standalone.js
```

### Database Connection Issues in Production
1. Verify DATABASE_URL in `.env` file
2. Check network connectivity to PostgreSQL
3. Verify PostgreSQL is running:
   ```bash
   docker-compose -f docker-compose.prod.yml ps postgres
   ```
4. Check logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

---

## References
- [Prisma 6 Docs](https://www.prisma.io/docs/orm)
- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma Docker Guide](https://www.prisma.io/docs/orm/more/deployment/deploy-to-docker)

---

**Last Updated**: January 21, 2026
