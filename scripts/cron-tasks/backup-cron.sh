#!/bin/sh
# Automated backup script for cron job with smart retention
# Runs inside the db-backup container
# Strategy: Keep hourly backups for current day, daily backups for older days

# Enable error handling but don't exit immediately to allow cleanup
set -e

# Log that the script started
echo "================================================================================"
echo "[$(date)] 🚀 BACKUP CRON JOB TRIGGERED - PID: $$"
echo "================================================================================"

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
HOURLY_RETENTION_HOURS=${BACKUP_HOURLY_RETENTION_HOURS:-24}
TODAY=$(date +%Y%m%d)
CURRENT_HOUR=$(date +%H)

echo "[$(date)] 📋 Configuration:"
echo "  - Backup Directory: $BACKUP_DIR"
echo "  - Retention Days: $RETENTION_DAYS"
echo "  - Hourly Retention: $HOURLY_RETENTION_HOURS hours"
echo "  - Target File: $BACKUP_FILE"
echo "  - Database: $POSTGRES_HOST:$POSTGRES_DB"

# Check if backup directory exists and is writable
if [ ! -d "$BACKUP_DIR" ]; then
    echo "[$(date)] ❌ ERROR: Backup directory does not exist: $BACKUP_DIR"
    exit 1
fi

if [ ! -w "$BACKUP_DIR" ]; then
    echo "[$(date)] ❌ ERROR: Backup directory is not writable: $BACKUP_DIR"
    ls -la "$BACKUP_DIR"
    exit 1
fi

echo "[$(date)] ✅ Backup directory is ready"
echo "[$(date)] 🔄 Starting automated database backup (hourly with smart retention)..."

# Wait for postgres to be ready
until PGPASSWORD=$POSTGRES_PASSWORD pg_isready -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB; do
  echo "Waiting for database to be ready..."
  sleep 2
done

# Create backup
echo "[$(date)] Creating backup: $BACKUP_FILE"
PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup completed successfully: $BACKUP_FILE (Size: $FILE_SIZE)"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    echo "[$(date)] Backup compressed: $COMPRESSED_FILE"
    
    # Smart cleanup strategy
    echo "[$(date)] Starting smart backup cleanup..."
    
    # 1. Remove backups older than retention period
    echo "[$(date)] Removing backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # 2. For days older than today, keep only one backup per day (the latest one)
    echo "[$(date)] Consolidating older days to daily backups..."
    
    # Get list of all backup dates except today
    BACKUP_DATES=$(find "$BACKUP_DIR" -name "backup-*.sql.gz" -exec basename {} \; | \
                   grep -E '^backup-[0-9]{8}-[0-9]{6}\.sql\.gz$' | \
                   cut -d'-' -f2 | cut -c1-8 | sort -u | grep -v "$TODAY" || true)
    
    # For each date, keep only the latest backup of that day
    for backup_date in $BACKUP_DATES; do
        echo "[$(date)] Processing backups for date: $backup_date"
        
        # Find all backups for this date
        DAILY_BACKUPS=$(find "$BACKUP_DIR" -name "backup-${backup_date}-*.sql.gz" | sort)
        BACKUP_COUNT=$(echo "$DAILY_BACKUPS" | wc -l)
        
        if [ "$BACKUP_COUNT" -gt 1 ]; then
            echo "[$(date)] Found $BACKUP_COUNT backups for $backup_date, keeping only the latest..."
            
            # Keep the latest (last in sorted order) and remove the rest
            LATEST_BACKUP=$(echo "$DAILY_BACKUPS" | tail -n 1)
            BACKUPS_TO_REMOVE=$(echo "$DAILY_BACKUPS" | head -n -1)
            
            echo "$BACKUPS_TO_REMOVE" | while read -r backup_to_remove; do
                if [ -n "$backup_to_remove" ]; then
                    echo "[$(date)] Removing older backup: $backup_to_remove"
                    rm -f "$backup_to_remove"
                fi
            done
            
            echo "[$(date)] Kept latest backup for $backup_date: $(basename "$LATEST_BACKUP")"
        fi
    done
    
    # 3. For today, keep only backups within hourly retention period
    CUTOFF_TIME=$(date -d "$HOURLY_RETENTION_HOURS hours ago" +%Y%m%d-%H%M%S 2>/dev/null || \
                  date -v-${HOURLY_RETENTION_HOURS}H +%Y%m%d-%H%M%S 2>/dev/null || \
                  awk -v hours="$HOURLY_RETENTION_HOURS" 'BEGIN { print strftime("%Y%m%d-%H%M%S", systime() - hours*3600) }')
    
    echo "[$(date)] Cleaning up today's backups older than $HOURLY_RETENTION_HOURS hours (before $CUTOFF_TIME)..."
    find "$BACKUP_DIR" -name "backup-${TODAY}-*.sql.gz" -exec basename {} \; | \
    while read -r backup_file; do
        if [ -n "$backup_file" ]; then
            BACKUP_TIME=$(echo "$backup_file" | sed 's/backup-\([0-9]\{8\}-[0-9]\{6\}\)\.sql\.gz/\1/')
            if [ "$BACKUP_TIME" \< "$CUTOFF_TIME" ]; then
                echo "[$(date)] Removing old hourly backup: $backup_file"
                rm -f "$BACKUP_DIR/$backup_file"
            fi
        fi
    done
    
    # List current backups by date
    echo "[$(date)] Current backup summary:"
    TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "backup-*.sql.gz" | wc -l)
    TODAY_BACKUPS=$(find "$BACKUP_DIR" -name "backup-${TODAY}-*.sql.gz" | wc -l)
    OLD_BACKUPS=$((TOTAL_BACKUPS - TODAY_BACKUPS))
    
    echo "[$(date)] Total backups: $TOTAL_BACKUPS"
    echo "[$(date)] Today's hourly backups: $TODAY_BACKUPS"
    echo "[$(date)] Daily backups (older days): $OLD_BACKUPS"
    
    echo "[$(date)] Smart backup routine completed successfully"
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi
