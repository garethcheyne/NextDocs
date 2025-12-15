#!/bin/bash

# Search vectors refresh task - rebuilds search indexes periodically
# This ensures search functionality stays up-to-date with content changes

LOG_PREFIX="[$(date)] [SEARCH-REFRESH]"

echo "$LOG_PREFIX 🔍 Starting search vectors refresh task..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "$LOG_PREFIX ❌ Node.js not available in this container"
    echo "$LOG_PREFIX 💡 Search refresh requires Node.js runtime"
    exit 1
fi

# Set up environment for database connection
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public"

# We should already be in /app
cd /app || {
    echo "$LOG_PREFIX ❌ Application directory not available"
    exit 1
}

# Check if required files exist
if [ ! -f "scripts/init-search-vectors.ts" ]; then
    echo "$LOG_PREFIX ❌ Search refresh script not found"
    exit 1
fi

# Run search vector refresh
echo "$LOG_PREFIX 🔧 Refreshing search vectors..."
if npx tsx scripts/init-search-vectors.ts; then
    echo "$LOG_PREFIX ✅ Search vectors refresh completed successfully"
else
    echo "$LOG_PREFIX ❌ Search vectors refresh failed"
    exit 1
fi