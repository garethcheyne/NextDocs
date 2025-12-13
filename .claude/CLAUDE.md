# NextDocs - Claude Project Instructions

## Overview

**NextDocs** is an enterprise documentation platform for Harvey Norman Commercial Apps Team. It aggregates documentation from multiple repositories (Azure DevOps + GitHub), provides a feature request system, and includes comprehensive admin tools.

**Last Updated:** December 13, 2025

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5.7+ (strict mode) |
| Styling | Tailwind CSS 3.x, shadcn/ui, Radix UI |
| Database | PostgreSQL (Prisma ORM) |
| Cache | Redis (ioredis) |
| Auth | NextAuth v5 (Azure AD SSO + local credentials) |
| Icons | Lucide React, Fluent UI |
| Markdown | next-mdx-remote, react-markdown, Mermaid |
| Email | EWS (Exchange Web Services), REST API |
| API Docs | Swagger UI, ReDoc |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login pages
│   ├── admin/             # Admin panel (13+ pages)
│   ├── api/               # API routes (60 endpoints)
│   ├── blog/              # Blog pages
│   ├── docs/              # Documentation pages
│   ├── features/          # Feature request pages
│   ├── guide/             # User guides (icons, markdown, etc.)
│   └── profile/           # User profile
├── components/            # React components (81 total)
│   ├── admin/             # Admin components
│   ├── auth/              # Auth components
│   ├── features/          # Feature request components
│   ├── layout/            # Layout components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities (31 modules)
│   ├── auth/              # Authentication
│   ├── db/                # Database utilities
│   ├── email/             # Email services
│   ├── sync/              # Repository sync
│   └── search/            # Search indexer
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript definitions

