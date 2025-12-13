#!/bin/bash

# Script to run the app in development mode using the same database
# Usage: ./run-dev.sh

echo "🔧 Starting NextDocs in DEVELOPMENT mode..."
echo "📊 Using the same database and Redis as production"
echo "🐛 This will provide detailed error messages for debugging"
echo "🔥 Hot reloading enabled - changes will auto-refresh"
echo ""

# Stop production app first (keep database/redis running)
echo "⏸️ Stopping production app (keeping database/redis)..."
docker-compose -f docker-compose.prod.yml stop app

# Make sure database and Redis are still running
echo "🗄️ Ensuring database and Redis are running..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Build and start development container on same port
echo "🚀 Starting development server (no build required)..."
docker-compose -f docker-compose.dev.yml up --build

echo ""
echo "✅ Development server is running!"
echo "🌐 Access the app at: https://docs.err403.com (same as production)"
echo "🔍 Check browser console for detailed error messages"
echo "📝 Server logs will show detailed debugging information"
echo "🔄 Code changes will automatically reload the page"
echo ""
echo "To stop: Press Ctrl+C"