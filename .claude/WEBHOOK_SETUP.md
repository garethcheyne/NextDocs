# Webhook Configuration Guide

This document explains how to set up webhooks for real-time comment synchronization between NextDocs and external work item systems (GitHub and Azure DevOps).

## Overview

NextDocs supports three methods for syncing comments from external systems:

1. **Webhooks** (Real-time) - Instant synchronization when comments are added
2. **On-Demand Sync** - Manual sync via button in the UI
3. **Background Polling** - Automatic sync every 30 minutes as fallback

## Environment Variables

Add these to your `.env.local` and `.env.production` files:

```bash
# GitHub Webhook Secret (for verifying webhook signatures)
GITHUB_WEBHOOK_SECRET="your-secret-here"

# Azure DevOps Webhook Secret (used as Basic Auth password)
AZURE_WEBHOOK_SECRET="your-secret-here"

# Comment Sync Interval (minutes, default: 30)
COMMENT_SYNC_INTERVAL_MINUTES="30"
```

Generate secure secrets with:
```bash
openssl rand -hex 32
```

## GitHub Webhook Setup

### 1. Configure Webhook in GitHub Repository

1. Go to your repository **Settings** → **Webhooks** → **Add webhook**
2. Configure the webhook:
   - **Payload URL**: `https://yourdomain.com/api/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: Enter the value from `GITHUB_WEBHOOK_SECRET`
   - **SSL verification**: Enable SSL verification (recommended)
   - **Which events**: Select "Let me select individual events"
     - ✅ Issue comments
   - **Active**: ✅ Checked

### 2. Test the Webhook

1. After creating the webhook, GitHub will send a `ping` event
2. Check the webhook delivery status in GitHub
3. Add a comment to a linked GitHub issue
4. Verify the comment appears in NextDocs

### 3. Troubleshooting

- Check webhook delivery logs in GitHub Settings → Webhooks → Recent Deliveries
- Look for 200 OK responses
- If you see 401 errors, verify the webhook secret matches
- For local development, use [ngrok](https://ngrok.com/) to expose your local server

## Azure DevOps Webhook Setup

### 1. Configure Service Hook in Azure DevOps

1. Go to **Project Settings** → **Service hooks**
2. Click **Create subscription** → **Web Hooks**
3. Configure the trigger:
   - **Event**: `Work item commented on`
   - **Filters**: (Optional) Filter by work item type or area path
4. Configure the action:
   - **URL**: `https://yourdomain.com/api/webhooks/azure-devops`
   - **HTTP headers**: Leave blank
   - **Basic authentication username**: `webhook` (can be any value)
   - **Basic authentication password**: Enter the value from `AZURE_WEBHOOK_SECRET`
   - **Resource details to send**: All
   - **Messages to send**: All
   - **Detailed messages to send**: All

### 2. Test the Service Hook

1. After creating the subscription, click **Test** to send a test payload
2. Verify the test succeeds with a 200 OK response
3. Add a comment to a linked work item
4. Verify the comment appears in NextDocs

### 3. Troubleshooting

- Check service hook history in Azure DevOps → Service hooks → Subscription → History
- Look for successful deliveries (green checkmark)
- If you see 401 errors, verify the webhook secret matches
- For local development, use [ngrok](https://ngrok.com/) to expose your local server

## Local Development with ngrok

When developing locally, external webhooks cannot reach `localhost`. Use ngrok to create a public URL:

### 1. Install ngrok

```bash
# macOS
brew install ngrok

# Windows
choco install ngrok

# Or download from https://ngrok.com/download
```

### 2. Start ngrok

```bash
# Expose your local NextDocs instance
ngrok http 9980
```

### 3. Update Webhook URLs

Use the ngrok HTTPS URL in your webhook configurations:
- GitHub: `https://your-subdomain.ngrok.io/api/webhooks/github`
- Azure DevOps: `https://your-subdomain.ngrok.io/api/webhooks/azure-devops`

### 4. Test Webhooks

1. Add a comment to a linked issue/work item
2. Watch the ngrok web interface at `http://localhost:4040`
3. Check your NextDocs logs for webhook events

## On-Demand Sync

Users can manually sync comments using the "Sync Comments" button:

1. Navigate to a feature request with a linked external work item
2. Look for the "Work Item Link" card in the sidebar
3. Click **Sync Comments** button
4. New comments will be fetched and displayed immediately

## Background Polling

As a fallback, NextDocs automatically polls for new comments:

- **Frequency**: Every 30 minutes (configurable via `COMMENT_SYNC_INTERVAL_MINUTES`)
- **Scope**: All active features with linked external work items
- **Status**: Only syncs features that are not COMPLETED or REJECTED
- **Rate Limiting**: Processes in batches of 10 with 2-second delays

To adjust the polling interval, set in your `.env` file:

```bash
COMMENT_SYNC_INTERVAL_MINUTES="15"  # Poll every 15 minutes
```

## Security Considerations

### Webhook Signature Verification

**GitHub**: Uses HMAC SHA256 signatures
- NextDocs verifies the `x-hub-signature-256` header
- Prevents unauthorized webhook calls

**Azure DevOps**: Uses Basic Authentication
- Username can be any value (e.g., "webhook")
- Password must match `AZURE_WEBHOOK_SECRET`
- Sent as `Authorization: Basic base64(username:password)` header

### Best Practices

1. **Always use HTTPS** in production
2. **Generate strong secrets** using `openssl rand -hex 32`
3. **Rotate secrets** periodically
4. **Monitor webhook logs** for suspicious activity
5. **Use different secrets** for GitHub and Azure DevOps
6. **Never commit secrets** to version control

## Monitoring and Logs

### Webhook Logs

Check server logs for webhook events:

```bash
# Docker logs
docker logs nextdocs-app-prod -f

# Look for:
# - "Webhook triggered: Syncing comments for feature..."
# - "Synced X comments, skipped Y"
# - "Invalid webhook signature" (security issue)
```

### Background Sync Logs

Background polling logs appear every sync interval:

```bash
# Look for:
# - "🔄 Starting scheduled comment sync..."
# - "Found X features with external work items to sync"
# - "✓ Comment sync completed in Xs: Y synced, Z skipped"
```

## API Endpoints

### Webhook Endpoints (External)

- `POST /api/webhooks/github` - Receives GitHub webhook events
- `POST /api/webhooks/azure-devops` - Receives Azure DevOps webhook events

### Admin Endpoints (Internal)

- `POST /api/admin/features/[id]/sync-comments` - Manual sync for specific feature

## Troubleshooting

### Comments Not Syncing

1. **Check webhook delivery**
   - GitHub: Settings → Webhooks → Recent Deliveries
   - Azure DevOps: Service hooks → Subscription → History

2. **Verify secrets match**
   - Environment variable matches webhook configuration
   - No extra spaces or newlines in secrets

3. **Check feature category settings**
   - `syncComments` must be enabled for the category
   - Integration type must match (github/azure-devops)

4. **Review logs**
   - Look for sync errors in server logs
   - Check for API rate limiting issues

### Duplicate Comments

- Comments with `#External.Comment:` prefix are skipped
- Prevents infinite sync loops
- Each comment tracked by `externalCommentId`

### Rate Limiting

If you hit API rate limits:

1. Increase `COMMENT_SYNC_INTERVAL_MINUTES`
2. Reduce features being synced (use status filters)
3. Check batch size in `comment-sync-worker.ts`

## Support

For issues or questions:
- Check server logs first
- Review webhook delivery status
- Verify configuration matches this guide
- Test with ngrok for local debugging
