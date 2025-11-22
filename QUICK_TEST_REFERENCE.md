# 🚀 NextDocs Testing - Quick Commands

## Run Tests

```bash
# All tests (CLI + E2E)
npm test

# Just E2E tests (you'll be prompted for login)
npm run test:e2e

# Watch browser while testing
npm run test:e2e:headed

# Interactive test UI (best for debugging)
npm run test:e2e:ui

# Just CLI/unit tests (no auth needed)
npm run test:cli
```

---

## First Time? Start Here!

```bash
# 1. Install dependencies
npm install
npx playwright install --with-deps

# 2. Make sure app is running
docker-compose -f docker-compose.prod.yml up -d

# 3. Run tests (press Enter twice when prompted)
npm run test:e2e
```

**When prompted for credentials, just press Enter twice!**
- Email: `admin@nextdocs.local` (default)
- Password: `admin` (default)

---

## View Results

```bash
# HTML report
npm run test:report

# Generate markdown report
npm run test:generate-report

# Results saved to
cat test-results/latest-report.md
```

---

## Common Tasks

### Run Specific Test File

```bash
# Single test file
npx playwright test tests/playwright/homepage.spec.ts

# With visible browser
npx playwright test tests/playwright/homepage.spec.ts --headed
```

### Debug Failing Test

```bash
# Interactive UI mode
npm run test:e2e:ui

# Then click on failing test to see details
```

### Use Different Credentials

When prompted, type your credentials instead of pressing Enter:

```bash
npm run test:e2e
# Email: youruser@test.com
# Password: yourpassword
```

### Skip Credential Prompt

Set environment variables first:

```bash
export TEST_USER_EMAIL=admin@nextdocs.local
export TEST_USER_PASSWORD=admin
npm run test:e2e
```

---

## Troubleshooting

### "Authentication failed"

Check:
1. Is app running? `docker ps`
2. Does test user exist? `npm run db:studio`
3. Are credentials correct?

### "Can't connect to database"

```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps

# Restart if needed
docker-compose -f docker-compose.prod.yml restart postgres
```

### Tests timeout

```bash
# Increase timeout in playwright.config.ts
use: {
  actionTimeout: 30000,  # Change this
}
```

---

## File Locations

```
tests/
├── cli/              # Jest unit tests
├── playwright/       # E2E browser tests
├── README.md         # Full documentation
└── QUICK_START.md    # Quick reference

TESTING.md            # Main testing overview
```

---

## Documentation

- **Quick Start:** `tests/QUICK_START_SECURE.md`
- **Full Guide:** `tests/README.md`
- **Authentication:** `tests/AUTHENTICATION.md`
- **Security:** `tests/SECURITY_IMPLEMENTATION.md`
- **Summary:** `IMPLEMENTATION_SUMMARY.md`

---

## Need Help?

1. Check `tests/README.md` for detailed guides
2. Run with `--headed` to see what's happening
3. Use `--ui` mode for interactive debugging
4. Look at screenshots in `test-results/` folder

---

**Remember: Security first! Credentials are never stored in files.** 🔐
