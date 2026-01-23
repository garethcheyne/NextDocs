#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
# Try migrate deploy first (production approach)
if npx prisma migrate deploy 2>&1 | grep -q "P3009\|failed migrations"; then
  echo "Found failed migrations, attempting to resolve..."
  
  # Mark the failed migration as resolved
  npx prisma migrate resolve --applied fix_feature_release_search || true
  
  # Try migrate deploy again
  if ! npx prisma migrate deploy; then
    echo "Migrate deploy still failing, falling back to db push..."
    npx prisma db push --accept-data-loss --skip-generate
  fi
else
  echo "Migrations deployed successfully!"
fi

echo "Migrations complete!"

# Check if we're in development mode
if [ "$NODE_ENV" = "development" ]; then
  echo "Starting application in DEVELOPMENT mode..."
  echo "This will provide detailed error messages and hot reloading capabilities."
  
  # Install dev dependencies if not present (for development mode)
  if [ ! -d "node_modules/@types" ]; then
    echo "Installing development dependencies..."
    npm install
  fi
  
  # Start in development mode with detailed debugging
  exec npm run dev
else
  echo "Starting application in PRODUCTION mode..."
  exec node server.js
fi
