#!/bin/bash
# Two-Way Sync Cron Job
# Runs every 15 minutes to check for external changes

cd /app

echo "$(date): Starting two-way sync..."

# Call the sync API endpoint
response=$(curl -s -X POST http://localhost:3000/api/admin/sync/two-way \
  -H "Cookie: $(cat /tmp/admin-cookie.txt 2>/dev/null || echo '')")

# Log the result
echo "$(date): Sync response: $response"

# Extract stats if available
if echo "$response" | grep -q "success"; then
  echo "$(date): Two-way sync completed successfully"
else
  echo "$(date): Two-way sync failed or requires authentication"
fi
