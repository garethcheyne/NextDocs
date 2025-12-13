#!/bin/bash

# Run Next.js development server locally, connecting to Docker database
# This gives you full Next.js development features while using production data

echo "🔧 Starting NextDocs in LOCAL development mode..."
echo "📊 Connecting to Docker database (production data)"
echo "🐛 Full Next.js development features enabled"
echo ""

# Make sure production database is running
echo "🗄️ Ensuring production database is running..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Stop any running app containers to free up the port
echo "⏸️ Stopping any running app containers..."
docker-compose -f docker-compose.prod.yml stop app
docker-compose -f docker-compose.dev.yml down

# Export environment variables for local development
export NODE_ENV=development
export DATABASE_URL="postgresql://postgres:$(grep POSTGRES_PASSWORD .env | cut -d '=' -f2)@localhost:5432/nextdocs"
export REDIS_URL="redis://:$(grep REDIS_PASSWORD .env | cut -d '=' -f2)@localhost:6379"

# Copy other environment variables
source .env

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Sync database schema
echo "🗄️ Syncing database schema..."
npx prisma db push --accept-data-loss

echo ""
echo "🚀 Starting LOCAL Next.js development server..."
echo "🌐 Will be available at: http://localhost:3000"
echo "🔥 Full Next.js development features enabled:"
echo "   - Error overlay with stack traces"
echo "   - Hot module replacement"
echo "   - Detailed console logging"
echo "   - TypeScript error reporting"
echo ""
echo "⚠️  Note: OAuth redirect URL needs to be updated to http://localhost:3000"
echo "    Or use a tunnel service like ngrok to maintain HTTPS"
echo ""

# Start Next.js development server
npm run dev