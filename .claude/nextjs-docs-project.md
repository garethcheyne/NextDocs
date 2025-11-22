# NextDocs - Enterprise Documentation Platform

## Project Overview

**Production-Ready Enterprise Documentation Platform** built with Next.js 16 for Harvey Norman Commercial Apps Team. Currently operational with 3,149+ images synced, multi-repository content aggregation, and comprehensive feature request system.

**🔒 AUTHENTICATION:** Soft-gate approach with public homepage. All content routes require authentication via Azure AD SSO or local credentials. Draft content (`draft: true` frontmatter or `[DRAFT]` in title) is admin-only.

**Live Environment:**
- **URL:** http://localhost:9980 (Development)
- **Status:** ✅ Fully Operational
- **Content:** Dynamics 365 BC/CE/CE-AUS/CE-NZL, TMS-AUS, eWay, Deliver-eZY-NZL
- **Features:** Image sync, feature requests with voting/comments, blog system, API docs

**Route Protection:**
- Public: `/` (homepage)
- Protected: `/docs/*`, `/blog/*`, `/api-docs/*`, `/features/*`
- Admin: `/admin/*` (requires admin role)

## ✅ Implementation Status

### Latest Updates (November 2025)

**Image Sync System** ✅
- 3,149+ images synced from Azure DevOps and GitHub
- Content directory filtering (docs/, blog/, api-specs/)
- SHA/objectId-based change detection
- Images stored in /public/img/{repository-slug}/

**Feature Request System** ✅
- Submission form with category selection (/features/new)
- Client-side voting with optimistic UI (VoteButton component)
- Comment system with real-time updates (CommentForm component)
- Admin status management (StatusUpdateDialog)
- Category management with orphan/cascade deletion

**Sidebar Enhancements** ✅
- Infinite nesting support (truly recursive category tree)
- Clickable parent categories with index.md detection
- Dropdown-only categories without index.md
- Tooltips for truncated items (300ms delay, side="right")
- 15% wider sidebar (18.4rem) for better readability

**Sync Service Improvements** ✅
- IP address logging (X-Forwarded-For, X-Real-IP support)
- Detailed sync progress logging with emojis
- Source detection (Azure DevOps vs GitHub)

**UI/UX Polish** ✅
- Author hover cards with bio and content stats
- Improved tooltip contrast (opacity-80)
- Better dark mode support
- Responsive mobile navigation

**Project Cleanup** ✅
- Updated package.json with modern description
- Enhanced .gitignore (utility scripts, synced images)
- README.md updated with 13 features
- PROJECT_SUMMARY.md updated with November work

**Pending:**
- Email notifications (EWS integration)
- Feature merging workflow
- Following/notification preferences UI

### Completed Features

- ✅ **Authentication System**
  - Azure AD SSO integration (NextAuth.js v5)
  - Local credentials provider
  - User registration and password reset
  - Middleware-based route protection
  - Role-based access control (admin/editor/user)
  - Token encryption for secure PAT storage

- ✅ **Content Management**
  - Multi-repository support (Azure DevOps + GitHub)
  - Dynamic repository configuration via admin UI
  - Encrypted PAT/token storage
  - MDX processing pipeline
  - Draft content filtering (frontmatter + title pattern)
  - Webhook integration for auto-sync
  - Repository health monitoring

- ✅ **API Documentation**
  - Multi-version support for API specs
  - Swagger UI + Redoc renderers
  - Version selector in UI
  - OpenAPI 3.0/3.1 YAML parsing
  - Auto-sync from repositories
  - Category-based organization

- ✅ **Feature Request System**
  - Feature categories with CRUD
  - Smart category deletion (orphan vs cascade)
  - Feature submission with voting/comments
  - Status workflow (proposal → approved → in-progress → completed)
  - Vote toggling (upvote/downvote)
  - Comments system with moderation
  - Following/notifications architecture
  - Category-based navigation in sidebar
  - Dropdown filters (Status, Sort)
  - Feature detail pages with engagement

- ✅ **Admin Portal**
  - Repository management (CRUD)
  - Connection testing
  - Manual sync triggers
  - Sync log viewing
  - Category management for features
  - User management UI
  - Enhanced deletion workflows

- ✅ **UI/UX**
  - shadcn/ui component library
  - Dark/light mode support
  - Responsive sidebar navigation
  - Collapsible menu sections
  - Server/Client component separation
  - Dropdown filters for better UX
  - Active filter badges
  - Feature submission form (/features/new) ✅
  - Interactive voting with optimistic UI ✅
  - Comment submission forms ✅
  - Admin status management dialog ✅

### In Progress
- ⚠️ **Email Notifications**
  - EWS integration (planned)
  - Email templates (not started)
  - Queue processing system (not started)
  - Notifications for feature status changes
  - Notifications for new comments to followers

- ⚠️ **Feature Request Enhancements**
  - Merge duplicate features workflow
  - Feature following/unfollowing UI
  - Activity timeline
  - File attachments

### Planned Features
- 🔜 **External Integration**
  - GitHub/DevOps two-way sync for features
  - Webhook receivers for external updates
  - Status mapping (external → internal)

- 🔜 **Content Features**
  - Mermaid diagram rendering
  - Interactive code examples
  - Search implementation (Pagefind/Flexsearch)
  - Blog post system
  - Author profiles
  - Related content suggestions

- 🔜 **Documentation**
  - Table of contents component
  - Breadcrumb navigation
  - Pagination (prev/next)
  - Category metadata (_meta.json)

---

## Tech Stack

### Core Framework
- **Next.js 16** (App Router, Server Components, ISR)
- **React 19** with Server Actions
- **TypeScript 5.7+** (strict mode)
- **Tailwind CSS 4.x** for styling

### UI Components & Design
- **shadcn/ui** for component library
- **Radix UI** primitives (via shadcn)
- **Lucide React** for icons
- **next-themes** for dark/light mode
- **Framer Motion** for animations (optional)

### Content & Data Management
- **Contentlayer 2** or **next-mdx-remote** for MDX processing
- **gray-matter** for frontmatter parsing
- **remark/rehype** plugins for markdown processing
- **@octokit/rest** for GitHub API integration
- **TanStack Query v5** for data fetching/caching
- **Zod** for schema validation

### Search & Navigation
- **Flexsearch** or **Pagefind** for local search
- **Algolia DocSearch** (optional premium alternative)
- **nuqs** for URL state management

### Code & Diagrams
- **Shiki** or **Prism** for syntax highlighting
- **Mermaid** for diagram rendering (flowcharts, sequence diagrams, etc.)
- **rehype-mermaid** for MDX mermaid integration
- **react-live** for interactive code examples

### API Documentation
- **Swagger UI React** for interactive API documentation
- **Redoc** for alternative API docs rendering
- **openapi-typescript** for TypeScript generation from OpenAPI specs
- **yaml** for OpenAPI spec parsing

### Authentication & Security
- **NextAuth.js v5 (Auth.js)** for authentication
- **Azure AD (Microsoft Entra ID)** SSO provider
- **Credentials Provider** for local username/password
- **Prisma** + **PostgreSQL/MySQL** for user management
- **bcrypt** for password hashing
- **Middleware** for route protection
- **JWT** session handling

### DevOps & Monitoring
- **Azure DevOps REST API** integration
- **GitHub Webhooks** for content updates
- **Vercel Analytics** or **Plausible**
- **Sentry** for error tracking

## Architecture

### Content Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   Public Homepage (/)                        │
│         Hero + Sign-In Card (No Auth Required)              │
│                           ↓                                  │
│                  User Clicks Content                         │
│                           ↓                                  │
│                  Authentication Gate                         │
│   Azure AD SSO ←→ NextAuth.js ←→ Local Credentials         │
│                    ↓ (Authenticated)                        │
│  External Repos (Git) → API Routes → ISR Cache → Pages     │
│                          ↓                                   │
│                   Draft Filter Layer                         │
│        (Hide [DRAFT] content from non-admin users)          │
│                          ↓                                   │
│                    TanStack Query                            │
│                          ↓                                   │
│                  Client-side updates                         │
└─────────────────────────────────────────────────────────────┘

