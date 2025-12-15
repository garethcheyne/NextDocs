#!/bin/bash
# Database Restore Script for NextDocs
# Usage: ./scripts/restore-db.sh <backup-file>

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/backup-*.sql* 2>/dev/null | awk '{print $9, "("$5")"}'
    exit 1
fi

BACKUP_FILE=$1
CONTAINER_NAME=${POSTGRES_CONTAINER:-nextdocs-postgres-prod}
DB_USER=${POSTGRES_USER:-postgres}
DB_NAME=${POSTGRES_DB:-nextdocs}

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found!"
    exit 1
fi

# Check if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    DECOMPRESSED_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$DECOMPRESSED_FILE"
    BACKUP_FILE="$DECOMPRESSED_FILE"
    CLEANUP_DECOMPRESSED=true
fi

echo "╔════════════════════════════════════════════════════════╗"
echo "║         NextDocs Database Restore                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Container:   $CONTAINER_NAME"
echo "Database:    $DB_NAME"
echo ""
read -p "⚠️  This will REPLACE the current database. Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    [ "$CLEANUP_DECOMPRESSED" = true ] && rm -f "$DECOMPRESSED_FILE"
    exit 0
fi

echo ""
echo "Step 1/3: Checking database connection..."
if ! docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to database container '$CONTAINER_NAME'"
    echo "Make sure the container is running: docker ps | grep $CONTAINER_NAME"
    [ "$CLEANUP_DECOMPRESSED" = true ] && rm -f "$DECOMPRESSED_FILE"
    exit 1
fi
echo "✓ Database is accessible"

echo ""
echo "Step 2/3: Creating backup of current database..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SAFETY_BACKUP="./backups/pre-restore-$TIMESTAMP.sql"
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$SAFETY_BACKUP"
echo "✓ Safety backup created: $SAFETY_BACKUP"

echo ""
echo "Step 3/3: Restoring database from backup..."
# Drop and recreate database
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

# Restore from backup
cat "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║  ✓ Database restored successfully!                     ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo "Restored from: $BACKUP_FILE"
    echo "Safety backup: $SAFETY_BACKUP"
    echo ""
    echo "Next steps:"
    echo "  1. Restart the application: docker-compose restart app"
    echo "  2. Verify the data in the application"
    echo ""
else
    echo ""
    echo "❌ Error: Restore failed!"
    echo ""
    echo "You can restore the previous state using:"
    echo "  $0 $SAFETY_BACKUP"
    [ "$CLEANUP_DECOMPRESSED" = true ] && rm -f "$DECOMPRESSED_FILE"
    exit 1
fi

# Cleanup decompressed file if it was created
[ "$CLEANUP_DECOMPRESSED" = true ] && rm -f "$DECOMPRESSED_FILE"

echo "Done!"
