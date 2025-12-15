# Scheduled Tasks Directory

This directory contains scheduled task scripts for the NextDocs application, all running in a single unified service.

## Service Architecture

### 🚀 Unified Cron Tasks Service (`cron-tasks`)
- **Container**: `nextdocs-cron-tasks` (Node.js + PostgreSQL client)
- **Purpose**: All scheduled tasks in one reliable container
- **Capabilities**: 
  - Database operations (pg_dump, psql)
  - Node.js application scripts
  - File system operations
- **Schedule**: Hourly loop with conditional task execution

## Current Tasks

### Active Tasks
- **`backup-cron.sh`** - Hourly database backup with smart retention
  - ✅ **Active**: Runs every hour
  - Keeps hourly backups for 24 hours
  - Consolidates to daily backups for older days
  - Removes backups older than 14 days

- **Session Cleanup** - Built into main loop
  - ✅ **Active**: Runs daily at 3 AM
  - Executes `node scripts/clear-sessions.js`
  - Removes expired sessions and tokens

### Available Tasks (Ready to Enable)
- **`repo-sync.sh`** - Repository content synchronization
  - Syncs repository content and metadata
  - Keeps documentation up-to-date
  - Uses `npx tsx prisma/trigger-sync.ts`

- **`search-refresh.sh`** - Search index optimization  
  - Rebuilds search vectors and indexes
  - Ensures search functionality stays optimal
  - Uses `npx tsx scripts/init-search-vectors.ts`

### Utility Scripts
- **`run-tasks.sh`** - Generic task runner (available for complex scheduling)
  - Can coordinate multiple tasks with conditional scheduling
  - Extensible for complex task orchestration

## Adding New Tasks

### Quick Add: Modify the Main Loop
1. Edit `docker-compose.prod.yml` in the `cron-tasks` service command
2. Add your task with time-based conditions
3. Restart: `docker-compose -f docker-compose.prod.yml restart cron-tasks`

### Script-Based: Create Dedicated Task Scripts
1. Create your script in this directory (e.g., `weekly-cleanup.sh`)
2. Add it to the main loop in docker-compose.prod.yml
3. Restart the service

### Example: Adding Weekly Repository Sync
```yaml
# In docker-compose.prod.yml cron-tasks service command
while true; do
  HOUR=$(date +%H);
  DAY=$(date +%u);  # 1=Monday, 7=Sunday
  
  # Hourly backup
  /usr/local/bin/backup-cron.sh >> /var/log/backup.log 2>&1;
  
  # Daily session cleanup at 3 AM
  if [ "$HOUR" = "03" ]; then
    node scripts/clear-sessions.js >> /var/log/maintenance.log 2>&1;
  fi;
  
  # Weekly repo sync on Monday at 2 AM
  if [ "$DAY" = "1" ] && [ "$HOUR" = "02" ]; then
    npx tsx prisma/trigger-sync.ts >> /var/log/maintenance.log 2>&1;
  fi;
  
  sleep 3600;
done
```

### Available Environment Variables
- `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` 
- `DATABASE_URL` - Full connection string
- `BACKUP_RETENTION_DAYS`, `BACKUP_HOURLY_RETENTION_HOURS`
- `NODE_ENV=production`

## Task Script Guidelines

- Start with `#!/bin/bash`
- Include proper error handling
- Log important events with timestamps
- Use environment variables for configuration
- Exit with appropriate codes (0 = success, 1 = error)

## Available Environment Variables

All environment variables from the cron-tasks service are available:
- `POSTGRES_HOST` - Database host
- `POSTGRES_USER` - Database username  
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name
- `BACKUP_RETENTION_DAYS` - How long to keep backups
- `BACKUP_HOURLY_RETENTION_HOURS` - How long to keep hourly backups