Public routes: / (homepage)
Protected routes: /docs/*, /blog/*, /api-docs/*
Admin routes: /admin/* (requires admin role)
```

### Repository Structure
```
/app
  /page.tsx                    # Public homepage (hero + sign-in card)
  /(auth)
    /login/page.tsx            # Login page (SSO + Local)
    /register/page.tsx         # Local user registration
    /forgot-password/page.tsx  # Password reset
  /(protected)                 # Content routes require auth
    /docs/[...slug]/page.tsx   # Documentation pages
    /blog/[slug]/page.tsx      # Blog posts
    /blog/page.tsx             # Blog listing
    /api-docs/page.tsx         # API documentation list
    /api-docs/[slug]/page.tsx  # Individual API spec viewer
  /admin                       # Admin-only routes (admin role required)
    /repos/page.tsx            # Repository management
    /repos/new/page.tsx        # Add new repository
    /repos/[id]/page.tsx       # Edit repository
    /repos/[id]/logs/page.tsx  # Sync logs
    /sso/page.tsx              # SSO provider management
    /api-specs/page.tsx        # API spec management
    /users/page.tsx            # User role management
    /webhooks/page.tsx         # Webhook events
  /api
    /auth/[...nextauth]/route.ts # NextAuth endpoints
    /content/[...path]/route.ts  # Content API (protected)
    /search/route.ts             # Search API (protected)
    /admin
      /repos/route.ts            # CRUD for repositories
      /repos/[id]/route.ts       # Single repository
      /repos/[id]/test/route.ts  # Test connection
      /repos/[id]/sync/route.ts  # Manual sync trigger
    /webhook/[slug]/route.ts     # Dynamic webhook per repo
  /middleware.ts                 # Auth middleware
/components
  /auth
    /login-form.tsx              # SSO + Local login form
    /register-form.tsx           # User registration
    /user-menu.tsx               # User dropdown menu
    /session-provider.tsx        # Auth session wrapper
  /ui                            # shadcn components
  /docs                          # Docs-specific components
    /sidebar.tsx
    /toc.tsx                     # Table of contents
    /breadcrumbs.tsx
    /pagination.tsx
  /blog
    /post-card.tsx
    /post-list.tsx
    /author-card.tsx
  /search
    /search-dialog.tsx
    /search-results.tsx
  /code
    /code-block.tsx
    /copy-button.tsx
  /api-docs
    /swagger-ui.tsx              # Swagger UI wrapper
    /redoc-viewer.tsx            # Redoc wrapper
    /api-spec-card.tsx           # API spec card in listing
    /spec-selector.tsx           # Switch between specs
  /diagrams
    /mermaid-diagram.tsx         # Mermaid diagram renderer
    /diagram-controls.tsx        # Zoom, export controls
  /admin
    /repo-form.tsx               # Add/Edit repository form
    /repo-list.tsx               # Repository list with status
    /repo-status-badge.tsx       # Status indicator
    /connection-test.tsx         # Test connection button
    /sync-trigger.tsx            # Manual sync button
    /webhook-url.tsx             # Webhook URL display
    /sync-log-table.tsx          # Sync history table
/lib
  /auth
    /auth.ts                     # NextAuth configuration
    /azure-ad.ts                 # Azure AD provider config
    /credentials.ts              # Local auth provider
    /session.ts                  # Session utilities
  /db
    /prisma.ts                   # Prisma client
    /user.ts                     # User CRUD operations
    /repository.ts               # Repository CRUD operations
  /content
    /github.ts                   # GitHub API client
    /devops.ts                   # Azure DevOps client
    /mdx.ts                      # MDX processor
    /cache.ts                    # Content caching
    /aggregator.ts               # Multi-repo content aggregator
  /sync
    /scheduler.ts                # Cron job scheduler
    /sync-engine.ts              # Content sync logic
  /crypto
    /encryption.ts               # Token encryption/decryption
  /search
    /indexer.ts                  # Search index builder
    /query.ts                    # Search query handler
  /utils
    /cn.ts                       # Class name merger
    /date.ts                     # Date formatting
/config
  /site.ts                       # Site configuration
  /navigation.ts                 # Nav structure
  /docs.ts                       # Docs repo config
/content (local fallback)
  /docs
  /blog
/public
  /images
  /fonts
```

## Key Features to Implement

### 1. Authentication System
**Objective:** Protect all content with Azure AD SSO + local authentication

**Azure AD SSO Integration:**
```typescript
// lib/auth/azure-ad.ts
import AzureADProvider from "next-auth/providers/azure-ad"

export const azureAdProvider = AzureADProvider({
  clientId: process.env.AZURE_AD_CLIENT_ID!,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
  tenantId: process.env.AZURE_AD_TENANT_ID!,
  authorization: {
    params: {
      scope: "openid profile email User.Read"
    }
  },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
      role: profile.roles?.[0] || "user" // From Azure AD app roles
    }
  }
})
```

**Local Credentials Provider:**
```typescript
// lib/auth/credentials.ts
import CredentialsProvider from "next-auth/providers/credentials"
import { verifyPassword } from "@/lib/auth/password"
import { getUserByEmail } from "@/lib/db/user"

export const credentialsProvider = CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null
    }

    const user = await getUserByEmail(credentials.email)
    if (!user || !user.password) {
      return null
    }

    const isValid = await verifyPassword(
      credentials.password,
      user.password
    )

    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
})
```

**NextAuth Configuration:**
```typescript
// lib/auth/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import { azureAdProvider } from "./azure-ad"
import { credentialsProvider } from "./credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    azureAdProvider,
    credentialsProvider
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.provider = account?.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.provider = token.provider as string
      }
      return session
    }
  }
})
```

**Middleware Protection:**
```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "admin"
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    
    // Admin routes require admin role
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname
        
        // Public routes (no auth required)
        const publicRoutes = ['/', '/login', '/register', '/forgot-password']
        if (publicRoutes.includes(pathname)) {
          return true
        }
        
        // All content routes require authentication
        const contentRoutes = ['/docs', '/blog', '/api-docs', '/admin']
        const isContentRoute = contentRoutes.some(route => pathname.startsWith(route))
        
        if (isContentRoute) {
          return !!token // Must be authenticated
        }
        
        return true // Allow other routes
      }
    },
    pages: {
      signIn: "/login",
      error: "/login"
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Database Schema (Prisma):**
```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?   // Only for local accounts
  image         String?
  role          String    @default("user") // user, admin, editor
  provider      String?   // azuread, credentials
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  repositories  Repository[] // Repositories created by user
  ssoProviders  SSOProvider[] // SSO providers managed by user
  apiSpecs      APISpec[] // API specs uploaded by user
}

model Author {
  id            String    @id @default(cuid())
  email         String    @unique // Primary key for cross-repo identification
  name          String
  title         String?
  bio           String?
  avatar        String?
  linkedin      String?
  github        String?
  website       String?
  location      String?
  joinedDate    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([email])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model Repository {
  id              String    @id @default(cuid())
  name            String    // Display name
  slug            String    @unique // URL-friendly identifier
  type            String    // 'docs' or 'blog'
  source          String    // 'azure' or 'github'
  
  // Azure DevOps specific
  azureOrg        String?
  azureProject    String?
  azureRepo       String?
  
  // GitHub specific
  githubOwner     String?
  githubRepo      String?
  
  // Common fields
  branch          String    @default("main")
  basePath        String    @default("")
  
  // Authentication (encrypted)
  patEncrypted    String?   @db.Text // Encrypted PAT/token
  webhookSecret   String?   // For webhook verification
  
  // Configuration
  enabled         Boolean   @default(true)
  priority        Int       @default(0)
  syncFrequency   Int       @default(3600) // Seconds between syncs
  
  // Monitoring
  lastSyncAt      DateTime?
  lastSyncStatus  String?   // 'success', 'failed', 'pending'
  lastSyncError   String?   @db.Text
  filesCount      Int       @default(0)
  
  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String    // User ID who created
  
  // Relations
  creator         User      @relation(fields: [createdBy], references: [id])
  syncLogs        SyncLog[]
  webhookEvents   WebhookEvent[]
  apiSpecs        APISpec[] // API specs from this repository
  
  @@index([enabled])
  @@index([type])
  @@index([source])
}

model SyncLog {
  id            String     @id @default(cuid())
  repositoryId  String
  status        String     // 'success', 'failed', 'partial'
  filesAdded    Int        @default(0)
  filesUpdated  Int        @default(0)
  filesDeleted  Int        @default(0)
  duration      Int        // Milliseconds
  error         String?    @db.Text
  triggeredBy   String     // 'scheduled', 'manual', 'webhook'
  createdAt     DateTime   @default(now())
  
  repository    Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  @@index([repositoryId])
  @@index([createdAt])
}

model WebhookEvent {
  id            String     @id @default(cuid())
  repositoryId  String
  eventType     String     // 'push', 'pull_request', etc.
  payload       String     @db.Text // JSON payload
  signature     String?
  verified      Boolean    @default(false)
  processed     Boolean    @default(false)
  createdAt     DateTime   @default(now())
  processedAt   DateTime?
  
  repository    Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  @@index([repositoryId])
  @@index([processed])
  @@index([createdAt])
}

model SSOProvider {
  id                String    @id @default(cuid())
  name              String    // Display name (e.g., "Azure AD", "Google Workspace")
  slug              String    @unique // URL-friendly identifier
  provider          String    // 'azure-ad', 'google', 'okta', 'github'
  enabled           Boolean   @default(true)
  
  // OAuth Configuration (encrypted)
  clientIdEncrypted       String    @db.Text
  clientSecretEncrypted   String    @db.Text
  tenantId                String?   // For Azure AD
  
  // Access Control
  domainRestriction String?   // Comma-separated allowed domains
  roleMapping       String?   @db.Text // JSON mapping of provider roles to app roles
  
  // Metadata
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  createdBy         String    // User ID who configured
  
  // Relations
  creator           User      @relation(fields: [createdBy], references: [id])
  
  @@index([enabled])
  @@index([provider])
}

model APISpec {
  id              String    @id @default(cuid())
  name            String    // API name (e.g., "NextDocs API")
  slug            String    @unique // URL-friendly identifier
  description     String?   @db.Text
  version         String    // e.g., "1.0.0"
  specPath        String    // Path to spec file in /content/api-specs/
  renderer        String    @default("swagger-ui") // 'swagger-ui' or 'redoc'
  category        String?   // Optional categorization
  enabled         Boolean   @default(true)
  
  // Repository integration (optional)
  repositoryId    String?
  filePath        String?   // Path within repository
  
  // Auto-sync configuration
  autoSync        Boolean   @default(false)
  syncFrequency   Int       @default(3600) // Seconds between syncs
  lastSyncAt      DateTime?
  
  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String    // User ID who created
  
  // Relations
  repository      Repository? @relation(fields: [repositoryId], references: [id], onDelete: SetNull)
  creator         User      @relation(fields: [createdBy], references: [id])
  
  @@index([enabled])
  @@index([category])
}
```

**User Registration (Local Only):**
```typescript
// app/(auth)/register/actions.ts
'use server'

import { hashPassword } from "@/lib/auth/password"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
})

export async function registerUser(data: FormData) {
  const validated = registerSchema.parse({
    name: data.get('name'),
    email: data.get('email'),
    password: data.get('password')
  })

  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email }
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await hashPassword(validated.password)

  await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      provider: 'credentials',
      role: 'user'
    }
  })
}
```

**Token Encryption Utility:**
```typescript
// lib/crypto/encryption.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // Must be 32 bytes (64 hex chars)

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
}

const key = Buffer.from(ENCRYPTION_KEY, 'hex')

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':')
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Generate a new encryption key (run once, store in .env)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
```

### 2. Content Fetching System
**Objective:** Fetch markdown/MDX from external Git repositories

**GitHub Integration:**
```typescript
// lib/content/github.ts
import { Octokit } from '@octokit/rest'

interface GitHubConfig {
  repo: string // 'owner/repo'
  branch: string
  token: string
}

export class GitHubClient {
  private octokit: Octokit
  private owner: string
  private repo: string
  private branch: string

  constructor(private config: GitHubConfig) {
    this.octokit = new Octokit({ auth: config.token })
    const [owner, repo] = config.repo.split('/')
    this.owner = owner
    this.repo = repo
    this.branch = config.branch
  }

  async getFileContent(path: string): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch,
      })

      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString('utf-8')
      }
      throw new Error('Not a file')
    } catch (error) {
      throw new Error(`Failed to fetch ${path} from GitHub: ${error}`)
    }
  }

  async listFiles(path: string): Promise<string[]> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch,
      })

      if (Array.isArray(data)) {
        const files: string[] = []
        for (const item of data) {
          if (item.type === 'file' && item.name.endsWith('.md')) {
            files.push(item.path)
          } else if (item.type === 'dir') {
            // Recursively get files from subdirectories
            const subFiles = await this.listFiles(item.path)
            files.push(...subFiles)
          }
        }
        return files
      }
      return []
    } catch (error) {
      throw new Error(`Failed to list files in ${path} from GitHub: ${error}`)
    }
  }
}
```

**Repository Configuration System:**
```typescript
// config/repos.ts
import { z } from 'zod'

export const repoConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['docs', 'blog']),
  source: z.enum(['azure', 'github']),
  project: z.string().optional(), // Azure DevOps only
  repository: z.string(),
  branch: z.string().default('main'),
  basePath: z.string().default(''),
  enabled: z.boolean().default(true),
  priority: z.number().default(0), // For content ordering
  webhookSecret: z.string().optional(),
})

export type RepoConfig = z.infer<typeof repoConfigSchema>

export function getRepoConfigs(): RepoConfig[] {
  const configJson = process.env.CONTENT_REPOS || '[]'
  const parsed = JSON.parse(configJson)
  return parsed.map((config: unknown) => repoConfigSchema.parse(config))
}

export function getDocsRepos(): RepoConfig[] {
  return getRepoConfigs().filter(r => r.type === 'docs' && r.enabled)
}

export function getBlogRepos(): RepoConfig[] {
  return getRepoConfigs().filter(r => r.type === 'blog' && r.enabled)
}

export function getRepoById(id: string): RepoConfig | undefined {
  return getRepoConfigs().find(r => r.id === id)
}
```

**Azure DevOps Integration:**
```typescript
// lib/content/devops.ts
import { RepoConfig } from '@/config/repos'

interface AzureDevOpsConfig {
  org: string
  project: string
  repositoryId: string
  branch: string
  pat: string
}

export class AzureDevOpsClient {
  private baseUrl: string
  private headers: HeadersInit

  constructor(private config: AzureDevOpsConfig) {
    this.baseUrl = `https://dev.azure.com/${config.org}/${config.project}/_apis`
    this.headers = {
      'Authorization': `Basic ${Buffer.from(`:${config.pat}`).toString('base64')}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Fetch file content from Azure DevOps repository
   * @param path - File path relative to repo root (e.g., 'docs/dynamics-365-bc/getting-started.md')
   */
  async getFileContent(path: string): Promise<string> {
    const url = `${this.baseUrl}/git/repositories/${this.config.repositoryId}/items?path=/${path}&versionDescriptor.version=${this.config.branch}&api-version=7.0`
    
    const response = await fetch(url, { 
      headers: this.headers,
      next: { revalidate: 3600 } // ISR cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`)
    }

    return await response.text()
  }

  /**
   * List all files in a directory
   * @param path - Directory path (e.g., 'docs/dynamics-365-bc')
   */
  async listFiles(path: string): Promise<string[]> {
    const url = `${this.baseUrl}/git/repositories/${this.config.repositoryId}/items?scopePath=/${path}&recursionLevel=Full&versionDescriptor.version=${this.config.branch}&api-version=7.0`
    
    const response = await fetch(url, { 
      headers: this.headers,
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      throw new Error(`Failed to list files in ${path}`)
    }

    const data = await response.json()
    return data.value
      .filter((item: any) => !item.isFolder && item.path.endsWith('.md'))
      .map((item: any) => item.path.substring(1)) // Remove leading slash
  }

  /**
   * Get all documentation files grouped by category
   */
  async getAllDocs(): Promise<Record<string, string[]>> {
    const categories = [
      'dynamics-365-bc',
      'dynamics-365-ce',
      'dynamics-365-ce-aus',
      'dynamics-365-ce-nzl',
      'tms-aus',
      'eway',
      'deliver-ezy-nzl'
    ]

    const docs: Record<string, string[]> = {}

    for (const category of categories) {
      docs[category] = await this.listFiles(`docs/${category}`)
    }

    return docs
  }

  /**
   * Get all blog posts organized by date
   */
  async getAllBlogPosts(): Promise<string[]> {
    return await this.listFiles('blog')
  }
}

// Multi-repository content aggregator
// lib/content/aggregator.ts
import { getDocsRepos, getBlogRepos, RepoConfig } from '@/config/repos'
import { AzureDevOpsClient } from './devops'
import { GitHubClient } from './github'

interface ContentClient {
  getFileContent(path: string): Promise<string>
  listFiles(path: string): Promise<string[]>
}

function createClient(config: RepoConfig): ContentClient {
  if (config.source === 'azure') {
    return new AzureDevOpsClient({
      org: process.env.AZURE_DEVOPS_ORG!,
      project: config.project!,
      repositoryId: config.repository,
      branch: config.branch,
      pat: process.env.AZURE_DEVOPS_PAT!,
    })
  } else {
    return new GitHubClient({
      repo: config.repository,
      branch: config.branch,
      token: process.env.GITHUB_TOKEN!,
    })
  }
}

/**
 * Aggregate content from all enabled documentation repositories
 */
export async function getAllDocs() {
  const repos = getDocsRepos()
  const allDocs: Record<string, any[]> = {}

  for (const repo of repos) {
    const client = createClient(repo)
    try {
      const files = await client.listFiles(repo.basePath)
      // Tag each file with repo metadata
      allDocs[repo.id] = files.map(file => ({
        path: file,
        repoId: repo.id,
        source: repo.source,
        priority: repo.priority,
      }))
    } catch (error) {
      console.error(`Failed to fetch from repo ${repo.id}:`, error)
      // Continue with other repos even if one fails
    }
  }

  return allDocs
}

/**
 * Aggregate blog posts from all enabled blog repositories
 */
export async function getAllBlogPosts() {
  const repos = getBlogRepos()
  const allPosts: any[] = []

  for (const repo of repos) {
    const client = createClient(repo)
    try {
      const files = await client.listFiles(repo.basePath)
      allPosts.push(...files.map(file => ({
        path: file,
        repoId: repo.id,
        source: repo.source,
        priority: repo.priority,
      })))
    } catch (error) {
      console.error(`Failed to fetch blog from repo ${repo.id}:`, error)
    }
  }

  // Sort by priority (higher priority first)
  return allPosts.sort((a, b) => b.priority - a.priority)
}

/**
 * Get content from specific repository
 */
export async function getContentFromRepo(repoId: string, path: string) {
  const config = getRepoById(repoId)
  if (!config) throw new Error(`Repository ${repoId} not found`)
  
  const client = createClient(config)
  return await client.getFileContent(path)
}
```

**Content Schema:**
```typescript
// Docs
{
  slug: string
  title: string
  description: string
  category: string
  order: number
  lastUpdated: Date
  author: string
  tags: string[]
  content: string (MDX)
}

// Blog
{
  slug: string
  title: string
  excerpt: string
  publishedAt: Date
  updatedAt: Date
  author: {name, avatar, role}
  coverImage: string
  tags: string[]
  readingTime: number
  content: string (MDX)
}
```

### 2. Dynamic Routing & ISR
**Documentation Pages:**
```typescript
// app/(docs)/docs/[...slug]/page.tsx
- generateStaticParams() from content API
- revalidate: 3600 (1 hour ISR)
- Nested route support
- Automatic breadcrumbs
- Table of contents generation
```

**Blog Pages:**
```typescript
// app/(docs)/blog/[slug]/page.tsx
- ISR for individual posts
- Related posts suggestion
- Author information
- Social sharing
- Reading progress indicator
```

### 3. Sidebar Navigation
**Features:**
- Auto-generated from folder structure
- Collapsible sections
- Active state highlighting
- Search within sidebar
- Persist scroll position
- Mobile responsive drawer

**Component Structure:**
```typescript
<DocsSidebar>
  <SidebarSearch />
  <SidebarNav>
    <SidebarSection title="Getting Started">
      <SidebarItem href="/docs/intro" />
      <SidebarItem href="/docs/installation" />
    </SidebarSection>
    <SidebarSection title="Dynamics 365 BC">
      <SidebarItem href="/docs/bc/overview" />
    </SidebarSection>
  </SidebarNav>
</DocsSidebar>
```

### 4. Search Implementation
**Approach 1: Flexsearch (Local)**
- Build index at build time
- Fast client-side search
- No external dependencies
- Limited to smaller doc sets

**Approach 2: Pagefind (Recommended)**
- Static search index
- Better for large docs
- Ranking and filtering
- No runtime cost

**Search Features:**
- ⌘K shortcut to open
- Real-time results
- Category filtering
- Recent searches
- Keyboard navigation

### 4.5 Draft Content Filtering

**Objective:** Filter draft content based on user role

```typescript
// lib/content/draft-filter.ts
import matter from 'gray-matter'

interface DraftCheckResult {
  isDraft: boolean
  reason?: 'frontmatter' | 'title-pattern'
}

/**
 * Check if content is a draft
 * 1. Check frontmatter `draft` field (boolean)
 * 2. Fallback to title pattern check for [DRAFT] or [draft]
 */
export function isDraftContent(content: string, frontmatter?: Record<string, any>): DraftCheckResult {
  // Parse frontmatter if not provided
  if (!frontmatter) {
    const { data } = matter(content)
    frontmatter = data
  }
  
  // Check frontmatter draft field first (explicit)
  if (typeof frontmatter.draft === 'boolean') {
    return {
      isDraft: frontmatter.draft,
      reason: frontmatter.draft ? 'frontmatter' : undefined
    }
  }
  
  // Fallback to title pattern check
  const title = frontmatter.title as string
  if (title && /\[draft\]/i.test(title)) {
    return {
      isDraft: true,
      reason: 'title-pattern'
    }
  }
  
  return { isDraft: false }
}

/**
 * Filter content based on user role
 * @param content - Array of content items with frontmatter
 * @param userRole - User's role ('admin', 'editor', 'user')
 * @returns Filtered content array
 */
export function filterDraftContent<T extends { frontmatter: Record<string, any>; content: string }>(
  content: T[],
  userRole?: string
): T[] {
  // Admins see everything
  if (userRole === 'admin') {
    return content
  }
  
  // Filter out drafts for non-admin users
  return content.filter(item => {
    const { isDraft } = isDraftContent(item.content, item.frontmatter)
    return !isDraft
  })
}

/**
 * Check if user can access draft content
 */
export function canAccessDraft(userRole?: string): boolean {
  return userRole === 'admin'
}
```

**Usage in API Routes:**
```typescript
// app/api/content/docs/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { filterDraftContent, isDraftContent } from '@/lib/content/draft-filter'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  // Fetch all docs
  const allDocs = await getAllDocs()
  
  // Filter drafts based on user role
  const filteredDocs = filterDraftContent(allDocs, session?.user?.role)
  
  return Response.json({ docs: filteredDocs })
}
```

**Usage in Pages:**
```typescript
// app/(protected)/docs/[...slug]/page.tsx
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { isDraftContent, canAccessDraft } from '@/lib/content/draft-filter'