prisma/
├── schema.prisma          # Database schema (28 tables)
└── migrations/            # Database migrations
```

## Core Features

### 1. Authentication System
- **Azure AD SSO** (Microsoft Entra ID) with group-based access
- **Local credentials** with bcrypt password hashing
- **Role-based access control**: user, editor, admin
- **Wildcard group matching** (e.g., "SGRP_CRM_*")
- Profile photo fetching from Microsoft Graph

### 2. Content Management
- **Multi-repository sync** (GitHub + Azure DevOps)
- **Document parsing** with frontmatter metadata
- **Image sync** to /public/img/{repo-slug}/
- **Full-text search** (PostgreSQL tsvector)
- **Redis caching** for search results
- **Role-based content restrictions**

### 3. Feature Request System
Complete feature lifecycle management:

| Feature | Description |
|---------|-------------|
| Voting | Up/down voting, single vote per user |
| Comments | Threaded comments with moderation |
| Following | Auto-follow own features, selective notifications |
| Status Workflow | proposal → approved → in-progress → completed/declined |
| Categories | Categorization with icons and colors |
| Merging | Merge duplicate features with history |
| Internal Notes | Admin-only notes (not visible to users) |
| Pinning | Pin important features to top |
| Archiving | Hide features while preserving history |
| Comment Locking | Prevent further discussion |
| Story Points | Effort estimation (DevOps integration) |
| Sprint Tracking | Track features to specific sprints |

### 4. External Integrations

**GitHub Integration:**
- Auto-create issues from approved features
- Bi-directional comment syncing
- Label mapping from feature tags
- Webhook-based real-time sync

**Azure DevOps Integration:**
- Auto-create work items from approved features
- Work item type customization
- Area path configuration
- Bi-directional comment syncing

### 5. Analytics
- Real-time event tracking with streaming
- Session tracking with duration
- Scroll depth measurement
- Page viewer tracking (who's viewing)
- Daily summary aggregation
- Search query tracking

### 6. Email Notifications
- Feature creation notifications
- Status change notifications
- Comment notifications to followers
- Per-user notification preferences
- EWS and REST API support
- Email queue with retry logic

### 7. API Documentation
- Multiple API spec versions per slug
- Swagger UI and ReDoc renderers
- Auto-sync from repositories

### 8. Admin Panel
- Repository management (CRUD, sync triggers)
- User management (roles, permissions)
- Feature category management
- Integration settings (GitHub/Azure DevOps)
- Analytics dashboard

## Database Schema (28 Tables)

### User & Auth
- `User`, `Account`, `Session`, `VerificationToken`, `UserGroup`

### Content
- `Document`, `BlogPost`, `Author`

### Repository & Sync
- `Repository`, `SyncLog`, `DocumentChange`, `RepositoryImage`, `CategoryMetadata`

### Feature Request System
- `FeatureRequest`, `FeatureVote`, `FeatureComment`, `FeatureFollower`
- `FeatureCategory`, `FeatureStatusHistory`, `FeatureInternalNote`
- `Epic`, `Tag`, `CommentSync`, `FeatureMerge`

### Other
- `APISpec`, `WebhookEvent`, `SSOProvider`, `EmailQueue`
- `AnalyticsEvent`, `AnalyticsSession`, `AnalyticsDailySummary`
- `ContentVote`, `ContentFollow`, `PageViewer`

## API Routes (60 Endpoints)

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Features
- `GET/POST /api/features` - List/create features
- `GET /api/features/[id]` - Get feature
- `POST /api/features/[id]/vote` - Vote on feature
- `GET/POST /api/features/[id]/comments` - Comments
- `GET /api/features/[id]/export` - Export feature data

### Feature Admin
- `POST /api/admin/features/[id]/status` - Update status
- `POST /api/admin/features/[id]/edit` - Edit feature
- `POST /api/admin/features/[id]/admin/set-priority` - Set priority
- `POST /api/admin/features/[id]/admin/toggle-pin` - Pin/unpin
- `POST /api/admin/features/[id]/admin/toggle-archive` - Archive
- `POST /api/admin/features/[id]/admin/toggle-lock-comments` - Lock comments
- `POST /api/admin/features/[id]/admin/internal-notes` - Add internal notes
- `POST /api/admin/features/[id]/admin/delete` - Delete feature
- `POST /api/admin/features/[id]/create-work-item` - Create GitHub/DevOps item
- `POST /api/admin/features/[id]/sync-comments` - Sync comments
- `POST /api/admin/features/[id]/reclassify` - Move to category
- `POST /api/admin/features/merge` - Merge features

### Categories
- `GET/POST /api/admin/features/categories` - List/create
- `GET/PUT/DELETE /api/admin/features/categories/[id]` - CRUD
- `GET/POST /api/admin/features/categories/[id]/integrations` - Integrations
- `POST /api/admin/features/categories/[id]/test-connection` - Test connection

### Repositories
- `GET/POST /api/repositories` - List/create
- `GET/PUT /api/repositories/[id]` - Get/update
- `POST /api/repositories/[id]/sync` - Trigger sync
- `POST /api/repositories/[id]/test` - Test connection
- `GET /api/repositories/[id]/documents/*` - Document operations
- `GET /api/repositories/[id]/blog-posts/*` - Blog operations
- `GET /api/repositories/[id]/authors/*` - Author operations
- `GET /api/repositories/[id]/categories/*` - Category operations

### Content
- `POST /api/content/[type]/[id]/vote` - Vote on content
- `POST /api/content/[type]/[id]/follow` - Follow content

### Search
- `GET /api/search` - Full-text search (documents, blogs, features, API specs)

### Analytics
- `POST /api/analytics/track` - Track events
- `GET /api/admin/analytics/metrics` - Get metrics
- `GET /api/admin/analytics/events` - Stream events
- `GET /api/admin/analytics/realtime` - Real-time data

### Webhooks
- `POST /api/webhooks/github` - GitHub webhook
- `POST /api/webhooks/azure-devops` - Azure DevOps webhook

### Other
- `GET /api/health` - Health check
- `POST /api/upload/images` - Image upload
- `GET /api/images/[filename]` - Serve images
- `GET /api/spec/[slug]/[version]` - API spec
- `POST /api/admin/test-email` - Test email
- `POST /api/user/password` - Change password

## Key Implementation Patterns

### Route Protection
```
Public:     /login, /
Protected:  /docs/*, /blog/*, /features/*, /api-docs/*, /guide/*
Admin:      /admin/*
```

### Content Access
Documents can have role-based restrictions in frontmatter:
```yaml
---
title: Document Title
restriction: admin  # or: editor, user
---
```

### Feature Status Flow
```
proposal → approved → in-progress → completed
                   ↘ declined
                   ↘ on-hold
```

### Sync Sources
Repositories configured with:
- `source: "github"` or `source: "azure"`
- Encrypted PAT storage
- Webhook URLs for real-time sync
- Configurable sync schedules

## Development

### Scripts
```bash
npm run dev        # Start dev environment (Docker)
npm run dev:local  # Local dev (port 3000)
npm run build      # Build for production
npm run start      # Start production (Docker)
npm run stop       # Stop production
npm run logs       # View logs
```

### Environment Variables
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
AZURE_AD_CLIENT_ID=...
AZURE_AD_CLIENT_SECRET=...
AZURE_AD_TENANT_ID=...
ALLOWED_AD_GROUPS=...
GITHUB_WEBHOOK_SECRET=...
ENCRYPTION_KEY=...
```

### Docker
- `docker-compose.yml` - Development
- `docker-compose.prod.yml` - Production
- `docker-compose.dev.yml` - Dev with hot reload

## Testing

- **Jest**: CLI/unit tests (30+)
- **Playwright**: E2E browser tests (80+)

```bash
npm test              # All tests
npm run test:cli      # Unit tests
npm run test:e2e      # E2E tests
npm run test:e2e:ui   # Interactive UI
```

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Navy | #1a2332 | Primary background |
| Orange | #ff6b35 | Accent/CTA |
| Gray | #8b9bb3 | Secondary text |

## File Counts

| Category | Count |
|----------|-------|
| API Routes | 60 |
| Pages | 40+ |
| Components | 81 |
| Library Modules | 31 |
| Database Tables | 28 |
| Custom Hooks | 4 |
