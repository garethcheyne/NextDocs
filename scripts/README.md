# NextDocs Scripts Directory

This directory contains all operational, development, and maintenance scripts for the NextDocs application, organized by function.

## 📁 Directory Structure

```
scripts/
├── content/           # Content generation and data management
├── cron-tasks/        # Scheduled tasks (backups, maintenance)  
├── database/          # Database operations
├── deployment/        # Docker and production deployment
├── development/       # Development and testing tools
├── maintenance/       # Manual maintenance and admin tasks
└── README.md         # This file
```

---

## 🗂️ **Content Management** (`content/`)

### `generate-api-docs.js`
**Purpose**: Generate OpenAPI/Swagger documentation for the API  
**Usage**: `node scripts/content/generate-api-docs.js`  
**When**: Run after API changes to update documentation  
**Output**: Updates API documentation files  

### `generate-favicons.js`  
**Purpose**: Generate favicon files in multiple formats and sizes  
**Usage**: `node scripts/content/generate-favicons.js`  
**When**: When updating the site favicon/branding  
**Output**: Creates favicon files in `public/` directory

### `seed-production-data.js`
**Purpose**: Seed production database with initial data (categories, etc.)  
**Usage**: `node scripts/content/seed-production-data.js`  
**When**: Initial deployment or data reset  
**Requirements**: Database connection configured

### `setup-search-indexes.ts` 
**Purpose**: Initialize search vectors and database indexes for full-text search  
**Usage**: `npx tsx scripts/content/setup-search-indexes.ts`  
**When**: After database migrations or search system updates  
**Requirements**: Database with vector extensions

---

## ⏰ **Scheduled Tasks** (`cron-tasks/`)

### `backup-cron.sh`
**Purpose**: Automated hourly database backups with smart retention  
**Usage**: Runs automatically in `cron-tasks` Docker container  
**Schedule**: Every hour  
**Features**: 
- Hourly backups (24 hour retention)
- Daily backup consolidation 
- Compression and cleanup

### `session-cleanup.sh`
**Purpose**: Wrapper for session cleanup task  
**Usage**: Runs automatically in `cron-tasks` Docker container  
**Schedule**: Daily at 3 AM  
**Function**: Calls `maintenance/clear-sessions.js`

### `repo-sync.sh` 🚧
**Purpose**: Synchronize repository content and metadata  
**Status**: Available but not scheduled  
**Usage**: Can be added to cron-tasks service schedule

### `search-refresh.sh` 🚧  
**Purpose**: Refresh search indexes and vectors  
**Status**: Available but not scheduled  
**Usage**: Can be added to cron-tasks service schedule

### `run-tasks.sh`
**Purpose**: Generic task coordinator with conditional scheduling  
**Usage**: Can orchestrate multiple tasks based on time/conditions

---

## 🗄️ **Database Operations** (`database/`)

### `setup-database.sh`
**Purpose**: Initialize PostgreSQL database for NextDocs  
**Usage**: `./scripts/database/setup-database.sh`  
**When**: First-time database setup  
**Function**: Creates database, users, extensions, initial schema

### `restore-database.sh`
**Purpose**: Restore database from backup file  
**Usage**: `./scripts/database/restore-database.sh <backup-file>`  
**When**: Database recovery or migration  
**Features**: 
- Lists available backups if no file specified
- Validates backup file before restore
- Supports compressed (.gz) backups

---

## 🚀 **Deployment** (`deployment/`)

### `setup-docker.sh`
**Purpose**: Interactive wizard for Docker environment setup  
**Usage**: `./scripts/deployment/setup-docker.sh`  
**When**: Initial production deployment  
**Features**:
- Environment variable configuration
- SSL certificate setup  
- Database initialization
- Docker Compose orchestration

### `validate-docker.sh`
**Purpose**: Validate Docker configuration and environment  
**Usage**: `./scripts/deployment/validate-docker.sh`  
**When**: Before deployment or troubleshooting  
**Checks**:
- Required files and configurations
- Environment variables
- Docker services health
- SSL certificates

### `build-docker-fast.sh`
**Purpose**: Fast Docker build using local pre-built assets  
**Usage**: `./scripts/deployment/build-docker-fast.sh`  
**When**: Development builds or rapid deployment  
**Advantage**: Skips npm install in Docker for faster builds

### `docker-entrypoint.sh`
**Purpose**: Docker container initialization script  
**Usage**: Automatic (called by Docker containers)  
**Function**: Container-specific startup procedures

---

## 🧪 **Development Tools** (`development/`)

### `test-search.ts`
**Purpose**: Test and validate search functionality  
**Usage**: `npx tsx scripts/development/test-search.ts`  
**When**: After search system changes  
**Tests**: Content search, suggestions, filtering, performance

### `search-document.ts` 
**Purpose**: Find and display specific documents by criteria  
**Usage**: `npx tsx scripts/development/search-document.ts [criteria]`  
**When**: Development debugging or content verification  
**Function**: Locate documents for inspection

### `validate-documents.ts`
**Purpose**: Validate document structure and content integrity  
**Usage**: `npx tsx scripts/development/validate-documents.ts`  
**When**: Content quality assurance  
**Checks**: Schema compliance, required fields, relationships

---

## 🔧 **Maintenance Tasks** (`maintenance/`)

### `clear-sessions.js`
**Purpose**: Remove all user sessions (force re-login)  
**Usage**: `node scripts/maintenance/clear-sessions.js`  
**When**: Security incidents, major updates, or manual cleanup  
**Effect**: All users must re-authenticate  
**Logging**: Creates audit trail of session clearing

### `test-cron-tasks.sh`
**Purpose**: Test and validate the cron-tasks service  
**Usage**: `./scripts/maintenance/test-cron-tasks.sh`  
**When**: After cron-tasks configuration changes  
**Tests**:
- Container status and logs
- Backup functionality  
- Available tools (pg_dump, node, npx)
- Manual task execution

---

## 🎯 **Quick Reference**

### Most Common Operations
```bash
# Test backup system
./scripts/maintenance/test-cron-tasks.sh

# Restore database
./scripts/database/restore-database.sh backup-file.sql.gz

# Clear all sessions (force re-login)
node scripts/maintenance/clear-sessions.js

# Validate deployment
./scripts/deployment/validate-docker.sh

# Test search functionality  
npx tsx scripts/development/test-search.ts
```

### Docker Service Integration
- **cron-tasks**: Uses `cron-tasks/backup-cron.sh` and calls `maintenance/clear-sessions.js`
- **app**: Uses all content generation scripts as needed
- **database**: Initialized with `database/setup-database.sh`

### Environment Requirements
- **Node.js**: Required for `.js` and `.ts` scripts
- **PostgreSQL Client**: Required for database operations  
- **Docker**: Required for container-based operations
- **Environment Variables**: Database connection, API keys, etc.

---

## 📝 Adding New Scripts

1. **Choose the right category** based on script purpose
2. **Use descriptive names**: `action-subject.extension` format
3. **Add executable permissions**: `chmod +x script-name.sh` for shell scripts
4. **Update this README** with script documentation
5. **Test thoroughly** before adding to automated systems

## 🔒 Security Notes

- Scripts with database access require proper environment variables
- Session clearing creates audit logs for security compliance  
- Backup scripts handle sensitive data - ensure proper file permissions
- Always validate inputs in user-facing scripts