export default async function DocPage({ params }: { params: { slug: string[] } }) {
  const session = await getServerSession(authOptions)
  const content = await getDocContent(params.slug)
  
  // Check if content is draft
  const { isDraft } = isDraftContent(content.raw, content.frontmatter)
  
  // Non-admin users cannot access drafts
  if (isDraft && !canAccessDraft(session?.user?.role)) {
    notFound() // Return 404
  }
  
  return (
    <article>
      {isDraft && (
        <div className="mb-4 rounded-lg border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p className="text-amber-800 dark:text-amber-200 font-semibold flex items-center gap-2">
            <span className="text-xl">📝</span> DRAFT CONTENT - Admin Preview
          </p>
        </div>
      )}
      <h1>{content.frontmatter.title}</h1>
      <MDXContent source={content.mdx} />
    </article>
  )
}
```

### 5. MDX Processing Pipeline
```typescript
// lib/content/mdx.ts
Remark plugins:
- remark-gfm (tables, strikethrough, etc.)
- remark-math (LaTeX support)
- remark-mermaid (diagrams)

Rehype plugins:
- rehype-slug (heading IDs)
- rehype-autolink-headings
- rehype-code-titles
- rehype-prism-plus or rehype-shiki

Custom components:
- <Callout type="info|warning|error" />
- <Tabs><Tab>...</Tab></Tabs>
- <CodeBlock language="ts" />
- <Mermaid chart="..." /> or ```mermaid code blocks
- <Steps>
- <Card>
- <SwaggerUI spec="/api/specs/my-api" />
```

**Mermaid Diagram Component:**
```typescript
// components/diagrams/mermaid-diagram.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Button } from '@/components/ui/button'
import { Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface MermaidDiagramProps {
  chart: string
  id?: string
  className?: string
}

export function MermaidDiagram({ chart, id, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [zoom, setZoom] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    })

    const renderDiagram = async () => {
      try {
        const diagramId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`
        const { svg } = await mermaid.render(diagramId, chart)
        setSvg(svg)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      }
    }

    renderDiagram()
  }, [chart, id])

  const handleDownload = () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagram-${id || 'export'}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleReset = () => setZoom(1)

  if (error) {
    return (
      <div className="border border-red-300 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">Mermaid Error</p>
        <pre className="text-sm mt-2 text-red-500 dark:text-red-300">{error}</pre>
      </div>
    )
  }

  return (
    <div className={`relative border rounded-lg overflow-hidden ${className || ''}`}>
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 backdrop-blur rounded-md p-1">
        <Button size="icon" variant="ghost" onClick={handleZoomOut} title="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleReset} title="Reset zoom">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleZoomIn} title="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleDownload} title="Download SVG">
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        ref={containerRef}
        className="flex items-center justify-center p-8 bg-white dark:bg-gray-900 overflow-auto"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}
```

**Swagger UI Component:**
```typescript
// components/api-docs/swagger-ui.tsx
'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

interface SwaggerUIViewerProps {
  spec: string | object // URL or spec object
  tryItOutEnabled?: boolean
}

export function SwaggerUIViewer({ spec, tryItOutEnabled = true }: SwaggerUIViewerProps) {
  return (
    <div className="swagger-container">
      <SwaggerUI
        spec={spec}
        tryItOutEnabled={tryItOutEnabled}
        persistAuthorization={true}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
      />
    </div>
  )
}
```

**Redoc Component:**
```typescript
// components/api-docs/redoc-viewer.tsx
'use client'

import { RedocStandalone } from 'redoc'

interface RedocViewerProps {
  spec: string | object
}

export function RedocViewer({ spec }: RedocViewerProps) {
  return (
    <RedocStandalone
      spec={spec}
      options={{
        nativeScrollbars: true,
        theme: {
          colors: {
            primary: { main: '#ff6b35' }, // Brand orange
          },
        },
      }}
    />
  )
}
```

**API Spec Viewer Page:**
```typescript
// app/(protected)/api-docs/[slug]/page.tsx
import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'
import { SwaggerUIViewer } from '@/components/api-docs/swagger-ui'
import { RedocViewer } from '@/components/api-docs/redoc-viewer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export async function generateStaticParams() {
  const specs = await prisma.aPISpec.findMany({
    where: { enabled: true },
    select: { slug: true }
  })
  
  return specs.map(spec => ({ slug: spec.slug }))
}

