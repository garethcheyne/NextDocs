# NextDocs - Enterprise Documentation Platform

Enterprise-grade documentation platform for Harvey Norman Commercial Apps Team built with Next.js 16, React 19, and PostgreSQL.

## Features

- 📚 **Multi-Source Content** - Aggregate docs from Azure DevOps and GitHub
- 🔒 **Protected Content** - Azure AD SSO and role-based access control
- 🎨 **Harvey Norman Branding** - Custom navy (#1a2332) and orange (#ff6b35) theme
- 📝 **Blog Platform** - Built-in blog with author profiles and tags
- 🔍 **Full-Text Search** - Fast content discovery
- 📊 **API Documentation** - Swagger UI and Redoc for OpenAPI specs
- 📈 **Mermaid Diagrams** - Interactive diagram rendering
- 🔄 **Auto-Sync** - Scheduled content synchronization
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive** - Optimized for all devices

## Quick Start with Docker

### Development Mode (with hot reload)

```bash
# Copy environment file
cp .env.docker .env

# Start development environment
docker-compose up

# Access the application
open http://localhost:9980

# Access pgAdmin (optional)
open http://localhost:5050
```

The application will run on port **9980** with hot reload enabled.

### Production Mode

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

## Local Development (without Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with your database credentials

# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:9980](http://localhost:9980)

## Project Structure

```
nextdocs/
├── app/                      # Next.js 16 App Router
│   ├── (auth)/              # Authentication routes
│   ├── (protected)/         # Protected routes (requires login)
│   ├── admin/               # Admin portal
│   ├── api/                 # API routes
│   ├── blog/                # Blog pages
│   ├── docs/                # Documentation pages
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── docs/                # Documentation components
│   ├── blog/                # Blog components
│   └── admin/               # Admin components
├── content/                 # Content files
│   ├── docs/                # Documentation by category
│   │   ├── dynamics-365-bc/
│   │   ├── dynamics-365-ce/
│   │   ├── tms-aus/
│   │   ├── eway/
│   │   └── _meta.json       # Category metadata
│   ├── blog/                # Blog posts
│   │   └── 2025/
│   │       ├── 02/
│   │       ├── 03/
│   │       └── ...
│   └── authors/             # Author profiles
├── lib/                     # Utility functions
│   ├── auth/                # Authentication logic
│   ├── content/             # Content aggregation
│   ├── crypto/              # Encryption utilities
│   └── db/                  # Database utilities
├── prisma/                  # Prisma ORM
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── public/                  # Static assets
│   ├── api-specs/           # OpenAPI specifications
│   └── logos/               # Harvey Norman logos
├── docker-compose.yml       # Development Docker setup
├── docker-compose.prod.yml  # Production Docker setup
├── Dockerfile               # Production Dockerfile
├── Dockerfile.dev           # Development Dockerfile
└── next.config.ts           # Next.js configuration
```

## Content Organization

### Documentation Structure

```
content/docs/{category}/
├── _meta.json              # Category metadata
├── index.md                # Category overview
├── chapter-1/              # Subdirectory = Chapter
│   ├── _meta.json          # Chapter metadata
│   ├── section-1.md
│   └── section-2.md
└── getting-started.md      # Top-level page
```

### Frontmatter Schema

**Documentation:**

```yaml
---
title: Page Title
description: Page description for SEO
icon: IconName
order: 1
lastUpdated: 2025-01-15
category: dynamics-365-bc
tags:
  - tag1
  - tag2
---
```

**Blog Posts:**

```yaml
---
title: Post Title
description: Post description
date: 2025-01-15
authors:
  - author-slug
tags:
  - tag1
image: /images/post.jpg
featured: true
---
```

## Database Schema

- **User** - Authentication and user management with role-based access
- **Author** - Content authors with email as unique cross-repo identifier
- **Repository** - Content source repositories with encrypted credentials
- **SyncLog** - Repository synchronization history
- **WebhookEvent** - Webhook processing logs
- **SSOProvider** - Dynamic SSO provider configuration
- **APISpec** - API documentation specification management

## API Routes

### Public API

- `GET /api/docs` - List documentation categories
- `GET /api/docs/{category}/{slug}` - Get documentation page
- `GET /api/blog` - List blog posts
- `GET /api/search` - Search content

### Admin API (requires authentication)

- `GET/POST /api/admin/repos` - Manage repositories
- `POST /api/admin/repos/{id}/sync` - Trigger sync
- `GET/POST /api/admin/sso` - Manage SSO providers
- `GET/POST /api/admin/api-specs` - Manage API specs
- `GET /api/admin/authors` - List authors

See `/content/api-specs/nextdocs-api-1.0.0.yaml` for full API documentation.

## Docker Commands

### Development

```bash
# Start services
docker-compose up

# Start with pgAdmin
docker-compose --profile tools up

# Rebuild after dependency changes
docker-compose up --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale application
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres nextdocs > backup.sql
```

## Environment Variables

Key environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth.js secret (min 32 chars)
- `ENCRYPTION_KEY` - AES-256-GCM key (64-char hex)
- `AZURE_AD_CLIENT_ID` - Azure AD client ID
- `AZURE_AD_CLIENT_SECRET` - Azure AD client secret
- `AZURE_AD_TENANT_ID` - Azure AD tenant ID

See `.env.example` for all variables.

## Scripts

```bash
npm run dev          # Start development server (port 9980)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## Admin Portal

Access the admin portal at `/admin` (requires authentication):

- **Repositories** - Configure content sources
- **SSO Providers** - Manage authentication providers
- **API Specs** - Upload and manage API documentation
- **Users** - Manage user roles and permissions
- **Sync Logs** - Monitor content synchronization

## Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript 5.7+** - Type safety
- **Tailwind CSS 4.x** - Styling with Harvey Norman theme
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **NextAuth.js v5** - Authentication
- **shadcn/ui** - Component library
- **Swagger UI React** - API documentation
- **Mermaid** - Diagram rendering
- **TanStack Query** - Data fetching
- **Zod** - Schema validation

## License

Proprietary - Harvey Norman Commercial Apps Team

## Support

For support, contact the Harvey Norman Commercial Apps Team.
