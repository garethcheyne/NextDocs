#!/bin/bash
# Test the unified cron tasks service

echo "🧪 Testing unified cron tasks service..."

# Check cron-tasks service
echo ""
echo "=== CRON TASKS SERVICE ==="
if docker ps | grep -q "nextdocs-cron-tasks"; then
    echo "✅ Cron tasks service container is running"
    echo "📋 Recent service logs:"
    docker logs --tail 15 nextdocs-cron-tasks
else
    echo "❌ Cron tasks service container is not running"
    echo "🔍 Checking all containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    exit 1
fi

# Check backup files
echo ""
echo "=== BACKUP FILES ==="
if [ -d "backups" ]; then
    backup_count=$(ls -1 backups/*.gz 2>/dev/null | wc -l)
    echo "✅ Backup directory exists with $backup_count compressed backups"
    echo "📁 Recent backup files:"
    ls -la backups/ | tail -5
else
    echo "❌ Backup directory does not exist"
fi

# Test manual backup trigger
echo ""
echo "=== MANUAL BACKUP TEST ==="
echo "🚀 Triggering manual backup..."
if docker exec nextdocs-cron-tasks sh -c "/usr/local/bin/backup-cron.sh" >/dev/null 2>&1; then
    echo "✅ Manual backup trigger succeeded"
else
    echo "❌ Manual backup trigger failed"
fi

# Check available tools in container
echo ""
echo "=== CONTAINER CAPABILITIES ==="
echo "🔧 Available tools:"
docker exec nextdocs-cron-tasks sh -c "which pg_dump && which node && which npx" | sed 's/^/  /'

echo ""
echo "✅ Unified cron tasks service test completed"