#!/bin/bash
set -e

echo "Fixing failed migrations..."

# First, mark the failed migration as resolved in the database
docker exec nextdocs-app-1 npx prisma migrate resolve --applied fix_feature_release_search || true

echo "Applying pending migrations..."
docker exec nextdocs-app-1 npx prisma migrate deploy

echo "Migrations fixed and applied successfully!"
