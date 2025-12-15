#!/bin/bash

# Generic task runner for scheduled tasks
# This script can be extended to run multiple scheduled tasks

LOG_DIR="/var/log"
TASK_LOG="$LOG_DIR/cron-tasks.log"

log() {
    echo "[$(date)] $1" | tee -a "$TASK_LOG"
}

run_task() {
    local task_name="$1"
    local task_script="$2"
    local log_file="$3"
    
    if [ -f "/usr/local/bin/$task_script" ]; then
        log "🔄 Running task: $task_name"
        if /usr/local/bin/$task_script >> "$log_file" 2>&1; then
            log "✅ Task completed: $task_name"
        else
            log "❌ Task failed: $task_name"
        fi
    else
        log "⚠️  Task script not found: $task_script"
    fi
}

# Main task execution
log "🚀 Starting scheduled task execution..."

# Get current hour for conditional task execution
CURRENT_HOUR=$(date +%H)
CURRENT_DAY=$(date +%u)  # 1=Monday, 7=Sunday

# Database backup task (every hour)
run_task "Database Backup" "backup-cron.sh" "$LOG_DIR/backup.log"

# Session cleanup (every 6 hours at 00:00, 06:00, 12:00, 18:00)
if [ $((10#$CURRENT_HOUR % 6)) -eq 0 ]; then
    run_task "Session Cleanup" "session-cleanup.sh" "$LOG_DIR/session-cleanup.log"
fi

# Repository sync (every 4 hours at 02:00, 06:00, 10:00, 14:00, 18:00, 22:00)
if [ $((10#$CURRENT_HOUR % 4)) -eq 2 ] || [ $((10#$CURRENT_HOUR % 4)) -eq 0 ]; then
    run_task "Repository Sync" "repo-sync.sh" "$LOG_DIR/repo-sync.log"
fi

# Search vectors refresh (daily at 03:00)
if [ "$CURRENT_HOUR" = "03" ]; then
    run_task "Search Vectors Refresh" "search-refresh.sh" "$LOG_DIR/search-refresh.log"
fi

log "✨ All scheduled tasks completed"