# NextDocs Test Suite

This directory contains comprehensive tests for the NextDocs application, including both CLI/unit tests and end-to-end (E2E) browser tests.

## Directory Structure

```
tests/
├── cli/                      # CLI and unit tests (Jest)
│   ├── setup.ts             # Test setup and configuration
│   ├── database.test.ts     # Database connectivity and schema tests
│   ├── search.test.ts       # Search functionality tests
│   ├── auth.test.ts         # Authentication and user tests
│   ├── repository-sync.test.ts  # Repository sync tests
│   └── content.test.ts      # Content management tests
│
├── playwright/               # E2E browser tests (Playwright)
│   ├── auth.spec.ts         # Authentication flow tests
│   ├── homepage.spec.ts     # Homepage and navigation tests
│   ├── documentation.spec.ts # Documentation viewing tests
│   ├── search.spec.ts       # Global search tests
│   ├── blog.spec.ts         # Blog functionality tests
│   ├── api-specs.spec.ts    # API specification viewer tests
│   ├── features.spec.ts     # Feature request tests
│   └── admin.spec.ts        # Admin panel tests
│
├── helpers.ts               # Shared test utilities and helpers
├── generate-report.js       # Test report generator
└── README.md               # This file
```

## Test Categories

### 1. CLI/Unit Tests (Jest)

Located in `tests/cli/`, these tests verify:

- **Database Connectivity**: Connection, schema validation, table structure
- **Search Functionality**: Full-text search, ranking, vector search
- **Authentication**: Password hashing, user roles, session management
- **Repository Sync**: GitHub/Azure DevOps integration, sync status
- **Content Management**: Blog posts, API specs, feature requests

**Run CLI tests:**
```bash
npm run test:cli
```

### 2. E2E Tests (Playwright)

Located in `tests/playwright/`, these tests verify:

- **Authentication Flow**: Login, logout, session persistence
- **Homepage**: Navigation, theme toggle, responsive design
- **Documentation**: Viewing docs, search, breadcrumbs, TOC
- **Search**: Global search, filtering, keyboard navigation
- **Blog**: Post listing, individual posts, metadata
- **API Specs**: Swagger/Redoc viewer, theme switching
- **Feature Requests**: Listing, voting, commenting, creation
- **Admin Panel**: Dashboard, user management, repository management

**Run E2E tests:**
```bash
npm run test:e2e              # Headless mode
npm run test:e2e:headed       # Headed mode (see browser)
npm run test:e2e:ui          # Interactive UI mode
```

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure database is running:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. Set environment variables (optional):
   ```bash
   export TEST_BASE_URL=http://localhost:8100
   export TEST_USER_EMAIL=admin@nextdocs.local
   export TEST_USER_PASSWORD=admin
   ```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# CLI tests only
npm run test:cli

# E2E tests only
npm run test:e2e

# Specific test file
npx jest tests/cli/database.test.ts
npx playwright test tests/playwright/auth.spec.ts

# Tests matching pattern
npx playwright test --grep "login"
```

### Test Reports

Generate a markdown test report:

```bash
npm run test:generate-report
```

This creates `test-results/TEST_REPORT.md` with:
- Executive summary
- Detailed test results
- Success/failure metrics
- Recommendations

View Playwright HTML report:

```bash
npm run test:report
```

## Test Configuration

### Jest Configuration

See `jest.config.js`:
- Test environment: Node
- Coverage collection from `src/`, `scripts/`, `prisma/`
- Module path mapping for `@/` imports

### Playwright Configuration

See `playwright.config.ts`:
- Tests run on Chromium, Firefox, WebKit
- Mobile testing on Pixel 5 and iPhone 12
- Screenshots on failure
- Video recording on failure
- HTML and JSON reporters

## Writing New Tests

### CLI Test Template

```typescript
/**
 * Feature Name Tests
 * Description of what is being tested
 */

import { PrismaClient } from '@prisma/client';

describe('Feature Name', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should do something', async () => {
    // Arrange
    const data = await prisma.model.findFirst();
    
    // Act
    const result = someFunction(data);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

### E2E Test Template

```typescript
/**
 * Feature E2E Tests
 * Description of user flows being tested
 */

import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should perform user action', async ({ page }) => {
    await page.goto('/feature');
    
    await expect(page.locator('h1')).toBeVisible();
    
    await page.click('button#action');
    
    await expect(page).toHaveURL(/\/success/);
  });
});
```

## Test Helpers

Use shared helpers from `tests/helpers.ts`:

```typescript
import { AuthHelper, NavigationHelper, DatabaseHelper } from '../helpers';

// Login helper
await AuthHelper.login(page, 'user@example.com', 'password');

// Search helper
await NavigationHelper.openSearch(page);

// Database helper
const db = new DatabaseHelper();
await db.createTestUser('test@example.com', 'password');
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run test:cli
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Debugging Tests

### Playwright Debugging

```bash
# Run in headed mode
npm run test:e2e:headed

# Debug specific test
npx playwright test tests/playwright/auth.spec.ts --debug

# Generate trace
npx playwright test --trace on
```

### Jest Debugging

```bash
# Run with verbose output
npx jest --verbose

# Run specific test file
npx jest tests/cli/database.test.ts

# Watch mode for development
npx jest --watch
```

## Best Practices

1. **Keep tests isolated**: Each test should be independent
2. **Use descriptive names**: Test names should explain what is being tested
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Clean up**: Remove test data after tests complete
5. **Avoid hardcoded waits**: Use proper wait conditions
6. **Test user flows**: E2E tests should mimic real user behavior
7. **Mock external services**: Don't rely on external APIs in tests
8. **Keep tests fast**: Optimize for quick feedback

## Troubleshooting

### Common Issues

**Database connection errors:**
- Ensure Docker containers are running
- Check DATABASE_URL environment variable

**Playwright browser errors:**
- Run `npx playwright install` to install browsers
- Check if port 8100 is accessible

**Type errors in tests:**
- Run `npm install` to ensure all dependencies are installed
- Check that `@types/jest` and `@playwright/test` are installed

**Flaky tests:**
- Increase timeout values
- Add proper wait conditions
- Check for race conditions

## Expanding Tests

When adding new features:

1. Create corresponding test files in `cli/` and `playwright/`
2. Add test cases covering happy path and edge cases
3. Update this README with new test coverage
4. Run tests locally before committing
5. Update test report template if needed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated:** November 22, 2025