export default async function APIDocPage({ params }: { params: { slug: string } }) {
  const spec = await prisma.aPISpec.findUnique({
    where: { slug: params.slug, enabled: true }
  })
  
  if (!spec) notFound()
  
  const specData = JSON.parse(spec.specContent)
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">{spec.name}</h1>
        {spec.description && (
          <p className="text-muted-foreground mt-2">{spec.description}</p>
        )}
        <div className="flex gap-2 mt-4 text-sm">
          <span className="px-2 py-1 bg-brand-orange/10 text-brand-orange rounded">
            Version {spec.version}
          </span>
          <span className="px-2 py-1 bg-muted rounded">
            {spec.specFormat}
          </span>
        </div>
      </div>
      
      <Tabs defaultValue={spec.renderer}>
        <TabsList>
          <TabsTrigger value="swagger-ui">Swagger UI</TabsTrigger>
          <TabsTrigger value="redoc">Redoc</TabsTrigger>
        </TabsList>
        
        <TabsContent value="swagger-ui" className="mt-6">
          <SwaggerUIViewer spec={specData} />
        </TabsContent>
        
        <TabsContent value="redoc" className="mt-6">
          <RedocViewer spec={specData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**API Specs List Page:**
```typescript
// app/(protected)/api-docs/page.tsx
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function APIDocsPage() {
  const specs = await prisma.aPISpec.findMany({
    where: { enabled: true },
    orderBy: { name: 'asc' }
  })
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Interactive API documentation for all services
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {specs.map(spec => (
          <Link key={spec.id} href={`/api-docs/${spec.slug}`}>
            <Card className="p-6 hover:border-brand-orange transition-colors cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">{spec.name}</h3>
              {spec.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {spec.description}
                </p>
              )}
              <div className="flex gap-2">
                <Badge variant="secondary">v{spec.version}</Badge>
                <Badge variant="outline">{spec.specFormat}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      {specs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No API documentation available yet.
        </div>
      )}
    </div>
  )
}
```

### 6. Webhook Integration
**Purpose:** Auto-deploy on content changes

```typescript
// app/api/webhook/route.ts
POST /api/webhook
- Verify GitHub signature
- Verify Azure DevOps signature
- Trigger on-demand revalidation
- revalidatePath('/docs/[slug]')
- Return 200 OK
```

**Setup:**
- GitHub: Settings → Webhooks → Add webhook
- Azure DevOps: Service Hooks → Web Hooks
- Vercel: Set REVALIDATE_TOKEN secret

**Multi-Repository Webhook Handler:**
```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getRepoById } from '@/config/repos'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-hub-signature-256') || 
                   req.headers.get('x-azure-signature')
  const repoId = req.headers.get('x-repo-id') // Custom header to identify repo
  
  if (!repoId) {
    return NextResponse.json({ error: 'Missing repo ID' }, { status: 400 })
  }

  const config = getRepoById(repoId)
  if (!config) {
    return NextResponse.json({ error: 'Invalid repo ID' }, { status: 404 })
  }

  const body = await req.text()
  
  // Verify webhook signature
  if (config.webhookSecret && signature) {
    const isValid = verifySignature(body, signature, config.webhookSecret, config.source)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  // Trigger revalidation based on content type
  if (config.type === 'docs') {
    revalidatePath('/docs')
  } else if (config.type === 'blog') {
    revalidatePath('/blog')
  }

  // Log webhook event for monitoring
  console.log(`[Webhook] Revalidated ${config.type} content from repo: ${repoId}`)

  return NextResponse.json({ 
    revalidated: true, 
    repoId,
    type: config.type,
    timestamp: new Date().toISOString()
  })
}

function verifySignature(
  body: string, 
  signature: string, 
  secret: string,
  source: 'azure' | 'github'
): boolean {
  if (source === 'github') {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    return `sha256=${hash}` === signature
  } else {
    // Azure DevOps signature verification
    const hash = crypto
      .createHmac('sha1', secret)
      .update(body)
      .digest('base64')
    return hash === signature
  }
}
```

**Repository Health Monitor:**
```typescript
// lib/monitoring/repo-health.ts
import { getRepoConfigs } from '@/config/repos'
import { createClient } from '@/lib/content/aggregator'

export interface RepoHealth {
  id: string
  status: 'healthy' | 'degraded' | 'down'
  lastCheck: Date
  responseTime?: number
  error?: string
  filesCount?: number
}

export async function checkRepoHealth(repoId: string): Promise<RepoHealth> {
  const config = getRepoConfigs().find(r => r.id === repoId)
  if (!config) {
    return {
      id: repoId,
      status: 'down',
      lastCheck: new Date(),
      error: 'Repository not found in configuration'
    }
  }

  const startTime = Date.now()
  try {
    const client = createClient(config)
    const files = await client.listFiles(config.basePath)
    const responseTime = Date.now() - startTime

    return {
      id: repoId,
      status: responseTime > 5000 ? 'degraded' : 'healthy',
      lastCheck: new Date(),
      responseTime,
      filesCount: files.length
    }
  } catch (error) {
    return {
      id: repoId,
      status: 'down',
      lastCheck: new Date(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function checkAllReposHealth(): Promise<RepoHealth[]> {
  const configs = getRepoConfigs()
  return Promise.all(configs.map(config => checkRepoHealth(config.id)))
}
```

### 7. UI Components (shadcn/ui)

**Install Base Components:**
```bash
npx shadcn@latest init
npx shadcn@latest add button card tabs dialog input separator breadcrumb navigation-menu dropdown-menu form label avatar
```

**Custom Components to Build:**
- `<LoginForm>` - SSO + local credentials login
- `<RegisterForm>` - User registration (local only)
- `<UserMenu>` - User dropdown with sign out
- `<ProtectedLayout>` - Wrapper requiring auth
- `<DocLayout>` - Docs page wrapper with sidebar + TOC
- `<BlogLayout>` - Blog page wrapper
- `<TableOfContents>` - Right sidebar TOC
- `<Pagination>` - Prev/Next docs navigation
- `<Breadcrumbs>` - Auto-generated from path
- `<SearchDialog>` - ⌘K search modal
- `<ThemeToggle>` - Dark/light mode switch
- `<CodeBlock>` - Syntax highlighted code with copy button
- `<Callout>` - Info/warning/error boxes
- `<Mermaid>` - Diagram renderer

### 8. Performance Optimizations
- **Image Optimization:** Use next/image for all images
- **Font Optimization:** Local fonts with next/font
- **Code Splitting:** Dynamic imports for heavy components
- **Streaming:** Use Suspense boundaries
- **ISR:** Revalidate every hour by default
- **Edge Runtime:** Use edge runtime for API routes where possible

### 9. SEO & Metadata
```typescript
// app/(docs)/docs/[...slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const doc = await getDoc(params.slug)
  return {
    title: `${doc.title} | Harvey Norman Commercial Apps Team`,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: 'article',
      publishedTime: doc.publishedAt,
      authors: [doc.author],
      siteName: 'Harvey Norman Commercial Apps Team Documentation',
    },
    twitter: {
      card: 'summary_large_image',
      title: doc.title,
      description: doc.description,
    }
  }
}
```

### 10. Dark Mode
```typescript
// Use next-themes with brand colors
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  {children}
</ThemeProvider>

// Tailwind config
darkMode: 'class'

// Components use brand colors:
className="bg-white dark:bg-brand-navy"
className="text-gray-900 dark:text-white"
className="border-gray-200 dark:border-brand-navy-light"

// Primary buttons use brand orange:
className="bg-brand-orange hover:bg-brand-orange-hover text-white"

// Secondary buttons use outlined style:
className="border-2 border-white bg-transparent hover:bg-white/10 text-white"
```

### 11. Hero Section Component
```typescript
// components/hero.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-brand-gradient">
      <div className="container px-4 text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-4">
            <Image
              src="/hnc_cat_logo_blk.svg"
              alt="Harvey Norman Commercial Apps Team"
              width={200}
              height={80}
              className="dark:invert"
            />
            <div className="text-left">
              <div className="text-brand-orange font-bold text-sm uppercase tracking-wider">
                Commercial Apps Team
              </div>
              <div className="text-white/80 text-xs">Enterprise Solutions Hub</div>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Commercial Apps Team
          <br />
          <span className="text-white/90">Documentation</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-4xl mx-auto">
          Enterprise Solutions Hub for Microsoft Technologies & Business Applications
        </p>
        
        <p className="text-lg text-brand-orange mb-12">
          Microsoft Technologies • Enterprise Solutions • Business Applications
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            className="bg-brand-orange hover:bg-brand-orange-hover text-white px-8 py-6 text-lg rounded-full"
            asChild
          >
            <Link href="/docs">Get Started</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white bg-transparent hover:bg-white/10 text-white px-8 py-6 text-lg rounded-full"
            asChild
          >
            <Link href="/blog">Latest Updates</Link>
          </Button>
        </div>
        
        <div className="mt-16 text-brand-gray flex items-center justify-center gap-2">
          <span>Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
```

## Configuration Files

### Environment Variables
```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl

# Public URL for OAuth callbacks
NEXT_PUBLIC_URL=http://localhost:3000

# Database (PostgreSQL or MySQL)
DATABASE_URL=postgresql://user:password@localhost:5432/docs_db
# or for MySQL:
# DATABASE_URL=mysql://user:password@localhost:3306/docs_db

# Encryption (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your-64-character-hex-encryption-key-here-32-bytes

# Content Sources - Azure DevOps (Primary)
AZURE_DEVOPS_ORG=harveynorman
AZURE_DEVOPS_PAT=your_personal_access_token_here
AZURE_DEVOPS_BRANCH=main

# Multiple Repository Configuration (JSON array format)
# Each repo can be for docs or blog content
CONTENT_REPOS='[
  {
    "id": "main-docs",
    "type": "docs",
    "source": "azure",
    "project": "docs-content",
    "repository": "docs-repo-1",
    "branch": "main",
    "basePath": "doc-content",
    "enabled": true
  },
  {
    "id": "secondary-docs",
    "type": "docs",
    "source": "azure",
    "project": "docs-content-2",
    "repository": "docs-repo-2",
    "branch": "main",
    "basePath": "doc-content",
    "enabled": true
  },
  {
    "id": "main-blog",
    "type": "blog",
    "source": "azure",
    "project": "blog-content",
    "repository": "blog-repo",
    "branch": "main",
    "basePath": "blog-content",
    "enabled": true
  },
  {
    "id": "github-backup",
    "type": "docs",
    "source": "github",
    "repository": "harvey-norman/docs-backup",
    "branch": "main",
    "basePath": "docs",
    "enabled": false
  }
]'

# Content Sources - GitHub (Alternative/Additional)
GITHUB_TOKEN=ghp_xxx

# Search
ALGOLIA_APP_ID=xxx (optional)
ALGOLIA_API_KEY=xxx (optional)

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx
SENTRY_DSN=xxx

# Webhook Security
REVALIDATE_TOKEN=xxx
GITHUB_WEBHOOK_SECRET=xxx
AZURE_DEVOPS_WEBHOOK_SECRET=xxx
```

### Site Configuration
```typescript
// config/site.ts
export const siteConfig = {
  name: "Harvey Norman Commercial Apps Team Documentation",
  tagline: "Enterprise Solutions Hub",
  description: "Enterprise Solutions Hub for Microsoft Technologies & Business Applications",
  url: "https://docs.harveynorman.com",
  links: {
    github: "https://github.com/harvey-norman",
    twitter: "https://twitter.com/harveynorman",
  },
  mainNav: [
    { title: "Documentation", href: "/docs" },
    { title: "Blog", href: "/blog" },
    { title: "API Reference", href: "/api" },
  ],
}
```

### Brand Colors Configuration
```typescript
// config/brand.ts
export const brandColors = {
  navy: '#1a2332',
  orange: '#ff6b35',
  gray: '#8b9bb3',
  darkGradient: 'linear-gradient(135deg, #1a2332 0%, #2c3e50 100%)',
}
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1a2332',
          'navy-light': '#2c3e50',
          orange: '#ff6b35',
          'orange-hover': '#ff5722',
          gray: '#8b9bb3',
          'gray-light': '#a5b4c7',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1a2332 0%, #2c3e50 100%)',
        'hero-gradient': 'linear-gradient(180deg, #1a2332 0%, #2c3e50 50%, #1a2332 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}

export default config
```

### Global CSS Variables
```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 16 100% 60%; /* Brand orange */
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 16 100% 60%; /* Brand orange */
    --radius: 0.5rem;
  }

  .dark {
    --background: 215 28% 17%; /* Brand navy */
    --foreground: 210 40% 98%;
    --card: 215 25% 20%;
    --card-foreground: 210 40% 98%;
    --popover: 215 28% 17%;
    --popover-foreground: 210 40% 98%;
    --primary: 16 100% 60%; /* Brand orange */
    --primary-foreground: 0 0% 100%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%; /* Brand gray */
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 16 100% 60%; /* Brand orange */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Development Workflow

### Initial Setup
1. Create new Next.js 15 project
2. Install dependencies (shadcn, TanStack Query, etc.)
3. Set up Tailwind with custom theme
4. Initialize shadcn/ui
5. Create base layout components
6. Set up content fetching from GitHub
7. Build MDX processing pipeline
8. Implement search
9. Add webhook handlers
10. Deploy to Vercel

### Content Repository Structure

**Separate Git Repositories (Recommended):**

```
📦 docs-content (Azure DevOps or GitHub)
├── README.md
├── .gitignore
└── doc-content/
    ├── dynamics-365-bc/
    │   ├── _meta.json                    # Category metadata
    │   ├── getting-started.md
    │   ├── financial-management.md
    │   └── api-integration.md
    ├── dynamics-365-ce/
    │   ├── _meta.json
    │   ├── sales-automation.md
    │   └── marketing-automation.md
    ├── dynamics-365-ce-aus/
    │   ├── _meta.json
    │   └── australia-specific.md
    ├── dynamics-365-ce-nzl/
    │   ├── _meta.json
    │   └── new-zealand-specific.md
    ├── tms-aus/
    │   ├── _meta.json
    │   ├── fleet-management.md
    │   └── route-optimization.md
    ├── eway/
    │   ├── _meta.json
    │   ├── getting-started.md
    │   └── api-integration.md
    └── deliver-ezy-nzl/
        ├── _meta.json
        └── setup-guide.md

📦 blog-content (Azure DevOps or GitHub)
├── README.md
├── .gitignore
└── blog-content/
    ├── 2025/
    │   ├── 11/
    │   │   ├── product-locks-management.md
    │   │   └── bug-reporting-system.md
    │   ├── 10/
    │   │   └── stock-status-enhancement.md
    │   └── 09/
    │       ├── product-management-beta.md
    │       └── project-dashboard-update.md
    ├── 2024/
    │   └── 12/
    │       └── year-end-recap.md
    └── authors/
        ├── john-doe.json
        ├── jane-smith.json
        └── _template.json
```

**File Naming Conventions:**

1. **Documentation Files:**
   - Path: `docs/[project]/[slug].md`
   - Example: `docs/dynamics-365-bc/financial-management.md`
   - Slug becomes URL: `/docs/dynamics-365-bc/financial-management`

2. **Blog Posts:**
   - Path: `blog/[YYYY]/[MM]/[slug].md`
   - Example: `blog/2025/11/product-locks-management.md`
   - URL: `/blog/product-locks-management` (date from frontmatter)

3. **Category Metadata (_meta.json):**
   ```json
   {
     "title": "Dynamics 365 Business Central",
     "description": "Documentation for Business Central implementation",
     "icon": "building",
     "order": 1,
     "collapsed": false
   }
   ```

**Frontmatter Schema:**

**Documentation:**
```yaml
---
title: "Financial Management Overview"
description: "Learn about financial management features in Business Central"
category: "dynamics-365-bc"
order: 2
lastUpdated: "2025-11-17"
author: "gareth-cheyne"  # Matches author slug from authors/
tags: ["finance", "accounting", "business-central"]
version: "1.0"
draft: false  # If true, only visible to admin users
---
```

**Documentation (Draft Example):**
```yaml
---
title: "[DRAFT] Upcoming Feature Preview"
description: "Preview of upcoming financial reporting features"
category: "dynamics-365-bc"
order: 99
lastUpdated: "2025-11-17"
author: "gareth-cheyne"
tags: ["preview", "draft"]
version: "0.1"
draft: true  # Only admins can see this
---
```

**Blog Posts:**
```yaml
---
title: "New Product Locks Management Feature"
excerpt: "We've released a new feature for managing product locks across multiple warehouses"
publishedAt: "2025-11-17T10:00:00Z"
updatedAt: "2025-11-17T10:00:00Z"
author: "karen-denter"  # Matches author slug from authors/
coverImage: "/images/blog/product-locks.jpg"
tags: ["feature-release", "product-management", "warehouse"]
category: "product-updates"
featured: true
draft: false  # Published and visible to all authenticated users
---
```

**Blog Posts (Draft Example):**
```yaml
---
title: "[DRAFT] Q1 2026 Roadmap"
excerpt: "Internal preview of our Q1 2026 product roadmap"
publishedAt: "2025-11-20T10:00:00Z"
author: "leigh-hogan"
tags: ["roadmap", "planning"]
category: "internal"
featured: false
draft: true  # Only admins can view
---
```

**Draft Content Filtering Rules:**
1. Check frontmatter `draft` field first (boolean)
2. If frontmatter missing, check title for `[DRAFT]` or `[draft]` pattern (case-insensitive)
3. If either condition is true:
   - Admin users (`role: "admin"`) → Show content normally
   - Non-admin users → Hide content completely (not in lists, direct access returns 404)
4. Draft content does not appear in:
   - Search results (for non-admin)
   - Blog/doc listings (for non-admin)
   - Sitemap generation
   - RSS feeds

**Author Files (authors/[slug].json):**
```json
{
  "name": "Jane Smith",
  "role": "Product Manager",
  "avatar": "/images/authors/jane-smith.jpg",
  "bio": "Product Manager focused on warehouse management solutions",
  "social": {
    "twitter": "https://twitter.com/janesmith",
    "linkedin": "https://linkedin.com/in/janesmith",
    "email": "jane.smith@harveynorman.com"
  }
}
```

### Content Migration Strategy
1. Keep existing markdown/MDX files
2. Update frontmatter to new schema
3. Move to separate Git repo(s) in Azure DevOps or GitHub
4. Apply naming conventions as documented above
5. Create _meta.json files for each category
6. Create author profiles in authors/ directory

### Development Commands
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "search:index": "node scripts/build-search-index.js"
  }
}
```

## Migration Checklist

### Phase 1: Foundation & Authentication (Week 1)
- [ ] Create new Next.js 15 project
- [ ] Set up TypeScript + ESLint + Prettier
- [ ] Install Tailwind CSS 4
- [ ] Initialize shadcn/ui
- [ ] Set up PostgreSQL/MySQL database
- [ ] Install and configure Prisma
- [ ] Install NextAuth.js v5
- [ ] Configure Azure AD provider
- [ ] Configure credentials provider
- [ ] Create database schema and migrate
- [ ] Build login page with SSO + local auth
- [ ] Build registration page (local only)
- [ ] Implement middleware for route protection
- [ ] Create user menu component
- [ ] Set up dark mode with next-themes
- [ ] Test authentication flows

### Phase 2: Content System (Week 2)
- [ ] Create protected route layouts
- [ ] Build GitHub API client (server-side only)
- [ ] Build Azure DevOps API client
- [ ] Implement MDX processing pipeline
- [ ] Create content caching layer
- [ ] Set up ISR for docs/blog pages
- [ ] Ensure content API checks authentication
- [ ] Test with sample content

### Phase 3: UI Components (Week 2-3)
- [ ] Build documentation sidebar
- [ ] Build table of contents component
- [ ] Create breadcrumbs navigation
- [ ] Build search dialog (⌘K)
- [ ] Create code block with copy button
- [ ] Build custom MDX components (Callout, Tabs, etc.)
- [ ] Add Mermaid diagram support

### Phase 4: Search & Discovery (Week 3)
- [ ] Implement Pagefind or Flexsearch
- [ ] Build search index generation
- [ ] Create search results UI
- [ ] Add category/tag filtering
- [ ] Implement keyboard navigation

### Phase 5: Blog Features (Week 4)
- [ ] Blog listing page with pagination
- [ ] Individual blog post layout
- [ ] Author profiles
- [ ] Related posts
- [ ] RSS feed generation
- [ ] Social sharing

### Phase 6: DevOps Integration (Week 4)
- [ ] Set up webhook endpoints
- [ ] Implement signature verification
- [ ] Configure on-demand revalidation
- [ ] Set up GitHub webhooks
- [ ] Set up Azure DevOps service hooks
- [ ] Test automatic deployments

### Phase 7: Polish & Deploy (Week 5)
- [ ] SEO optimization (metadata, sitemaps)
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Mobile responsiveness
- [ ] Analytics integration
- [ ] Error tracking (Sentry)
- [ ] Deploy to Vercel
- [ ] Set up custom domain
- [ ] DNS configuration

### Phase 8: Content Migration (Week 5-6)
- [ ] Create separate content repositories
- [ ] Migrate existing docs
- [ ] Update frontmatter
- [ ] Test all links
- [ ] Verify images
- [ ] Set up content workflows
- [ ] Train content editors

## Agent Instructions

### When Creating This Project:

1. **Start Fresh:** Create new Next.js project in separate directory
2. **Follow Best Practices:** Use App Router, Server Components by default
3. **Type Safety:** Everything should be fully typed with TypeScript
4. **Component Structure:** Build composable, reusable components
5. **Performance First:** Optimize for Core Web Vitals
6. **Accessibility:** ARIA labels, keyboard navigation, semantic HTML
7. **Error Handling:** Graceful fallbacks, error boundaries, loading states
8. **Documentation:** Comment complex logic, use JSDoc for public APIs

### Code Style:
- Use functional components with hooks
- Prefer Server Components unless interactivity needed
- Use `"use client"` directive sparingly
- Follow shadcn/ui patterns for component composition
- Use Tailwind utility classes (avoid custom CSS)
- Extract repeated patterns to custom components

### File Naming:
- Pages: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Components: `PascalCase.tsx`
- Utils: `kebab-case.ts`
- Config: `kebab-case.ts`

### Testing Strategy:
- Unit tests for utilities (Vitest)
- Component tests (React Testing Library)
- E2E tests for critical flows (Playwright)
- Visual regression tests (Chromatic - optional)

## Success Criteria

✅ **Performance:**
- Lighthouse score > 95 across all metrics
- First Contentful Paint < 1s
- Time to Interactive < 2s

✅ **Content:**
- All docs migrated successfully
- All blog posts preserved
- Images optimized and working
- Links all functional

✅ **Features:**
- Search working with <300ms response
- Dark mode toggles smoothly
- Mobile navigation is smooth
- Webhook auto-deploys in <2min

✅ **Security:**
- All content protected by authentication
- Azure AD SSO working correctly
- Local auth with secure password hashing
- Session management functioning
- Middleware blocking unauthenticated access

✅ **Developer Experience:**
- Content editors can work in separate repos
- Changes deploy automatically
- Clear documentation for contributors
- Easy to add new features
- Easy user management (admin panel optional)

### 12. Admin Portal - Repository Management

**Repository Form Component:**
```typescript
// components/admin/repo-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert } from '@/components/ui/alert'

interface RepoFormProps {
  repo?: any
  onSubmit: (data: any) => Promise<void>
}

export function RepoForm({ repo, onSubmit }: RepoFormProps) {
  const router = useRouter()
  const [source, setSource] = useState(repo?.source || 'azure')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  
  async function testConnection(formData: FormData) {
    setTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/admin/repos/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      })
      
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: 'Connection failed' })
    } finally {
      setTesting(false)
    }
  }
  
  return (
    <form action={onSubmit} className="space-y-6">
      <div>
        <Label>Repository Name</Label>
        <Input
          name="name"
          defaultValue={repo?.name}
          placeholder="Main Documentation"
          required
        />
      </div>
      
      <div>
        <Label>Type</Label>
        <Select name="type" defaultValue={repo?.type || 'docs'}>
          <option value="docs">Documentation</option>
          <option value="blog">Blog</option>
        </Select>
      </div>
      
      <div>
        <Label>Source</Label>
        <Select 
          name="source" 
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="azure">Azure DevOps</option>
          <option value="github">GitHub</option>
        </Select>
      </div>
      
      {source === 'azure' ? (
        <>
          <div>
            <Label>Azure Organization</Label>
            <Input
              name="azureOrg"
              defaultValue={repo?.azureOrg}
              placeholder="harveynorman"
              required
            />
          </div>
          <div>
            <Label>Azure Project</Label>
            <Input
              name="azureProject"
              defaultValue={repo?.azureProject}
              placeholder="docs-content"
              required
            />
          </div>
          <div>
            <Label>Repository Name</Label>
            <Input
              name="azureRepo"
              defaultValue={repo?.azureRepo}
              placeholder="docs-repo-1"
              required
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <Label>GitHub Owner</Label>
            <Input
              name="githubOwner"
              defaultValue={repo?.githubOwner}
              placeholder="harvey-norman"
              required
            />
          </div>
          <div>
            <Label>Repository Name</Label>
            <Input
              name="githubRepo"
              defaultValue={repo?.githubRepo}
              placeholder="docs-content"
              required
            />
          </div>
        </>
      )}
      
      <div>
        <Label>Branch</Label>
        <Input
          name="branch"
          defaultValue={repo?.branch || 'main'}
          placeholder="main"
        />
      </div>
      
      <div>
        <Label>Base Path</Label>
        <Input
          name="basePath"
          defaultValue={repo?.basePath}
          placeholder="doc-content"
        />
      </div>
      
      <div>
        <Label>Personal Access Token (PAT)</Label>
        <Input
          type="password"
          name="pat"
          placeholder={repo?.patEncrypted ? '••••••••••••••' : 'Enter PAT'}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {source === 'azure' 
            ? 'Azure DevOps Personal Access Token with Code (Read) permission'
            : 'GitHub Personal Access Token with repo scope'
          }
        </p>
      </div>
      
      <div>
        <Label>Sync Frequency (seconds)</Label>
        <Input
          type="number"
          name="syncFrequency"
          defaultValue={repo?.syncFrequency || 3600}
          min={300}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Minimum: 300 seconds (5 minutes)
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          name="enabled"
          defaultChecked={repo?.enabled ?? true}
        />
        <Label>Enable this repository</Label>
      </div>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => testConnection(new FormData(document.querySelector('form')!))}
          disabled={testing}
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>
        
        <Button type="submit" disabled={!testResult?.success}>
          {repo ? 'Update Repository' : 'Add Repository'}
        </Button>
      </div>
      
      {testResult && (
        <Alert variant={testResult.success ? 'default' : 'destructive'}>
          {testResult.success ? (
            <div>
              <p className="font-semibold">✓ Connection successful!</p>
              <p className="text-sm">Found {testResult.filesCount} files</p>
              <p className="text-sm">Response time: {testResult.responseTime}ms</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold">✗ Connection failed</p>
              <p className="text-sm">{testResult.error}</p>
            </div>
          )}
        </Alert>
      )}
    </form>
  )
}
```

**Repository List Page:**
```typescript
// app/(protected)/admin/repos/page.tsx
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RepoStatusBadge } from '@/components/admin/repo-status-badge'
import { SyncTrigger } from '@/components/admin/sync-trigger'

export default async function ReposAdminPage() {
  const session = await auth()
  
  if (!session || session.user.role !== 'admin') {
    redirect('/docs')
  }
  
  const repos = await prisma.repository.findMany({
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { syncLogs: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Repository Management</h1>
        <Button asChild>
          <Link href="/admin/repos/new">Add Repository</Link>
        </Button>
      </div>
      
      <div className="grid gap-4">
        {configs.map(config => {
          const status = health.find(h => h.id === config.id)
          return (
            <div key={repo.id} className="border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{repo.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {repo.source} • {repo.type} • {repo.branch}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <RepoStatusBadge status={repo.lastSyncStatus} />
                  {repo.enabled ? (
                    <span className="text-green-600 text-sm">Enabled</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Disabled</span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="ml-2 font-mono">
                    {repo.lastSyncAt ? new Date(repo.lastSyncAt).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Files:</span>
                  <span className="ml-2 font-mono">{repo.filesCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sync Frequency:</span>
                  <span className="ml-2 font-mono">{repo.syncFrequency / 60}min</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/repos/${repo.id}`}>Edit</Link>
                </Button>
                <SyncTrigger repoId={repo.id} />
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/admin/repos/${repo.id}/logs`}>View Logs ({repo._count.syncLogs})</Link>
                </Button>
              </div>
              
              {repo.lastSyncError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                  {repo.lastSyncError}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Repository Server Actions:**
```typescript
// app/(protected)/admin/repos/actions.ts
'use server'

import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { encryptToken } from '@/lib/crypto/encryption'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { AzureDevOpsClient } from '@/lib/content/devops'
import { GitHubClient } from '@/lib/content/github'
import { z } from 'zod'

const repoSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['docs', 'blog']),
  source: z.enum(['azure', 'github']),
  azureOrg: z.string().optional(),
  azureProject: z.string().optional(),
  azureRepo: z.string().optional(),
  githubOwner: z.string().optional(),
  githubRepo: z.string().optional(),
  branch: z.string().default('main'),
  basePath: z.string().default(''),
  pat: z.string().optional(),
  syncFrequency: z.number().min(300).default(3600),
  enabled: z.boolean().default(true),
  priority: z.number().default(0),
})

