# NextDocs Project Structure

Clean, organized directory structure for the NextDocs application.

## 📁 Root Directory Structure

```
├── 📄 Core Config Files
│   ├── package.json              # Dependencies and scripts
│   ├── package-lock.json         # Locked dependency versions  
│   ├── tsconfig.json            # TypeScript configuration
│   ├── next.config.ts           # Next.js configuration
│   ├── tailwind.config.ts       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── components.json          # shadcn/ui configuration
│
├── 🐳 Docker & Deployment
│   ├── docker-compose.prod.yml  # Production Docker configuration
│   ├── docker-compose.dev.yml   # Development Docker configuration  
│   ├── Dockerfile               # Production container build
│   ├── Dockerfile.dev           # Development container build
│   └── .dockerignore           # Docker ignore patterns
│
├── ⚙️ Environment & Git
│   ├── .env                     # Environment variables (local)
│   ├── .gitignore              # Git ignore patterns
│   └── .hintrc                 # Web development hints config
│
└── 📂 Project Directories
    ├── src/                    # Application source code
    ├── scripts/                # Organized operational scripts
    ├── docs/                   # Comprehensive documentation  
    ├── prisma/                 # Database schema and migrations
    ├── public/                 # Static assets
    └── backups/               # Database backups
```

## 📚 Documentation (`docs/`)

Comprehensive project documentation organized by topic:

```
docs/
├── api/                       # API documentation and specs
│   ├── api-keys-swagger.yaml
│   ├── api-keys.md
│   ├── generated-swagger.json
│   └── API_AUTHENTICATION.md
├── deployment/                # Docker and deployment guides
│   ├── DOCKER.md
│   ├── DOCKER-FILES.md
│   └── DOCKER-WINDOWS.md
├── features/                  # Feature documentation
│   ├── ADMIN_FEATURES.md
│   └── IMAGE-UPLOAD.md
├── guide/                     # User guides
└── setup/                     # Setup instructions
    └── QUICKSTART.md
```

## 🔧 Scripts (`scripts/`)

Organized operational scripts by category:

```
scripts/
├── content/          # Content generation (4 scripts)
├── cron-tasks/       # Scheduled automation (5 scripts) 
├── database/         # Database operations (2 scripts)
├── deployment/       # Docker & production (4 scripts)
├── development/      # Dev tools & testing (3 scripts)
└── maintenance/      # Manual admin tasks (2 scripts)
```

## 🗄️ Database (`prisma/`)

Database schema, migrations, and utilities:

```
prisma/
├── schema.prisma          # Main database schema
├── migrations/            # Database version history
└── [utility scripts]     # Database management tools
```

## 🎯 Application (`src/`)

Clean application architecture:

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Shared utilities and services
└── types/           # TypeScript type definitions
```

## 🧹 Cleanup Summary

**Removed Orphaned Files:**
- ✅ `run-*.bat`, `run-*.sh` scripts (replaced by Docker Compose)
- ✅ `tsconfig.tsbuildinfo` (build artifact)
- ✅ `resources/` directory (10 unused image files)
- ✅ `api-specs/` directory (consolidated into docs)
- ✅ Redundant documentation files (organized into docs structure)

**Organized Documentation:**
- ✅ Moved all .md files to appropriate docs/ subdirectories
- ✅ Created logical documentation structure
- ✅ Consolidated API specifications

**Scripts Reorganization:**
- ✅ 20 scripts organized into 6 logical categories
- ✅ Clear naming convention (action-subject.extension)
- ✅ Comprehensive documentation with usage examples

## 🏗️ Development Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Docker Development  
docker-compose -f docker-compose.dev.yml up -d

# Docker Production
docker-compose -f docker-compose.prod.yml up -d

# Database
npm run db:migrate            # Run database migrations
npm run db:seed               # Seed database with initial data

# Scripts (examples)
./scripts/maintenance/test-cron-tasks.sh           # Test backup system
./scripts/database/restore-database.sh <file>     # Restore database
node scripts/maintenance/clear-sessions.js        # Clear user sessions
```

## 📦 Key Dependencies

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM  
- **Authentication**: NextAuth.js with Azure AD
- **Styling**: Tailwind CSS + shadcn/ui
- **Container**: Docker + Docker Compose
- **Search**: PostgreSQL full-text search with vectors

---

*This structure promotes maintainability, clarity, and scalability for the NextDocs project.*