# Authentication Setup for E2E Tests

## Overview

The Playwright E2E tests use authentication to access protected routes like `/docs`, `/blog`, and `/api-specs`. For security, credentials are **prompted at runtime** and never stored in files.

## How It Works

### Global Setup (Before All Tests)

1. **Prompts for credentials** when you run tests (interactive mode)
2. Logs in with provided credentials
3. Saves authentication session to `tests/.auth/user.json`
4. All subsequent tests use this saved authentication state
5. Credentials are **never written to disk**

### Security Features

- ✅ Credentials prompted at runtime (not stored in code)
- ✅ Authentication session saved temporarily
- ✅ Session cleaned up after tests
- ✅ CI mode uses secure environment variables
- ✅ No credentials in git repository

### Test Fixtures

- **Default Tests**: Use saved authentication automatically
- **Unauthenticated Tests**: Use `unauthenticatedTest` fixture to test login flow without pre-authentication

## Prerequisites

### 1. Create Test User

You need a user account for testing. The default credentials are:

- **Email**: `admin@nextdocs.local`
- **Password**: `admin`

#### Option A: Using Prisma Seed (Recommended)

```bash
# Run database seeding
npm run seed
```

#### Option B: Manual Creation via Prisma Studio

```bash
# Open Prisma Studio
npm run prisma:studio

# Navigate to User table and create:
# - email: admin@nextdocs.local
# - password: (use bcrypt hash of "admin")
# - role: ADMIN
# - name: Test Admin
```

#### Option C: Direct SQL

```sql
-- Generate bcrypt hash for "admin" password
-- Hash: $2b$10$rqiKJ5LqY5Y5Y5Y5Y5Y5YuXqJ5LqY5Y5Y5Y5Y5Y5YuXqJ5LqY5Y5Y

INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin@nextdocs.local',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Test Admin',
  'ADMIN',
  NOW(),
  NOW()
);
```

### 2. Start Application

The application must be running before tests:

```bash
# Production mode (port 9981)
docker-compose -f docker-compose.prod.yml up

# Or development mode
npm run dev
```

### 3. Configure Environment (Optional)

**For CI/CD Only**: Set environment variables in your CI pipeline:

```bash
# CI environment variables (GitHub Actions, etc.)
TEST_USER_EMAIL=admin@nextdocs.local
TEST_USER_PASSWORD=admin
TEST_BASE_URL=http://localhost:9981
```

**For Local Development**: No configuration needed! Credentials are prompted when you run tests.

## Running Tests

### First Time Setup

```bash
# Install Playwright browsers (if not done)
npx playwright install

# Run tests - you'll be prompted for credentials
npm run test:e2e
```

### Interactive Prompt

When you run tests, you'll see:

```
=== NextDocs E2E Test Authentication ===
Please provide test user credentials

Test user email (press Enter for admin@nextdocs.local): 
Test user password (press Enter for admin): 

Setting up authentication for admin@nextdocs.local...
✓ Authentication successful
✓ Saved authentication state to tests/.auth/user.json
```

### Expected Output

```
Running 45 tests using 12 workers
  ✓ [chromium] › homepage.spec.ts:11:3 › Homepage › should load homepage successfully
  ✓ [chromium] › auth.spec.ts:8:3 › Authentication › should access protected docs
  ...
```

## Troubleshooting

### Issue: "Authentication setup failed"

**Cause**: Login failed or test user doesn't exist

**Solution**:
1. Verify test user exists in database
2. Check credentials in environment variables
3. Ensure application is running on correct port
4. Check browser console in headed mode: `npm run test:e2e:headed`

### Issue: Tests redirect to /login

**Cause**: Authentication state not loaded or expired

**Solution**:
1. Delete `tests/.auth/user.json` and re-run tests
2. Check if session is configured correctly in the app
3. Verify `storageState` in `playwright.config.ts`

### Issue: "Cannot find module './global-setup'"

**Cause**: TypeScript not compiled or path incorrect

**Solution**:
```bash
# Make sure paths are correct in playwright.config.ts
globalSetup: require.resolve('./tests/playwright/global-setup'),
```

### Debugging Authentication

Run in headed mode to see what's happening:

```bash
# See browser and authentication flow
npm run test:e2e:headed

# Use Playwright UI for step-by-step debugging
npm run test:e2e:ui
```

## Test Organization

### Authenticated Tests (Default)

Most tests assume you're logged in:

```typescript
test('should access protected docs', async ({ page }) => {
  await page.goto('/docs'); // Already authenticated
  // ... assertions
});
```

### Unauthenticated Tests

Tests for login/logout flow:

```typescript
import { unauthenticatedTest } from './fixtures';

unauthenticatedTest('should login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@nextdocs.local');
  await page.fill('input[name="password"]', 'admin');
  await page.click('button[type="submit"]');
  // ... assertions
});
```

## Files

- `tests/playwright/global-setup.ts` - Authentication setup before tests
- `tests/playwright/global-teardown.ts` - Cleanup after tests
- `tests/playwright/fixtures.ts` - Test fixtures (authenticated/unauthenticated)
- `tests/.auth/user.json` - Saved authentication state (git-ignored)
- `playwright.config.ts` - Playwright configuration with auth setup

## Security Notes

- ✅ **No credentials in code** - Prompted at runtime only
- ✅ **No credentials in environment files** - Only authentication session saved
- ✅ **Session automatically cleaned** - `tests/.auth/user.json` removed after tests
- ✅ **Git-ignored** - `.auth/` directory never committed
- ✅ **CI-safe** - Uses secure environment variables in CI/CD pipelines
- ✅ **Separate test users** - Never use production accounts for testing
- ✅ **Environment-specific** - Use different test databases per environment