export async function createRepository(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  const data = {
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    source: formData.get('source') as string,
    azureOrg: formData.get('azureOrg') as string,
    azureProject: formData.get('azureProject') as string,
    azureRepo: formData.get('azureRepo') as string,
    githubOwner: formData.get('githubOwner') as string,
    githubRepo: formData.get('githubRepo') as string,
    branch: formData.get('branch') as string || 'main',
    basePath: formData.get('basePath') as string || '',
    pat: formData.get('pat') as string,
    syncFrequency: parseInt(formData.get('syncFrequency') as string) || 3600,
    enabled: formData.get('enabled') === 'on',
    priority: 0,
  }

  const validated = repoSchema.parse(data)

  // Generate slug from name
  const slug = validated.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // Encrypt PAT if provided
  const patEncrypted = validated.pat ? encryptToken(validated.pat) : undefined

  const repo = await prisma.repository.create({
    data: {
      name: validated.name,
      slug,
      type: validated.type,
      source: validated.source,
      azureOrg: validated.azureOrg,
      azureProject: validated.azureProject,
      azureRepo: validated.azureRepo,
      githubOwner: validated.githubOwner,
      githubRepo: validated.githubRepo,
      branch: validated.branch,
      basePath: validated.basePath,
      patEncrypted,
      syncFrequency: validated.syncFrequency,
      enabled: validated.enabled,
      priority: validated.priority,
      createdBy: session.user.id,
      webhookSecret: crypto.randomBytes(32).toString('hex'),
    }
  })

  revalidatePath('/admin/repos')
  redirect('/admin/repos')
}

export async function updateRepository(id: string, formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  const data = {
    name: formData.get('name') as string,
    branch: formData.get('branch') as string,
    basePath: formData.get('basePath') as string,
    pat: formData.get('pat') as string,
    syncFrequency: parseInt(formData.get('syncFrequency') as string),
    enabled: formData.get('enabled') === 'on',
  }

  const updateData: any = {
    name: data.name,
    branch: data.branch,
    basePath: data.basePath,
    syncFrequency: data.syncFrequency,
    enabled: data.enabled,
  }

  // Only update PAT if a new one is provided
  if (data.pat && data.pat !== '••••••••••••••') {
    updateData.patEncrypted = encryptToken(data.pat)
  }

  await prisma.repository.update({
    where: { id },
    data: updateData
  })

  revalidatePath('/admin/repos')
  revalidatePath(`/admin/repos/${id}`)
}

export async function deleteRepository(id: string) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  await prisma.repository.delete({ where: { id } })
  
  revalidatePath('/admin/repos')
}

