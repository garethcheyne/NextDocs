#!/bin/bash

# Fast Docker build script for production
# Builds locally first, then creates optimized Docker image using existing prod setup

echo "🏗️  Building NextDocs production with pre-built assets..."

# Step 1: Build locally (fast)
echo "📦 Step 1: Building application locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Local build failed. Please fix build errors first."
    exit 1
fi

echo "✅ Local build completed successfully!"

# Step 2: Build Docker image with pre-built assets
echo "🐳 Step 2: Building Docker image with pre-built assets..."
docker-compose -f docker-compose.prod.yml build

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed."
    exit 1
fi

echo "✅ Docker image built successfully!"

# Step 3: Start the containers
echo "🚀 Step 3: Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start containers."
    exit 1
fi

echo "✅ Production containers started successfully!"
echo "🌐 Application should be available at: http://localhost:8101"
echo ""
echo "📋 Useful commands:"
echo "  View logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop:          docker-compose -f docker-compose.prod.yml down"
echo "  Restart:       docker-compose -f docker-compose.prod.yml restart"