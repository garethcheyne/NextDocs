# NextDocs Test Suite - Quick Start Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
npx playwright install --with-deps
```

### 2. Start Application

```bash
# Using Docker (recommended)
docker-compose -f docker-compose.prod.yml up -d

# OR run locally
npm run dev
```

### 3. Run Tests

```bash
# All tests
npm test

# CLI tests only
npm run test:cli

# E2E tests only
npm run test:e2e
```

### 4. Generate Report

```bash
npm run test:generate-report
```

Report will be saved to `test-results/TEST_REPORT.md`

---

## 📋 Test Organization

### CLI Tests (`tests/cli/`)

| Test File | Purpose | Tests |
|-----------|---------|-------|
| `database.test.ts` | Database integrity | Connection, tables, relationships |
| `search.test.ts` | Search functionality | Full-text, ranking, vectors |
| `auth.test.ts` | Authentication | Users, passwords, sessions |
| `repository-sync.test.ts` | Repo integration | GitHub, Azure DevOps sync |
| `content.test.ts` | Content management | Blog, API specs, features |

### E2E Tests (`tests/playwright/`)

| Test File | Purpose | Tests |
|-----------|---------|-------|
| `auth.spec.ts` | Authentication flow | Login, logout, sessions |
| `homepage.spec.ts` | Homepage | Navigation, theme, responsive |
| `documentation.spec.ts` | Documentation | Viewing, search, TOC |
| `search.spec.ts` | Global search | Search dialog, filtering |
| `blog.spec.ts` | Blog | Posts, metadata, navigation |
| `api-specs.spec.ts` | API viewer | Swagger, Redoc, themes |
| `features.spec.ts` | Feature requests | Voting, comments, creation |
| `admin.spec.ts` | Admin panel | Dashboard, management |

---

## 🔧 Configuration

### Environment Variables

Create `.env.test`:

```bash
TEST_BASE_URL=http://localhost:8100
TEST_USER_EMAIL=admin@nextdocs.local
TEST_USER_PASSWORD=admin
DATABASE_URL=postgresql://postgres:postgres@localhost:5500/nextdocs
```

### Playwright Config

Edit `playwright.config.ts` to:
- Add/remove browsers
- Change test timeout
- Modify screenshot/video settings
- Update base URL

### Jest Config

Edit `jest.config.js` to:
- Change test patterns
- Adjust coverage thresholds
- Modify module mappings

---

## 📊 Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (CLI + E2E) |
| `npm run test:cli` | Run Jest CLI tests |
| `npm run test:e2e` | Run Playwright E2E tests (headless) |
| `npm run test:e2e:headed` | Run E2E tests with visible browser |
| `npm run test:e2e:ui` | Open Playwright UI mode |
| `npm run test:report` | Open Playwright HTML report |
| `npm run test:generate-report` | Generate markdown test report |

---

## 🐛 Debugging

### Debug E2E Tests

```bash
# Run with browser visible
npm run test:e2e:headed

# Debug specific test
npx playwright test tests/playwright/auth.spec.ts --debug

# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Debug CLI Tests

```bash
# Run with verbose output
npx jest --verbose

# Run specific test
npx jest tests/cli/database.test.ts

# Watch mode
npx jest --watch

# Debug in VS Code
# Add breakpoint and press F5
```

---

## ✅ Test Checklist

Before deployment:

- [ ] All CLI tests pass
- [ ] All E2E tests pass
- [ ] No failing tests in CI/CD
- [ ] Test coverage meets thresholds
- [ ] New features have tests
- [ ] Flaky tests are fixed
- [ ] Test documentation updated

---

## 🎯 Common Tasks

### Add New E2E Test

1. Create new file in `tests/playwright/`
2. Import test and expect from Playwright
3. Write test using page fixture
4. Run and verify

```typescript
import { test, expect } from '@playwright/test';

test('my new test', async ({ page }) => {
  await page.goto('/my-page');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Add New CLI Test

1. Create new file in `tests/cli/`
2. Set up Prisma client
3. Write tests using Jest
4. Clean up in afterAll

```typescript
import { PrismaClient } from '@prisma/client';

describe('My Feature', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should work', async () => {
    // Your test
  });
});
```

### Use Test Helpers

```typescript
import { AuthHelper, DatabaseHelper } from '../helpers';

// Login
await AuthHelper.login(page, email, password);

// Database operations
const db = new DatabaseHelper();
await db.createTestUser('test@example.com', 'password');
```

---

## 📚 Resources

- [Full Documentation](./README.md)
- [Test Report Template](./TEST_REPORT_TEMPLATE.md)
- [Playwright Docs](https://playwright.dev)
- [Jest Docs](https://jestjs.io)

---

## 🆘 Troubleshooting

### Tests Won't Run

- Check if Docker containers are running
- Verify DATABASE_URL is correct
- Run `npm install` again
- Check port 8100 is available

### Playwright Errors

- Run `npx playwright install --with-deps`
- Check browser compatibility
- Increase timeout values
- Check network connectivity

### Database Errors

- Verify Prisma schema is synced
- Run migrations: `npm run db:migrate`
- Check database connection string
- Restart Docker containers

### Flaky Tests

- Add explicit waits
- Check for race conditions
- Increase timeouts
- Use proper selectors
- Ensure test isolation

---

**Need Help?** Check the [main README](./README.md) or open an issue.