export async function triggerSync(repoId: string) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  const repo = await prisma.repository.findUnique({ where: { id: repoId } })
  if (!repo) throw new Error('Repository not found')

  // Trigger sync (implement in sync-engine.ts)
  const { syncRepository } = await import('@/lib/sync/sync-engine')
  await syncRepository(repo)
  
  revalidatePath('/admin/repos')
}
```

**Test Connection API:**
```typescript
// app/api/admin/repos/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { AzureDevOpsClient } from '@/lib/content/devops'
import { GitHubClient } from '@/lib/content/github'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()
  const startTime = Date.now()

  try {
    let client
    
    if (data.source === 'azure') {
      client = new AzureDevOpsClient({
        org: data.azureOrg,
        project: data.azureProject,
        repositoryId: data.azureRepo,
        branch: data.branch,
        pat: data.pat,
      })
    } else {
      client = new GitHubClient({
        repo: `${data.githubOwner}/${data.githubRepo}`,
        branch: data.branch,
        token: data.pat,
      })
    }

    const files = await client.listFiles(data.basePath || '')
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      filesCount: files.length,
      responseTime,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    })
  }
}
```

---

## Feature Request System - Complete Implementation

### Database Schema (Implemented)

```prisma
model FeatureCategory {
  id              String    @id @default(uuid())
  name            String    @unique
  slug            String    @unique
  description     String?   @db.Text
  icon            String?
  color           String?
  order           Int       @default(0)
  enabled         Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  featureRequests FeatureRequest[]
}

model FeatureRequest {
  id              String    @id @default(uuid())
  title           String
  slug            String    @unique
  description     String    @db.Text
  status          String    @default("proposal")
  priority        String?
  targetVersion   String?
  expectedDate    DateTime?
  createdBy       String
  createdByName   String
  createdByEmail  String
  categoryId      String?   // Now nullable (supports orphaned features)
  tags            String[]  @default([])
  voteCount       Int       @default(0)
  commentCount    Int       @default(0)
  followerCount   Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastActivityAt  DateTime  @default(now())
  
  creator         User      @relation("FeatureRequestCreator", fields: [createdBy], references: [id])
  category        FeatureCategory? @relation(fields: [categoryId], references: [id])
  votes           FeatureVote[]
  comments        FeatureComment[]
  statusHistory   FeatureStatusHistory[]
}

model FeatureVote {
  id              String    @id @default(uuid())
  featureId       String
  userId          String
  voteType        Int       // +1 (upvote) or -1 (downvote)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  feature         FeatureRequest @relation(fields: [featureId], references: [id], onDelete: Cascade)
  user            User      @relation("FeatureVotes", fields: [userId], references: [id], onDelete: Cascade)
  @@unique([featureId, userId])
}

model FeatureComment {
  id              String    @id @default(uuid())
  featureId       String
  userId          String
  content         String    @db.Text
  isDeleted       Boolean   @default(false)
  deletedAt       DateTime?
  deletedBy       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  feature         FeatureRequest @relation(fields: [featureId], references: [id], onDelete: Cascade)
  user            User      @relation("FeatureComments", fields: [userId], references: [id])
  deletedByUser   User?     @relation("DeletedComments", fields: [deletedBy], references: [id])
}

model FeatureStatusHistory {
  id              String    @id @default(uuid())
  featureId       String
  oldStatus       String?
  newStatus       String
  changedBy       String
  reason          String?   @db.Text
  createdAt       DateTime  @default(now())
  feature         FeatureRequest @relation(fields: [featureId], references: [id], onDelete: Cascade)
  user            User      @relation("StatusChanges", fields: [changedBy], references: [id])
}
```

### API Routes (Implemented)

**Public Routes:**
```
GET    /api/features              - List features (with filters)
GET    /api/features/[id]         - Get single feature
POST   /api/features/[id]/vote    - Toggle vote (upvote/downvote)
GET    /api/features/[id]/vote    - Get user's current vote
GET    /api/features/[id]/comments - Get comments
POST   /api/features/[id]/comments - Add comment
```

**Admin Routes:**
```
GET    /api/admin/features/categories     - List categories
POST   /api/admin/features/categories     - Create category
PATCH  /api/admin/features/categories/[id] - Update category
DELETE /api/admin/features/categories/[id] - Delete category (with orphan/cascade)
```

### Category Deletion Strategies

**Orphan Strategy** (deleteRequests=false):
1. Sets categoryId to null for all related features
2. Deletes the category
3. Features remain in database, accessible via "Uncategorized"

**Cascade Delete** (deleteRequests=true):
1. Deletes votes for all features in category
2. Deletes comments for all features
3. Deletes status history for all features
4. Deletes all feature requests
5. Deletes the category
6. Uses transaction for data integrity

### UI Components (Implemented)

**Pages:**
```
/features                          - List view with dropdown filters
/features/[slug]                   - Feature detail page
/admin/features/categories         - Category management
/admin/features/categories/new     - Create category
/admin/features/categories/[id]    - Edit/delete category
```

**Components:**
```
/components/features/
  features-client.tsx              - Client component with interactivity
  
/components/admin/features/
  edit-category-form.tsx           - Category CRUD form
  
/components/layout/
  app-sidebar.tsx                  - Enhanced with feature categories submenu
```

### Server/Client Component Pattern

**Server Component** (features/page.tsx):
- Fetches data from Prisma
- Gets session for auth
- Passes data to Client Component
- Can be async

**Client Component** (features-client.tsx):
- Handles interactive elements (dropdowns, vote buttons)
- Uses 'use client' directive
- Receives pre-fetched data as props
- Cannot be async

### Voting System

**Logic:**
- If existing vote with same type → Remove vote
- If existing vote with different type → Update vote
- If no existing vote → Create vote
- Updates denormalized voteCount field
- Updates lastActivityAt timestamp

**API:**
```typescript
POST /api/features/[id]/vote
Body: { voteType: 1 or -1 }

Response:
{
  success: true,
  vote: { id, voteType },
  voteCount: 42
}
```

---

## Authentication Setup Instructions (Completed)

### 1. Generate Encryption Key ✅

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output to `.env.local` as `ENCRYPTION_KEY`.

### 2. Generate NextAuth Secret ✅

```bash
openssl rand -base64 32
```

Copy output to `.env.local` as `NEXTAUTH_SECRET`.

### 3. Configure Azure AD SSO ✅

**Steps completed:**
1. Azure Portal → Azure Active Directory → App registrations
2. Created "NextDocs" registration
3. Redirect URI: `http://localhost:9980/api/auth/callback/azure-ad`
4. Configured `AZURE_AD_CLIENT_ID`, `AZURE_AD_TENANT_ID`, `AZURE_AD_CLIENT_SECRET`

### 4. Database Initialization ✅

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed test users
```

### 5. Test Credentials ✅

Default seeded users:
- **Admin**: admin@harveynorman.com / admin123
- **Editor**: editor@harveynorman.com / editor123  
- **User**: user@harveynorman.com / user123

---

## API Versioning Implementation (Completed)

### Database Schema Changes ✅

**Modified APISpec model:**
```prisma
model APISpec {
  // ... other fields
  slug            String    // Not unique (multiple versions allowed)
  version         String    // e.g., "1.0.0", "2.0.0"
  
  @@unique([slug, version]) // Composite unique key
  @@index([slug])
}
```

**Migration:** `20251117081243_add_api_spec_versioning`

### Version Support ✅

**Composite Key Lookups:**
```typescript
await prisma.aPISpec.findUnique({
  where: {
    slug_version: { slug: "my-api", version: "1.0.0" }
  }
})
```

**File Structure:**
```
content/api-specs/
  [category]/
    my-api-v1.yaml   → slug: "category-my-api", version: "1.0.0"
    my-api-v2.yaml   → slug: "category-my-api", version: "2.0.0"
```

**Version Extraction from YAML:**
```yaml
openapi: 3.0.0
info:
  title: NextDoc API
  version: 1.0.0  # Extracted as version field
