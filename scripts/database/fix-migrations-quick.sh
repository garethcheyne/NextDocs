#!/bin/bash
# Quick fix script for migration issues

echo "=== Migration Fix Script ==="
echo ""
echo "This script will:"
echo "1. Mark the failed 'fix_feature_release_search' migration as resolved"
echo "2. Apply the manual SQL fixes"
echo "3. Run pending migrations"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Check if running in Docker or local
if [ -f /.dockerenv ]; then
    echo "Running inside Docker container..."
    PSQL_CMD="psql $DATABASE_URL"
    PRISMA_CMD="npx prisma"
else
    echo "Running from host, will exec into Docker..."
    PSQL_CMD="docker exec -i nextdocs-postgres-1 psql -U postgres -d nextdocs"
    PRISMA_CMD="docker exec nextdocs-app-1 npx prisma"
fi

echo ""
echo "Step 1: Applying manual SQL fixes..."
cat scripts/database/manual-fix-migrations.sql | $PSQL_CMD

echo ""
echo "Step 2: Running migrate deploy..."
$PRISMA_CMD migrate deploy

echo ""
echo "✅ Migration fix complete!"
echo ""
echo "You can now restart your containers:"
echo "  docker-compose down && docker-compose up -d"
