@echo off
REM Script to switch back to production mode
REM Usage: run-prod.bat

echo 🔄 Switching back to PRODUCTION mode...
echo 📊 Using the same database and Redis
echo.

REM Stop development container
echo ⏸️ Stopping development container...
docker-compose -f docker-compose.dev.yml down

REM Start production app (database/redis should still be running)
echo 🚀 Starting production app...
docker-compose -f docker-compose.prod.yml up -d app

echo.
echo ✅ Production server is running!
echo 🌐 Access the app at: https://docs.err403.com
echo 📝 Production mode with optimized performance
echo.
echo To view logs: docker-compose -f docker-compose.prod.yml logs -f app