```

### UI Implementation ✅

**List Page** (`/api-docs`):
- Groups API specs by slug
- Shows all versions for each API
- Latest version displayed first
- Version selector using badges

**Detail Page** (`/api-docs/[slug]/[version]`):
- Versioned route structure
- Version selector in header
- Swagger UI or Redoc renderer
- Displays metadata and sync status

**API Route** (`/api/spec/[slug]/[version]`):
- Serves YAML spec files
- Uses composite key to find spec
- Returns YAML with caching (1 hour)

---

## Docker Workflow Commands

### Development Environment

```json
{
  "scripts": {
    "docker:dev": "docker compose up",
    "docker:build": "docker compose build",
    "docker:reload": "docker compose exec app npm install && docker compose restart app",
    "docker:down": "docker compose down",
    "docker:clean": "docker compose down -v",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

**Usage:**
- `npm run docker:dev` - Start all containers (app, postgres, redis)
- `npm run docker:reload` - Fast package update (no rebuild)
- `npm run docker:clean` - Remove containers and volumes

### Dockerfile Features ✅

**Alpine Linux base:**
- Node 20 Alpine
- curl installed
- Auto npm install on startup
- Port 9980 exposed

**docker-compose.yml:**
- **app**: Next.js app (port 9980)
- **postgres**: PostgreSQL 16 (port 5433)
- **redis**: Redis 7 (port 6379)

---

## Future Enhancements

### Feature Request System
- [x] Feature submission form - **COMPLETED** (/features/new)
- [x] Client-side voting on detail pages - **COMPLETED** (VoteButton component)
- [x] Comment form on detail pages - **COMPLETED** (CommentForm component)
- [x] Status management UI for admins - **COMPLETED** (StatusUpdateDialog)
- [ ] Merge duplicate features
- [ ] GitHub/DevOps two-way sync
- [ ] Email notifications (EWS integration)
- [ ] Following/notification preferences UI

### Content Features
- [ ] Multi-language support (i18n)
- [ ] Mermaid diagram rendering
- [ ] Interactive code examples
- [ ] Search implementation (Pagefind/Flexsearch)
- [ ] Blog post system with RSS
- [ ] Author profiles
- [ ] Related content suggestions
- [ ] Table of contents component
- [ ] Breadcrumb navigation
- [ ] Category metadata (_meta.json)

### Admin Features
- [ ] Repository performance analytics
- [ ] Automated repo failover
- [ ] Content sync scheduling per repository
- [ ] Bulk operations for features
- [ ] User role management UI
- [ ] Webhook event viewer

### General
- [ ] PDF export for documentation
- [ ] Interactive API playground
- [ ] Video embeds and tutorials
- [ ] Community contributions (via GitHub PRs)
- [ ] Comments system (Giscus)
- [ ] Newsletter integration

---

## Quick Start Commands

### Project Initialization

```bash
# Create project
npx create-next-app@latest docs-platform --typescript --tailwind --app --turbopack

# Install authentication dependencies
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client bcryptjs
npm install -D @types/bcryptjs

# Install core dependencies
npm install @tanstack/react-query gray-matter next-mdx-remote remark remark-gfm rehype-slug rehype-autolink-headings next-themes zod lucide-react

# Install Swagger/OpenAPI dependencies
npm install swagger-ui-react redoc openapi-typescript yaml
npm install -D @types/swagger-ui-react

# Install Mermaid
npm install mermaid

# Install Tailwind plugins
npm install -D tailwindcss-animate @tailwindcss/typography

# Initialize Prisma
npx prisma init

# Initialize shadcn
npx shadcn@latest init

# Install shadcn components
npx shadcn@latest add button card tabs dialog input separator breadcrumb navigation-menu form label avatar dropdown-menu alert-dialog textarea

# Create database schema and migrate
npx prisma db push
npx prisma generate
```

### Development Workflow

```bash
# Docker development
npm run docker:dev

# Local development
npm run dev

# Database operations
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed test data

# Package updates in Docker
npm run docker:reload  # Faster than rebuild
```

---

## Recent Implementation Notes

### Server/Client Component Separation
- **Issue**: Event handlers in Server Components caused errors
- **Solution**: Created `features-client.tsx` for interactive UI, kept `features/page.tsx` as Server Component for data fetching
- **Pattern**: Server fetches → Client displays with interactivity

### Category Deletion Enhancement
- **Issue**: Deleting categories orphaned feature requests
- **Solution**: Implemented two strategies:
  1. Orphan: Set categoryId to null (keep features)
  2. Cascade: Delete features and all related data (votes, comments, status history)
- **Implementation**: Radio button selection in delete dialog, transaction-based for data integrity

### UI Restructure
- **Issue**: Sidebar filters cluttered the interface
- **Solution**: 
  - Moved categories to collapsible sidebar menu under "Feature Requests"
  - Converted filters to dropdown menus (Status, Sort)
  - Added active filter badges
  - Full-width layout for feature list

### API Versioning
- **Issue**: Multiple versions of same API couldn't coexist
- **Solution**:
  - Removed `@unique` from slug field
  - Added composite unique constraint: `@@unique([slug, version])`
  - Updated UI to group by slug and show version selector
  - Versioned routes: `/api-docs/[slug]/[version]`

---

## Analytics System - User Activity Tracking

### Overview

**Objective:** Track user activity across the platform including page visits, login attempts, document reads, search queries, and feature request engagement. Provide admin dashboard with real-time insights, filters, and visualizations.

**Requirements:**
- PostgreSQL storage (same database as app data)
- Track authenticated users AND anonymous visitors
- 1 year data retention
- Real-time analytics updates
- Admin-only access to analytics dashboard
- Active reading time tracking (exclude idle/background tabs)
- Scroll depth tracking

### Database Schema

```prisma
// Analytics Models
model AnalyticsEvent {
  id              String    @id @default(uuid())
  sessionId       String    // Session identifier (user-specific or anonymous)
  userId          String?   // Null for anonymous visitors
  eventType       String    // 'page_view', 'login_success', 'login_failure', 'document_read', 'search', 'feature_view', 'api_spec_view'
  eventData       Json?     // Additional event-specific data
  
  // Page/Resource information
  path            String    // URL path
  resourceId      String?   // Document slug, feature ID, etc.
  resourceType    String?   // 'doc', 'blog', 'feature', 'api_spec'
  category        String?   // Content category
  
  // User information
  ipAddress       String?
  userAgent       String?
  referrer        String?
  
  // Timing data
  duration        Int?      // Time spent (milliseconds)
  scrollDepth     Int?      // Scroll percentage (0-100)
  
  // Metadata
  createdAt       DateTime  @default(now())
  
  // Relations
  user            User?     @relation("AnalyticsEvents", fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([sessionId])
  @@index([eventType])
  @@index([createdAt])
  @@index([path])
  @@index([resourceType])
}

model AnalyticsSession {
  id              String    @id @default(uuid())
  sessionId       String    @unique // Session identifier
  userId          String?   // Null for anonymous visitors
  
  // Session details
  ipAddress       String?
  userAgent       String?
  country         String?
  city            String?
  
  // Session timing
  startedAt       DateTime  @default(now())
  lastActivityAt  DateTime  @default(now())
  endedAt         DateTime?
  duration        Int?      // Total session duration (milliseconds)
  
  // Session stats
  pageViews       Int       @default(0)
  uniquePages     Int       @default(0)
  eventsCount     Int       @default(0)
  
  // Relations
  user            User?     @relation("AnalyticsSessions", fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([sessionId])
  @@index([startedAt])
}

model AnalyticsDailySummary {
  id              String    @id @default(uuid())
  date            DateTime  @unique @db.Date
  
  // User metrics
  totalUsers      Int       @default(0)
  newUsers        Int       @default(0)
  activeUsers     Int       @default(0)
  anonymousUsers  Int       @default(0)
  
  // Session metrics
  totalSessions   Int       @default(0)
  avgSessionDuration Int    @default(0)
  
  // Page metrics
  totalPageViews  Int       @default(0)
  uniquePageViews Int       @default(0)
  
  // Authentication metrics
  loginSuccess    Int       @default(0)
  loginFailure    Int       @default(0)
  
  // Content metrics
  documentsRead   Int       @default(0)
  avgReadDuration Int       @default(0)
  searchQueries   Int       @default(0)
  featuresViewed  Int       @default(0)
  apiSpecsViewed  Int       @default(0)
  
  // Top content (JSON arrays)
  topPages        Json?     // [{path, views}]
  topDocuments    Json?     // [{slug, views}]
  topSearches     Json?     // [{query, count}]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([date])
}

// Add to User model
model User {
  // ... existing fields
  
  // Analytics relations
  analyticsEvents   AnalyticsEvent[]   @relation("AnalyticsEvents")
  analyticsSessions AnalyticsSession[] @relation("AnalyticsSessions")
}
```

### Event Types

```typescript
export type AnalyticsEventType =
  | 'page_view'          // User viewed a page
  | 'login_success'      // Successful login
  | 'login_failure'      // Failed login attempt
  | 'document_read'      // User read a document
  | 'document_complete'  // User scrolled to bottom
  | 'search'             // Search query submitted
  | 'feature_view'       // Feature request viewed
  | 'feature_vote'       // Feature request voted
  | 'feature_comment'    // Feature request commented
  | 'api_spec_view'      // API spec viewed
  | 'session_start'      // Session started
  | 'session_end'        // Session ended

export interface AnalyticsEventData {
  // Document read events
  documentSlug?: string
  documentTitle?: string
  readDuration?: number      // milliseconds
  scrollDepth?: number       // 0-100
  
  // Search events
  searchQuery?: string
  searchResults?: number
  
  // Feature events
  featureId?: string
  featureTitle?: string
  voteType?: number         // 1 or -1
  
  // Login events
  loginMethod?: 'credentials' | 'azure-ad'
  failureReason?: string
  
  // API spec events
  apiSpecSlug?: string
  apiSpecVersion?: string
}
```

### Client-Side Tracking

**Analytics Context Provider:**
```typescript
// lib/analytics/client.ts
'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface AnalyticsContextType {
  trackEvent: (eventType: string, eventData?: any) => Promise<void>
  trackPageView: () => void
  trackDocumentRead: (slug: string, title: string) => void
  trackSearch: (query: string, results: number) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sessionId] = useState(() => generateSessionId())
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [scrollDepth, setScrollDepth] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const visibilityTimeout = useRef<NodeJS.Timeout>()
  
  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false)
        // Set timeout for 30 seconds of inactivity
        visibilityTimeout.current = setTimeout(() => {
          // Track session pause
          trackEvent('page_blur', {
            duration: Date.now() - startTime,
            scrollDepth
          })
        }, 30000)
      } else {
        setIsActive(true)
        if (visibilityTimeout.current) {
          clearTimeout(visibilityTimeout.current)
        }
        // Track session resume
        setStartTime(Date.now())
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [startTime, scrollDepth])
  
  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      if (!isActive) return
      
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const depth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100)
      
      setScrollDepth(Math.max(scrollDepth, Math.min(depth, 100)))
    }
    
    const throttledScroll = throttle(handleScroll, 1000)
    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [isActive, scrollDepth])
  
  // Track page views on route change
  useEffect(() => {
    trackPageView()
    setStartTime(Date.now())
    setScrollDepth(0)
  }, [pathname])
  
  // Track session end on unmount
  useEffect(() => {
    return () => {
      trackEvent('session_end', {
        duration: Date.now() - startTime,
        scrollDepth
      })
    }
  }, [])
  
  const trackEvent = async (eventType: string, eventData?: any) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          eventType,
          eventData,
          path: pathname,
          scrollDepth: eventType.includes('read') ? scrollDepth : undefined,
          duration: eventType.includes('read') || eventType.includes('end') ? Date.now() - startTime : undefined,
        })
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }
  
  const trackPageView = () => {
    trackEvent('page_view', {
      referrer: document.referrer
    })
  }
  
  const trackDocumentRead = (slug: string, title: string) => {
    trackEvent('document_read', {
      documentSlug: slug,
      documentTitle: title
    })
  }
  
  const trackSearch = (query: string, results: number) => {
    trackEvent('search', {
      searchQuery: query,
      searchResults: results
    })
  }
  
  return (
    <AnalyticsContext.Provider value={{
      trackEvent,
      trackPageView,
      trackDocumentRead,
      trackSearch
    }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) throw new Error('useAnalytics must be used within AnalyticsProvider')
  return context
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function throttle(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null
  return function(...args: any[]) {
    if (!timeout) {
      timeout = setTimeout(() => {
        func(...args)
        timeout = null
      }, wait)
    }
  }
}
```

**Document Read Tracking Hook:**
```typescript
// hooks/use-document-analytics.ts
'use client'

import { useEffect } from 'use'
import { useAnalytics } from '@/lib/analytics/client'

export function useDocumentAnalytics(slug: string, title: string) {
  const { trackDocumentRead } = useAnalytics()
  
  useEffect(() => {
    // Track when document is mounted
    trackDocumentRead(slug, title)
    
    // Track read completion when user scrolls to bottom
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100
      
      if (scrollPercentage >= 90) {
        trackDocumentRead(slug, title)
        window.removeEventListener('scroll', handleScroll)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [slug, title])
}
```

### Server-Side Tracking

**Analytics Tracking API:**
```typescript
// app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const headersList = headers()
    
    const {
      sessionId,
      userId,
      eventType,
      eventData,
      path,
      scrollDepth,
      duration,
    } = body
    
    // Extract request metadata
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip')
    const userAgent = headersList.get('user-agent')
    const referrer = headersList.get('referer')
    
    // Determine resource type from path
    let resourceType = null
    let resourceId = null
    let category = null
    
    if (path.startsWith('/docs/')) {
      resourceType = 'doc'
      resourceId = path.replace('/docs/', '')
      category = resourceId.split('/')[0]
    } else if (path.startsWith('/blog/')) {
      resourceType = 'blog'
      resourceId = path.replace('/blog/', '')
    } else if (path.startsWith('/features/')) {
      resourceType = 'feature'
      resourceId = path.replace('/features/', '')
    } else if (path.startsWith('/api-docs/')) {
      resourceType = 'api_spec'
      resourceId = path.replace('/api-docs/', '')
    }
    
    // Create analytics event
    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        userId,
        eventType,
        eventData,
        path,
        resourceId,
        resourceType,
        category,
        ipAddress,
        userAgent,
        referrer,
        duration,
        scrollDepth,
      }
    })
    
    // Update or create session
    await prisma.analyticsSession.upsert({
      where: { sessionId },
      update: {
        lastActivityAt: new Date(),
        eventsCount: { increment: 1 },
        ...(eventType === 'page_view' && {
          pageViews: { increment: 1 }
        })
      },
      create: {
        sessionId,
        userId,
        ipAddress,
        userAgent,
        pageViews: eventType === 'page_view' ? 1 : 0,
        eventsCount: 1,
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
```

**Login Tracking (Server Action):**
```typescript
// lib/auth/auth.ts (in authorize function)
export const { handlers, auth, signIn, signOut } = NextAuth({
  // ... other config
  callbacks: {
    async signIn({ user, account, profile }) {
      // Track successful login
      await prisma.analyticsEvent.create({
        data: {
          sessionId: generateSessionId(),
          userId: user.id,
          eventType: 'login_success',
          eventData: {
            loginMethod: account?.provider || 'credentials'
          },
          path: '/login'
        }
      })
      
      return true
    },
    // ... other callbacks
  }
})

// In credentials provider authorize function
async authorize(credentials) {
  try {
    // ... verification logic
    
    if (!isValid) {
      // Track failed login
      await prisma.analyticsEvent.create({
        data: {
          sessionId: generateSessionId(),
          eventType: 'login_failure',
          eventData: {
            loginMethod: 'credentials',
            email: credentials.email,
            failureReason: 'Invalid credentials'
          },
          path: '/login'
        }
      })
      
      return null
    }
    
    return user
  } catch (error) {
    // Track error
    await prisma.analyticsEvent.create({
      data: {
        sessionId: generateSessionId(),
        eventType: 'login_failure',
        eventData: {
          loginMethod: 'credentials',
          failureReason: error.message
        },
        path: '/login'
      }
    })
    
    throw error
  }
}
```

### Admin Analytics Dashboard

**Dashboard Page:**
```typescript
// app/(protected)/admin/analytics/page.tsx
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/admin/analytics/dashboard'

export default async function AnalyticsPage() {
  const session = await auth()
  
  if (!session || session.user.role !== 'admin') {
    redirect('/docs')
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <AnalyticsDashboard />
    </div>
  )
}
```

**Dashboard Component:**
```typescript
// components/admin/analytics/dashboard.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricsCards } from './metrics-cards'
import { ActivityChart } from './activity-chart'
import { TopContentTable } from './top-content-table'
import { UserActivityTable } from './user-activity-table'
import { RealtimeEvents } from './realtime-events'

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 30), to: new Date() })
  const [userFilter, setUserFilter] = useState<string | null>(null)
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics-metrics', dateRange, userFilter],
    queryFn: () => fetchMetrics(dateRange, userFilter),
    refetchInterval: 30000 // Refresh every 30 seconds
  })
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Select value={userFilter} onChange={setUserFilter} placeholder="All Users">
            <option value="">All Users</option>
            <option value="authenticated">Authenticated</option>
            <option value="anonymous">Anonymous</option>
          </Select>
        </div>
      </Card>
      
      {/* Metrics Overview */}
      <MetricsCards metrics={metrics} />
      
      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <ActivityChart data={metrics?.timeline} />
          <div className="grid gap-6 md:grid-cols-2">
            <TopContentTable
              title="Top Pages"
              data={metrics?.topPages}
              type="page"
            />
            <TopContentTable
              title="Top Documents"
              data={metrics?.topDocuments}
              type="document"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <UserActivityTable dateRange={dateRange} />
        </TabsContent>
        
        <TabsContent value="content">
          <TopContentTable
            title="Content Performance"
            data={metrics?.contentPerformance}
            type="detailed"
          />
        </TabsContent>
        
        <TabsContent value="realtime">
          <RealtimeEvents />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Metrics API:**
```typescript
// app/api/admin/analytics/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const searchParams = req.nextUrl.searchParams
  const from = new Date(searchParams.get('from') || subDays(new Date(), 30))
  const to = new Date(searchParams.get('to') || new Date())
  const userFilter = searchParams.get('userFilter')
  
  // Get aggregated metrics
  const metrics = await getAnalyticsMetrics(from, to, userFilter)
  
  return NextResponse.json(metrics)
}

async function getAnalyticsMetrics(from: Date, to: Date, userFilter: string | null) {
  const where: any = {
    createdAt: { gte: from, lte: to }
  }
  
  if (userFilter === 'authenticated') {
    where.userId = { not: null }
  } else if (userFilter === 'anonymous') {
    where.userId = null
  }
  
  // Total metrics
  const [
    totalEvents,
    uniqueUsers,
    totalSessions,
    loginAttempts,
    documentReads,
    searches,
    topPages,
    topDocuments,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where }),
    prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: { ...where, userId: { not: null } },
      _count: true
    }),
    prisma.analyticsSession.count({
      where: {
        startedAt: { gte: from, lte: to },
        ...(userFilter === 'authenticated' && { userId: { not: null } }),
        ...(userFilter === 'anonymous' && { userId: null })
      }
    }),
    prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: {
        ...where,
        eventType: { in: ['login_success', 'login_failure'] }
      },
      _count: true
    }),
    prisma.analyticsEvent.count({
      where: { ...where, eventType: 'document_read' }
    }),
    prisma.analyticsEvent.count({
      where: { ...where, eventType: 'search' }
    }),
    // Top pages
    prisma.analyticsEvent.groupBy({
      by: ['path'],
      where: { ...where, eventType: 'page_view' },
      _count: true,
      orderBy: { _count: { path: 'desc' } },
      take: 10
    }),
    // Top documents
    prisma.analyticsEvent.groupBy({
      by: ['resourceId'],
      where: {
        ...where,
        eventType: 'document_read',
        resourceType: 'doc'
      },
      _count: true,
      _avg: { duration: true, scrollDepth: true },
      orderBy: { _count: { resourceId: 'desc' } },
      take: 10
    })
  ])
  
  // Timeline data (daily aggregation)
  const timeline = await prisma.$queryRaw`
    SELECT
      DATE(created_at) as date,
      COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
      COUNT(DISTINCT session_id) as sessions,
      COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as users
    FROM analytics_event
    WHERE created_at >= ${from} AND created_at <= ${to}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `
  
  return {
    totalEvents,
    uniqueUsers: uniqueUsers.length,
    totalSessions,
    loginSuccess: loginAttempts.find(l => l.eventType === 'login_success')?._count || 0,
    loginFailure: loginAttempts.find(l => l.eventType === 'login_failure')?._count || 0,
    documentReads,
    searches,
    topPages: topPages.map(p => ({ path: p.path, views: p._count })),
    topDocuments: topDocuments.map(d => ({
      resourceId: d.resourceId,
      views: d._count,
      avgDuration: d._avg.duration,
      avgScrollDepth: d._avg.scrollDepth
    })),
    timeline
  }
}
```

**User Activity Table Component:**
```typescript
// components/admin/analytics/user-activity-table.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function UserActivityTable({ dateRange }: { dateRange: { from: Date; to: Date } }) {
  const [search, setSearch] = useState('')
  
  const { data, isLoading } = useQuery({
    queryKey: ['user-activity', dateRange, search],
    queryFn: () => fetchUserActivity(dateRange, search)
  })
  
  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Sessions</TableHead>
            <TableHead>Page Views</TableHead>
            <TableHead>Documents Read</TableHead>
            <TableHead>Searches</TableHead>
            <TableHead>Last Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.users.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>{user.sessions}</TableCell>
              <TableCell>{user.pageViews}</TableCell>
              <TableCell>{user.documentsRead}</TableCell>
              <TableCell>{user.searches}</TableCell>
              <TableCell>
                <span className="text-sm">{formatDate(user.lastActivity)}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

