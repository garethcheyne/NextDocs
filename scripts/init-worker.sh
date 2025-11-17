#!/bin/sh
# Initialize sync worker on app startup

echo "Waiting for app to be ready..."
sleep 5

echo "Initializing sync worker..."
curl -X GET "http://localhost:9980/api/sync/worker" \
  -H "Authorization: Bearer development-worker-secret-change-in-production" \
  -H "Content-Type: application/json"

echo "\nSync worker initialization complete"
