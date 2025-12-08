#!/bin/bash

# Database Backup Script for NextDocs
# This script creates a timestamped backup of the PostgreSQL database

set -e  # Exit on any error

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql"
CONTAINER_NAME="nextdocs-postgres"
DB_USER="postgres"
DB_NAME="nextdocs"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup at $(date)"
echo "Backup file: $BACKUP_FILE"

# Run pg_dump
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    echo "File size: $(du -h "$BACKUP_FILE" | cut -f1)"

    # Optional: Keep only last 7 backups (cleanup old ones)
    echo "Cleaning up old backups (keeping last 7)..."
    ls -t "$BACKUP_DIR"/backup-*.sql | tail -n +8 | xargs -r rm -f

    echo "Backup routine completed at $(date)"
else
    echo "ERROR: Backup failed!"
    exit 1
fi