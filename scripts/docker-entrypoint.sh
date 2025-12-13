#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
# Use db push in production to sync schema without migration history
npx prisma db push --accept-data-loss || {
  echo "Migration failed, trying with migrate deploy..."
  npx prisma migrate deploy
}

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
