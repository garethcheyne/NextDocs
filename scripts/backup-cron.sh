#!/bin/sh
# Automated backup script for cron job
# Runs inside the db-backup container

set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

echo "[$(date)] Starting automated database backup..."

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
    echo "[$(date)] Backup compressed: ${BACKUP_FILE}.gz"
    
    # Clean up old backups (keep last N days based on RETENTION_DAYS)
    echo "[$(date)] Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # List current backups
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup-*.sql.gz" | wc -l)
    echo "[$(date)] Current backup count: $BACKUP_COUNT"
    
    echo "[$(date)] Backup routine completed successfully"
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi
