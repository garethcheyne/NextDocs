# NextDocs Platform Governance Document

**Document Version:** 1.0
**Date:** February 2026
**Classification:** Internal - Executive Review
**Prepared For:** Executive Leadership (CTO, CIO, Head of Cyber Security, Head of Development)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Problem](#business-problem)
3. [Solution Overview](#solution-overview)
4. [Build vs Buy Analysis](#build-vs-buy-analysis)
5. [Security & Access Control](#security--access-control)
6. [Technology Stack](#technology-stack)
7. [Architecture & Data Flow](#architecture--data-flow)
8. [Internal Penetration Testing](#internal-penetration-testing)
9. [Compliance & Risk Assessment](#compliance--risk-assessment)
10. [Operational Considerations](#operational-considerations)
11. [Recommendation](#recommendation)

---

## Executive Summary

**NextDocs** is an enterprise documentation platform developed internally by the Harvey Norman Commercial Apps Team. It consolidates technical documentation from Azure DevOps repositories, provides a feature request management system with stakeholder voting, and delivers comprehensive administrative controls. The platform is built as a **Progressive Web Application (PWA)** enabling installation on desktop and mobile devices with push notification support.

### Key Benefits

- **Single source of truth** for all technical documentation across 28+ repositories
- **Reduced context switching** by eliminating the need to navigate multiple Azure DevOps projects
- **Feature lifecycle management** connecting business stakeholders directly to Azure DevOps Work Items
- **Deep Azure DevOps integration** with bi-directional sync for work items and comments
- **Progressive Web App** with push notifications for real-time updates on mobile and desktop
- **Enterprise-grade security** leveraging existing Azure AD SSO infrastructure
- **Full development control** - owned and maintained by Commercial Apps Team with complete flexibility to extend

### Decision Required

Executive approval is sought to continue development and deploy NextDocs to production for the Commercial Apps Team.

---

## Business Problem

### Current Challenges

| Challenge | Impact |
|-----------|--------|
| **Documentation Fragmentation** | Technical documentation scattered across multiple Azure DevOps projects, SharePoint, and Confluence |
| **Feature Request Chaos** | Feature requests arrive via email, Teams, verbal communication, and tickets with no central tracking |
| **No Stakeholder Visibility** | Business users cannot see roadmap, vote on priorities, or track feature progress |
| **Manual Sync Burden** | Developers manually copy documentation between systems, leading to outdated content |
| **Access Control Gaps** | Sensitive documentation difficult to restrict to appropriate teams |
| **Search Inefficiency** | Full-text search across all documentation sources not possible |

### Business Impact

- **Developer time wasted**: Estimated 2-4 hours per week per developer searching for documentation
- **Duplicate feature requests**: Same features requested through multiple channels
- **Stakeholder frustration**: Business users lack visibility into development priorities
- **Stale documentation**: Content becomes outdated due to manual sync requirements

---

## Solution Overview

NextDocs addresses these challenges through three core capabilities:

### 1. Documentation Aggregation

- Automatically syncs Markdown documentation from Azure DevOps repositories
- Supports webhooks for real-time updates on content changes
- Preserves images, diagrams, and embedded content
- Provides full-text search across all content using PostgreSQL tsvector
- Category and navigation metadata synced from repository structure

### 2. Feature Request Management

- Web-based submission portal for all stakeholders
- Voting system (upvote/downvote) for priority indication
- Status workflow: `proposal` → `approved` → `in-progress` → `completed`
- **Bi-directional sync with Azure DevOps Work Items** - creates work items, syncs comments, tracks status
- Area path mapping to route features to correct DevOps teams
- Email notifications for status changes and comments
- Admin tools for merging duplicates, pinning, archiving, and internal notes

### 3. Progressive Web Application (PWA)

- **Installable** on Windows, macOS, iOS, and Android devices
- **Push notifications** for feature status changes, comments, and updates
- **Offline capability** for previously viewed documentation
- Native app-like experience without app store deployment
- Per-user notification preferences (email, push, or both)

### 4. Administrative Controls

- Role-based access control (User, Editor, Admin)
- Document-level and section-level content restrictions
- Azure DevOps integration management per feature category
- Real-time analytics dashboard
- Audit logging of all administrative actions

---

## Build vs Buy Analysis

### Evaluated Alternatives

| Solution | Type | Monthly Cost (Est.) | Primary Limitation |
|----------|------|---------------------|-------------------|
| **Confluence** | Commercial | $5,500+ (50 users) | No Azure DevOps integration, separate feature voting tool required |
| **Azure DevOps Wiki** | Included | N/A | No cross-project aggregation, no feature voting, limited search |
| **Notion** | Commercial | $1,500+ | No repository sync, no Azure DevOps integration |
| **ReadMe** | Commercial | $3,000+ | API documentation focus, no feature requests, no DevOps sync |
| **Productboard** | Commercial | $4,000+ | Feature management only, no documentation aggregation |
| **Canny** | Commercial | $2,400+ | Feature voting only, no Azure DevOps work item sync |
| **Backstage** | Open Source | Hosting costs | Steep learning curve, Kubernetes dependency, no DevOps integration |
| **Docusaurus** | Open Source | Hosting costs | Static site only, no feature management, no DevOps sync |

### Why Custom Development Was Chosen

1. **No Azure DevOps-Native Solution Exists**
   No commercial or open-source product combines documentation aggregation from Azure DevOps with feature request management and work item sync. Using multiple tools would require:
   - 2-3 separate subscriptions
   - Custom Azure DevOps integration development anyway
   - User training on multiple platforms

2. **Azure DevOps Integration is Non-Negotiable**
   Our entire development workflow is built on Azure DevOps:
   - All source code in Azure DevOps Repos
   - Work item tracking in Azure Boards
   - Build and release pipelines
   - Sprint planning and backlog management

   **No evaluated solution provided native two-way sync with Azure DevOps Work Items.**

3. **Role-Based Content Restrictions**
   Our documentation includes content restricted to specific AD security groups (e.g., `SGRP_CRM_*`, `SGRP_POS_*`). Commercial tools lack:
   - Document-level role restrictions
   - Section-level variant filtering
   - Wildcard AD group matching

4. **Feature-to-Work-Item Lifecycle**
   Business stakeholders need to submit features that automatically become Azure DevOps Work Items with:
   - Automatic work item creation in the correct Area Path
   - Bi-directional comment syncing
   - Status synchronisation (DevOps state changes reflect in NextDocs)
   - Story point and sprint tracking visibility

   This workflow is unique to our organisation and not supported by any commercial tool.

5. **Full Development Control**
   The Commercial Apps Team owns this codebase entirely. This provides:
   - **Complete flexibility** to add features as business needs evolve
   - **No vendor lock-in** or feature request backlogs with external vendors
   - **Immediate response** to changing requirements
   - **Custom integrations** specific to Harvey Norman systems
   - **Direct alignment** with team workflows and preferences

6. **Total Cost of Ownership**
   | Approach | Year 1 Cost | Year 3 Cost |
   |----------|-------------|-------------|
   | Multiple SaaS tools + custom integration | ~$120,000 | ~$360,000 |
   | Custom NextDocs platform | Internal dev time + ~$1,200 hosting | Internal dev time + ~$3,600 hosting |

   **NextDocs Cost Breakdown:**
   - **Development**: Internal team time (already allocated within existing agile sprints)
   - **UAT Hosting**: Azure Container Apps (~$50/month)
   - **Production Hosting**: Azure Container Apps (~$50/month)
   - **No additional licensing fees**
   - **No per-user costs**
   - **No feature tier limitations**

7. **Data Sovereignty**
   All documentation and feature data remains within our Azure tenant. No third-party SaaS has access to potentially sensitive technical documentation or business feature requests.

---

## Security & Access Control

### Authentication Architecture

NextDocs implements a dual authentication model:

| Method | Use Case | Implementation |
|--------|----------|----------------|
| **Azure AD SSO** | Primary authentication for all staff | Microsoft Entra ID via NextAuth v5 |
| **Local Credentials** | Service accounts, external contractors | bcrypt hashing (12 rounds) |

### Azure AD Integration

- **OAuth 2.0 / OpenID Connect** protocol
- **Group membership sync** on each login
- **Wildcard group matching** (e.g., `SGRP_CRM_*` matches `SGRP_CRM_DEVELOPERS`, `SGRP_CRM_ADMINS`)
- **Tenant restriction** ensures only our Azure AD tenant can authenticate

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **User** | View documentation, submit features, vote, comment |
| **Editor** | User permissions + edit documentation metadata |
| **Admin** | Full access: manage users, repositories, integrations, analytics |

### Document-Level Security

```yaml
# Example frontmatter restriction
---
title: CRM Internal Architecture
restriction: admin
restrictedRoles: ["SGRP_CRM_*"]
---
```

Documents can be restricted by:
- Database role (user, editor, admin)
- AD security group membership
- Wildcard patterns

### Content Variant Filtering

Sensitive sections within documents can be restricted:

```markdown
!variant! # SGRP_CRM_DEVELOPERS
This section only visible to CRM developers.
!endvariant!
```

Users without the required group see the document with restricted sections removed.

### Credential Security

| Secret Type | Protection Method |
|-------------|-------------------|
| User passwords | bcrypt (12 rounds) |
| Repository PATs | AES-256-GCM encryption at rest |
| OAuth tokens | AES-256-GCM encryption at rest |
| Session tokens | Signed with NEXTAUTH_SECRET (256-bit) |
| API keys | SHA-256 hashed, only preview shown |

### API Security

- All API routes require authentication
- API keys support read/write permission scoping
- Mandatory expiration dates on all API keys
- Rate limiting on authentication endpoints

---

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Framework** | Next.js | 16 | Industry-standard React framework, App Router architecture |
| **Language** | TypeScript | 5.7+ | Type safety, improved maintainability |
| **Database** | PostgreSQL | 15+ | Enterprise-grade, full-text search support |
| **Cache** | Redis | 7+ | Session management, search caching |
| **ORM** | Prisma | 5+ | Type-safe database access, migration management |
| **Authentication** | NextAuth v5 | 5.0 | Standard OAuth library, Azure AD support |

### UI Components

| Library | Purpose |
|---------|---------|
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **Radix UI** | Headless accessible primitives |
| **Lucide React** | Icon library |

### Content Processing

| Library | Purpose |
|---------|---------|
| **next-mdx-remote** | MDX/Markdown rendering |
| **react-markdown** | Markdown processing |
| **Mermaid** | Diagram rendering |
| **Swagger UI / ReDoc** | API documentation |

### Infrastructure

| Component | Technology |
|-----------|------------|
| **Hosting** | Azure Container Apps |
| **Container Runtime** | Docker |
| **Orchestration** | Docker Compose (dev) / Azure Container Apps (prod) |
| **Email** | Exchange Web Services (EWS) |
| **Push Notifications** | Web Push API (VAPID) |

### PWA Capabilities

| Feature | Implementation |
|---------|----------------|
| **Installable** | Web App Manifest with icons and splash screens |
| **Push Notifications** | Service Worker + Web Push API (VAPID) |
| **Offline Caching** | Service Worker caches static assets and previously viewed pages |

### Dependency Security

- All dependencies sourced from npm registry
- Regular `npm audit` checks
- Dependabot alerts enabled
- No known critical vulnerabilities

---

## Architecture & Data Flow

### System Architecture

```
                                   ┌─────────────────┐
                                   │   Azure AD      │
                                   │   (Auth/SSO)    │
                                   └────────┬────────┘
                                            │
┌──────────────┐                       ┌────┴──────────┐    ┌──────────────┐
│ Azure DevOps │                       │   NextDocs    │────│  PostgreSQL  │
│   Repos      │───────────────────────│   App Server  │    │   Database   │
│   (Docs)     │    Webhooks + API     │   (Next.js)   │    └──────────────┘
└──────────────┘                       └───────────────┘           │
                                              │              ┌──────┴───────┐
┌──────────────┐                              │              │    Redis     │
│ Azure DevOps │                              │              │   (Cache)    │
│   Boards     │──────────────────────────────┘              └──────────────┘
│ (Work Items) │    Bi-directional Sync       │
└──────────────┘                              │
                                   ┌──────────┴──────────┐
                                   │   Exchange Server   │
                                   │   (Email via EWS)   │
                                   └─────────────────────┘
                                              │
                                   ┌──────────┴──────────┐
                                   │   Push Service      │
                                   │   (Web Push API)    │
                                   └─────────────────────┘
```

### Data Flow

1. **Authentication Flow**
   - User accesses NextDocs → Redirected to Azure AD
   - Azure AD authenticates → Returns OAuth token + group memberships
   - NextDocs creates session → Stores groups in database for restriction checks

2. **Documentation Sync Flow**
   - Azure DevOps webhook fires on commit → NextDocs receives payload
   - Validates webhook signature → Fetches changed files via DevOps REST API
   - Parses frontmatter → Updates PostgreSQL with content + search vectors
   - Syncs images to local storage

3. **Feature Request Flow**
   - User submits feature → Stored in PostgreSQL
   - Admin approves → Creates linked Work Item in Azure DevOps Boards
   - Comments sync bi-directionally between NextDocs and DevOps
   - Status changes in DevOps reflected automatically in NextDocs
   - Story points and sprint assignments visible to stakeholders

4. **Push Notification Flow**
   - User subscribes via PWA prompt → Subscription stored in database
   - Event occurs (status change, comment, etc.) → Push service triggered
   - Web Push API delivers notification to all subscribed devices

### Database Schema

- **28 tables** covering users, content, features, analytics
- **Full-text search** via PostgreSQL tsvector
- **Cascade deletes** for referential integrity
- **Indexed columns** for query performance

---

## Internal Penetration Testing

Prior to formal Cyber Security review, the Commercial Apps Team conducted internal penetration testing to identify and remediate vulnerabilities. Below is a summary of findings and mitigations implemented.

### Testing Methodology

- **OWASP Top 10** assessment against all API endpoints
- **Authentication bypass** attempts on all protected routes
- **Brute force** simulation against login endpoints
- **Directory traversal** attempts on file serving endpoints
- **Session hijacking** attempts via token manipulation
- **Injection testing** (SQL, NoSQL, Command, XSS)

### Findings & Remediations

| Finding | Severity | Status | Remediation |
|---------|----------|--------|-------------|
| **Brute Force Login** | High | ✅ Fixed | Implemented Redis-backed rate limiting: 5 attempts per minute, 5-minute lockout after exceeded |
| **Direct Image Access** | Medium | ✅ Fixed | Deprecated `/api/images/[filename]` endpoint. All images now served via `/api/images/secure` requiring authentication |
| **Directory Traversal** | High | ✅ Fixed | Path validation rejects `..`, `/`, `\` characters in filename parameters |
| **Missing Security Headers** | Medium | ✅ Fixed | Comprehensive security headers added (see below) |
| **Session Token Exposure** | Low | ✅ Fixed | Tokens signed with 256-bit secret, HTTP-only cookies |
| **CSRF on Auth** | Medium | ✅ Fixed | NextAuth built-in CSRF token validation on authentication endpoints |

### Rate Limiting Implementation

Authentication endpoints are protected against brute force attacks:

| Endpoint Type | Max Requests | Window | Lockout Duration |
|---------------|--------------|--------|------------------|
| Login (credentials) | 5 | 60 seconds | 5 minutes |
| Password Reset | 3 | 1 hour | 1 hour |
| General API | 100 | 60 seconds | None (429 returned) |

### Secure Image Serving

**All uploaded images require authentication to access.** Direct file access is blocked:

- `/api/images/[filename]` - Returns 403 Forbidden with deprecation notice
- `/api/images/secure?filename=...&contentType=...&contentId=...` - Validates:
  1. User is authenticated
  2. Filename contains no path traversal characters
  3. Image belongs to the specified content (feature, blog, release, etc.)

### Security Headers

All responses include the following security headers:

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | Restricts script, style, image, and connect sources |

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https://graph.microsoft.com;
connect-src 'self' https://graph.microsoft.com https://dev.azure.com;
frame-ancestors 'self';
form-action 'self';
object-src 'none';
upgrade-insecure-requests;
```

### SQL Injection Prevention

All database queries use Prisma ORM with parameterised queries. No raw SQL is executed with user input. Example:

```typescript
// Safe - Prisma parameterised query
const user = await prisma.user.findUnique({
  where: { email: userInput }  // Automatically escaped
})
```

### Pending Cyber Security Review

This internal testing serves as preliminary validation. Formal review by the Cyber Security team is requested to:

1. Validate rate limiting effectiveness
2. Review Content Security Policy scope
3. Assess Azure AD integration security
4. Penetration test from external perspective
5. Review encryption key management

---

## Compliance & Risk Assessment

### Security Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Credential exposure** | Low | High | Encrypted at rest, no plaintext storage |
| **Unauthorised access** | Low | High | Azure AD SSO, role-based access |
| **Data breach** | Low | High | Internal hosting, no external SaaS |
| **XSS/Injection** | Low | Medium | Input sanitisation, parameterised queries |
| **Session hijacking** | Low | Medium | Signed session tokens, HTTPS only |

### Compliance Alignment

| Requirement | Status |
|-------------|--------|
| **Authentication** | Azure AD SSO (existing corporate standard) |
| **Authorisation** | Role-based + AD group integration |
| **Audit Trail** | All admin actions logged |
| **Data Residency** | On-premises/Azure tenant (no third-party) |
| **Password Policy** | bcrypt (12 rounds), local accounts only |
| **Session Management** | Configurable expiration, secure tokens |

### Operational Risks

| Risk | Mitigation |
|------|------------|
| **Knowledge concentration** | TypeScript ensures maintainability, comprehensive inline documentation, standard patterns |
| **Database failure** | Azure managed PostgreSQL with automated backups |
| **Application downtime** | Azure Container Apps provides auto-restart, health checks, and scaling |
| **Vendor lock-in** | None - standard open-source stack, portable to any container host |

---

## Operational Considerations

### Hosting (Azure Container Apps)

| Environment | Configuration | Est. Monthly Cost |
|-------------|---------------|-------------------|
| **UAT** | 0.5 vCPU, 1GB RAM, auto-scale 0-2 | ~$50 |
| **Production** | 0.5 vCPU, 1GB RAM, auto-scale 0-3 | ~$50 |
| **Database** | Azure Database for PostgreSQL (Basic) | Existing infrastructure |
| **Redis** | Azure Cache for Redis (Basic) | Existing infrastructure |

| Network Requirements |
|---------------------|
| Azure AD (authentication) |
| Azure DevOps API (documentation sync, work items) |
| Exchange Server (email notifications) |
| Web Push endpoints (push notifications) |

### Maintenance Tasks

| Task | Frequency |
|------|-----------|
| Database backups | Daily (automated) |
| Dependency updates | Monthly |
| Security patches | As released |
| Log rotation | Weekly |

### Monitoring

- Health check endpoint: `/api/health`
- Real-time analytics dashboard
- Email queue monitoring
- Sync log tracking

---

## Recommendation

### Summary

NextDocs addresses a genuine business need that cannot be met by any single commercial product. The custom solution:

- **Deep Azure DevOps integration** - documentation sync, work item creation, bi-directional comments
- **Leverages corporate Azure AD** for authentication with AD group-based restrictions
- **Progressive Web App** with push notifications for real-time engagement
- **Owned by Commercial Apps Team** - complete flexibility to develop in any direction
- **Minimal ongoing costs** - only Azure Container hosting (~$100/month total)
- **Data sovereignty** - all data remains within our Azure tenant

### Technical Assessment

The application follows modern development practices:
- TypeScript for type safety and maintainability
- Industry-standard authentication (NextAuth + Azure AD)
- Secure credential storage (bcrypt, AES-256-GCM)
- Containerised deployment (Docker/Azure Container Apps)
- Comprehensive test coverage (Jest + Playwright)
- Progressive Web App with push notification support

### Team Ownership

The Commercial Apps Team has **full control** over this codebase:
- **No vendor dependencies** - all features developed internally
- **Agile flexibility** - new features can be added within normal sprint cycles
- **Direct business alignment** - requirements flow directly to implementation
- **Extensible architecture** - designed to accommodate future integrations
- **No feature limitations** - unlike SaaS tiers, all capabilities are available

### Approval Requested

| Item | Status |
|------|--------|
| Production deployment | Pending approval |
| User rollout (Commercial Apps Team) | Pending approval |
| Ongoing maintenance allocation | To be determined |

---

## Appendix

### A. Technology Versions

```
Next.js: 16.x
React: 19.x
TypeScript: 5.7+
PostgreSQL: 15+
Redis: 7+
Prisma: 5+
NextAuth: 5.x
Node.js: 20+ LTS
```

### B. Database Table Summary

| Category | Tables |
|----------|--------|
| User & Auth | User, Account, Session, VerificationToken, UserGroup, APIKey |
| Content | Document, BlogPost, Author, CategoryMetadata |
| Repository | Repository, SyncLog, DocumentChange, RepositoryImage |
| Features | FeatureRequest, FeatureVote, FeatureComment, FeatureFollower, FeatureCategory, FeatureStatusHistory, FeatureInternalNote, Epic, Tag, CommentSync, FeatureMerge |
| Notifications | EmailQueue, UserNotificationSettings, ReleaseNotificationLog |
| Analytics | AnalyticsEvent, AnalyticsSession, AnalyticsDailySummary, PageViewer |
| Organisation | Team, UserTeamMembership, Release |
| Other | APISpec, WebhookEvent, SSOProvider, ContentVote, ContentFollow |

### C. API Endpoint Count

- **Total Endpoints**: 60+
- **Authentication**: 1 (NextAuth catch-all)
- **Features**: 15+ (CRUD, voting, comments, admin)
- **Repositories**: 10+ (CRUD, sync, test)
- **Analytics**: 4 (tracking, metrics, events, realtime)
- **Webhooks**: Azure DevOps (repository and work item events)
- **Other**: 15+ (search, upload, health, specs)

---

**Document Prepared By:** Commercial Apps Development Team
**Review Required By:** CTO, CIO, Head of Cyber Security, Head of Development

*This document is intended for internal executive review only.*
