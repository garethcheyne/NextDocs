#!/bin/bash

# Session cleanup task - removes expired sessions and tokens
# This helps keep the database clean and secure

LOG_PREFIX="[$(date)] [SESSION-CLEANUP]"

echo "$LOG_PREFIX 🔐 Starting session cleanup task..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "$LOG_PREFIX ❌ Node.js not available in this container"
    echo "$LOG_PREFIX 💡 Session cleanup requires Node.js runtime"
    exit 1
fi

# Set up environment for database connection
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public"
export NODE_ENV="production"
export DOCKER_MODE="true"

# We should already be in /app
cd /app || {
    echo "$LOG_PREFIX ❌ Application directory not available"
    exit 1
}

# Check if required files exist
if [ ! -f "scripts/clear-sessions.js" ]; then
    echo "$LOG_PREFIX ❌ Session cleanup script not found"
    exit 1
fi

# Run session cleanup
echo "$LOG_PREFIX 🧹 Cleaning up expired sessions..."
if node scripts/clear-sessions.js; then
    echo "$LOG_PREFIX ✅ Session cleanup completed successfully"
else
    echo "$LOG_PREFIX ❌ Session cleanup failed"
    exit 1
fi