**Real-time Events Component:**
```typescript
// components/admin/analytics/realtime-events.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function RealtimeEvents() {
  const [events, setEvents] = useState<any[]>([])
  
  useEffect(() => {
    // Poll for new events every 2 seconds
    const interval = setInterval(async () => {
      const response = await fetch('/api/admin/analytics/realtime')
      const data = await response.json()
      setEvents(data.events.slice(0, 50)) // Keep last 50 events
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold mb-4">Live Events (Last 2 minutes)</h3>
      {events.map(event => (
        <Card key={event.id} className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={getEventBadgeVariant(event.eventType)}>
                {formatEventType(event.eventType)}
              </Badge>
              <span className="ml-2 text-sm">{event.path}</span>
              {event.user && (
                <span className="ml-2 text-sm text-muted-foreground">
                  by {event.user.name}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(event.createdAt)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

### Data Retention & Cleanup

**Cleanup Job:**
```typescript
// lib/analytics/cleanup.ts
import { prisma } from '@/lib/db/prisma'

export async function cleanupOldAnalytics() {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  // Delete events older than 1 year
  await prisma.analyticsEvent.deleteMany({
    where: {
      createdAt: { lt: oneYearAgo }
    }
  })
  
  // Delete sessions older than 1 year
  await prisma.analyticsSession.deleteMany({
    where: {
      startedAt: { lt: oneYearAgo }
    }
  })
  
  console.log('Analytics cleanup completed')
}

// Run daily via cron job or Vercel Cron
export async function GET() {
  await cleanupOldAnalytics()
  return new Response('Cleanup complete', { status: 200 })
}
```

### Analytics Features Summary

✅ **Implemented:**
- Event tracking system with PostgreSQL storage
- Session management for authenticated and anonymous users
- Active reading time tracking (excludes idle/background tabs)
- Scroll depth tracking
- Real-time analytics updates (30-second polling)
- Admin-only analytics dashboard
- User activity filtering and search
- Content performance metrics
- Login success/failure tracking
- 1-year data retention with automated cleanup

✅ **Events Tracked:**
- Page views
- Login attempts (success/failure)
- Document reads with duration and scroll depth
- Search queries
- Feature request views/votes/comments
- API spec views
- Session start/end

✅ **Dashboard Features:**
- Metrics overview cards
- Timeline charts (daily aggregation)
- Top pages/documents tables
- User activity table with search
- Content performance analysis
- Real-time event feed
- Date range filtering
- User type filtering (authenticated/anonymous/all)

✅ **Privacy & Performance:**
- Admin-only access
- Anonymized visitor tracking via session IDs
- Indexed database queries for performance
- Background event tracking (no UI blocking)
- Throttled scroll events (1-second intervals)
- Automatic cleanup of old data (1-year retention)

---

## 🚀 Production Deployment

### Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- Domain name configured (optional but recommended)
- SSL certificates (if using Nginx profile)

### Quick Start Deployment

#### 1. Environment Configuration

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

#### 2. Update docker-compose.prod.yml

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

#### 3. Build and Start Services

```bash
# Build the production image
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 4. Initialize Database

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

#### 5. Verify Deployment

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

#### 6. Access Application

- Application: http://localhost:9980
- With Nginx (if using): http://localhost (port 80) or https://localhost (port 443)

### Database Management

#### Backup Database

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres nextdocs > backups/nextdocs_$(date +%Y%m%d_%H%M%S).sql
```

#### Restore Database

```bash
# Restore from backup
cat backups/nextdocs_YYYYMMDD_HHMMSS.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres nextdocs
```

#### Access Database CLI

```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres nextdocs
```

### Monitoring and Logs

#### View Application Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis
```

#### Check Resource Usage

```bash
docker stats
```

#### Check Health Status

```bash
# All services health check
docker-compose -f docker-compose.prod.yml ps

# Application health endpoint
curl http://localhost:9980/api/health
```

### Updates and Maintenance

#### Update Application

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

#### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart app
```

#### Stop Services

```bash
# Stop all services (keeps data)
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (DELETES ALL DATA)
docker-compose -f docker-compose.prod.yml down -v
```

### Security Checklist

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

### Production Architecture

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

---

## 🔧 Webhook Configuration

### Overview

NextDocs supports three methods for syncing comments from external systems:

1. **Webhooks** (Real-time) - Instant synchronization when comments are added
2. **On-Demand Sync** - Manual sync via button in the UI
3. **Background Polling** - Automatic sync every 30 minutes as fallback

### Environment Variables

Add these to your `.env.local` and `.env.production` files:

```bash
# GitHub Webhook Secret (for verifying webhook signatures)
GITHUB_WEBHOOK_SECRET="your-secret-here"

# Azure DevOps Webhook Secret (used as Basic Auth password)
AZURE_WEBHOOK_SECRET="your-secret-here"

# Comment Sync Interval (minutes, default: 30)
COMMENT_SYNC_INTERVAL_MINUTES="30"
```

Generate secure secrets with:
```bash
openssl rand -hex 32
```

### GitHub Webhook Setup

#### 1. Configure Webhook in GitHub Repository

1. Go to your repository **Settings** → **Webhooks** → **Add webhook**
2. Configure the webhook:
   - **Payload URL**: `https://yourdomain.com/api/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: Enter the value from `GITHUB_WEBHOOK_SECRET`
   - **SSL verification**: Enable SSL verification (recommended)
   - **Which events**: Select "Let me select individual events"
     - ✅ Issue comments
   - **Active**: ✅ Checked

#### 2. Test the Webhook

1. After creating the webhook, GitHub will send a `ping` event
2. Check the webhook delivery status in GitHub
3. Add a comment to a linked GitHub issue
4. Verify the comment appears in NextDocs

### Azure DevOps Webhook Setup

#### 1. Configure Service Hook in Azure DevOps

1. Go to **Project Settings** → **Service hooks**
2. Click **Create subscription** → **Web Hooks**
3. Configure the trigger:
   - **Event**: `Work item commented on`
   - **Filters**: (Optional) Filter by work item type or area path
4. Configure the action:
   - **URL**: `https://yourdomain.com/api/webhooks/azure-devops`
   - **HTTP headers**: Leave blank
   - **Basic authentication username**: `webhook` (can be any value)
   - **Basic authentication password**: Enter the value from `AZURE_WEBHOOK_SECRET`
   - **Resource details to send**: All
   - **Messages to send**: All
   - **Detailed messages to send**: All

#### 2. Test the Service Hook

1. After creating the subscription, click **Test** to send a test payload
2. Verify the test succeeds with a 200 OK response
3. Add a comment to a linked work item
4. Verify the comment appears in NextDocs

### Local Development with ngrok

When developing locally, external webhooks cannot reach `localhost`. Use ngrok to create a public URL:

#### 1. Install ngrok

```bash
# macOS
brew install ngrok

# Windows
choco install ngrok

# Or download from https://ngrok.com/download
```

#### 2. Start ngrok

```bash
# Expose your local NextDocs instance
ngrok http 9980
```

#### 3. Update Webhook URLs

Use the ngrok HTTPS URL in your webhook configurations:
- GitHub: `https://your-subdomain.ngrok.io/api/webhooks/github`
- Azure DevOps: `https://your-subdomain.ngrok.io/api/webhooks/azure-devops`

---

## 🧪 Testing Infrastructure

### Overview

NextDocs includes a comprehensive testing suite with **110+ automated tests** covering all major functionality.

### Test Organization

```
tests/
├── cli/                          # Jest Unit Tests (30+)
│   ├── database.test.ts         # Database integrity
│   ├── search.test.ts           # Search functionality
│   ├── auth.test.ts             # Authentication
│   ├── repository-sync.test.ts  # GitHub/Azure sync
│   └── content.test.ts          # Content management
│
├── playwright/                   # E2E Browser Tests (80+)
│   ├── global-setup.ts          # 🔐 Secure auth setup
│   ├── global-teardown.ts       # Cleanup
│   ├── fixtures.ts              # Test utilities
│   ├── auth.spec.ts             # Login/logout flows
│   ├── homepage.spec.ts         # Homepage & navigation
│   ├── documentation.spec.ts    # Doc viewing
│   ├── search.spec.ts           # Global search
│   ├── blog.spec.ts             # Blog posts
│   ├── api-specs.spec.ts        # API specifications
│   ├── features.spec.ts         # Feature requests
│   └── admin.spec.ts            # Admin panel
│
└── Documentation Files
    ├── README.md                # Complete guide
    ├── QUICK_START.md           # Quick reference
    ├── QUICK_START_SECURE.md    # 🔐 Security quick ref
    ├── AUTHENTICATION.md        # 🔐 Auth setup guide
    └── TEST_SUITE_SUMMARY.md    # Test overview
```

### Quick Test Commands

```bash
# All tests (CLI + E2E)
npm test

# Just E2E tests (you'll be prompted for login)
npm run test:e2e

# Watch browser while testing
npm run test:e2e:headed

# Interactive test UI (best for debugging)
npm run test:e2e:ui

# Just CLI/unit tests (no auth needed)
npm run test:cli

# View HTML report
npm run test:report

# Generate markdown report
npm run test:generate-report
```

### Security-First Credential Management 🔐

**Interactive Credential Prompting**
- ✅ Runtime prompting for credentials (nothing stored in files)
- ✅ Press Enter for safe defaults (admin@nextdocs.local / admin)
- ✅ Automatic CI/CD detection (uses environment variables)
- ✅ Session-only storage (cookies/tokens, not passwords)

**First Time? Start Here!**

```bash
# 1. Install dependencies
npm install
npx playwright install --with-deps

# 2. Make sure app is running
docker-compose -f docker-compose.prod.yml up -d

# 3. Run tests (press Enter twice when prompted)
npm run test:e2e
```

**When prompted for credentials, just press Enter twice!**
- Email: `admin@nextdocs.local` (default)
- Password: `admin` (default)

### Test Coverage

#### CLI/Unit Tests (Jest) - 30+ Tests

✅ **Database Tests**
- Connection validation
- Schema integrity
- Table structure
- Foreign key relationships

✅ **Search Tests**
- Full-text search
- Vector search
- Result ranking

✅ **Authentication Tests**
- Password hashing
- User roles
- Session management

✅ **Repository Sync Tests**
- GitHub integration
- Azure DevOps integration
- File change detection

✅ **Content Tests**
- Blog CRUD operations
- API spec validation
- Feature request management

#### E2E Browser Tests (Playwright) - 80+ Tests

✅ **Multi-Browser Support**
- Chrome, Firefox, Safari
- Mobile (iPhone, Pixel)

✅ **Features Tested**
- Authentication flows
- Homepage & navigation
- Documentation viewing
- Global search
- Blog functionality
- API specifications
- Feature requests
- Admin panel

### Authentication Flow

```
┌──────────────┐
│ Test Starts  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Is CI Environment?                  │
│ (Check process.env.CI)              │
└──────┬────────────────┬─────────────┘
       │                │
    YES│                │NO
       │                │
       ▼                ▼
┌──────────────┐  ┌────────────────────────┐
│ Use Env Vars │  │ Prompt for Credentials │
│              │  │                        │
│ $TEST_USER   │  │ Email: ___________     │
│ $TEST_PASS   │  │ Password: ________     │
└──────┬───────┘  └────────┬───────────────┘
       │                   │
       │                   │(Press Enter for defaults)
       │                   │
       └─────────┬─────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Authenticate   │
        │ POST /login    │
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Save Session ONLY      │
        │ tests/.auth/user.json  │
        │ ❌ NO PASSWORDS        │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Run All Tests  │
        │ 110+ tests     │
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ Cleanup Session│
        │ Delete .auth/  │
        └────────────────┘
```

### Security Features

- ❌ No passwords in `.env` files
- ❌ No passwords in config files
- ❌ No passwords in codebase
- ❌ No risk of accidental commits
- ✅ Only authentication sessions cached
- ✅ Automatic cleanup after tests
- ✅ Git-ignored session files

---

This consolidated directive represents the complete state of the NextDocs platform implementation.
