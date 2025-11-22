# Docker Deployment Guide

## Building and Deploying

### Build the Docker image:
```bash
docker-compose -f docker-compose.prod.yml build
```

### Start all services:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### View logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

### Stop services:
```bash
docker-compose -f docker-compose.prod.yml down
```

## Database Migrations

The Docker container automatically handles database migrations on startup using the `docker-entrypoint.sh` script.

The entrypoint:
1. Waits for the database to be ready
2. Runs `prisma db push` to sync the schema
3. Falls back to `prisma migrate deploy` if push fails
4. Starts the Next.js application

### Manual Migration (if needed)

If you need to run migrations manually:

```bash
# Enter the container
docker exec -it nextdocs-prod sh

# Run migrations
npx prisma migrate deploy

# Or sync schema
npx prisma db push
```

## Content Engagement Features

The latest deployment includes:
- Voting system (thumbs up/down) for documents and blog posts
- Share functionality with native share API support
- Follow system with email notifications when content updates
- Email queue for notification processing

### Database Tables Added:
- `ContentVote` - User votes on content
- `ContentFollow` - User follows for content updates

### Email Notifications

Email notifications are queued in the `EmailQueue` table and require an email worker to process them. The worker should:
1. Poll the `EmailQueue` table for pending emails
2. Send emails via your email service (e.g., SendGrid, AWS SES)
3. Update the status to 'sent' or 'failed'

## Environment Variables

Ensure these are set in your `.env` file:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth
- `ENCRYPTION_KEY` - Key for encrypting sensitive data
- `AZURE_AD_CLIENT_ID` - Azure AD client ID (if using Azure AD auth)
- `AZURE_AD_CLIENT_SECRET` - Azure AD client secret
- `AZURE_AD_TENANT_ID` - Azure AD tenant ID

## Health Checks

The application includes a health check endpoint at `/api/health` that Docker uses to monitor container health.

## Troubleshooting

### Migration Errors
If you encounter migration errors:
1. Check database connection
2. Verify environment variables
3. Check container logs: `docker logs nextdocs-prod`
4. Manually run migrations inside container

### Container Won't Start
1. Check database is running: `docker ps`
2. Verify PostgreSQL health: `docker logs nextdocs-postgres-prod`
3. Check Redis: `docker logs nextdocs-redis-prod`
4. Review environment variables

### Application Errors
View application logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```
