#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
# Use db push in production to sync schema without migration history
npx prisma db push --skip-generate --accept-data-loss || {
  echo "Migration failed, trying with migrate deploy..."
  npx prisma migrate deploy
}

echo "Migrations complete!"

echo "Starting application..."
exec node server.js
