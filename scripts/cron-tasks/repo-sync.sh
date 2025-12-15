#!/bin/bash

# Repository sync task - runs the TypeScript sync service
# This should be run periodically to keep repository content up to date

LOG_PREFIX="[$(date)] [REPO-SYNC]"

echo "$LOG_PREFIX 🔄 Starting repository sync task..."

# Check if Node.js is available (we're in a postgres container, so we need to handle this)
if ! command -v node &> /dev/null; then
    echo "$LOG_PREFIX ❌ Node.js not available in this container"
    echo "$LOG_PREFIX 💡 Repository sync requires Node.js runtime"
    echo "$LOG_PREFIX 🏗️  Consider running this task in the main app container instead"
    exit 1
fi

# Set up environment for database connection
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public"

# We should already be in /app, but let's make sure
cd /app || {
    echo "$LOG_PREFIX ❌ Application directory not available"
    exit 1
}

# Check if required files exist
if [ ! -f "prisma/trigger-sync.ts" ]; then
    echo "$LOG_PREFIX ❌ Repository sync script not found"
    exit 1
fi

# Run the repository sync
echo "$LOG_PREFIX 📦 Executing repository sync..."
if npx tsx prisma/trigger-sync.ts; then
    echo "$LOG_PREFIX ✅ Repository sync completed successfully"
else
    echo "$LOG_PREFIX ❌ Repository sync failed"
    exit 1
fi