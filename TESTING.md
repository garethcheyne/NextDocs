# 🧪 NextDocs Test Suite

## Comprehensive Testing Infrastructure

This project now includes a **production-ready test suite** with 110+ automated tests covering all major functionality.

---

## 🚀 Quick Test Commands

```bash
# Run all tests
npm test

# Run CLI/unit tests
npm run test:cli

# Run E2E browser tests
npm run test:e2e

# Run E2E with visible browser
npm run test:e2e:headed

# Open interactive test UI
npm run test:e2e:ui

# Generate test report
npm run test:generate-report
```

---

## 📊 Test Coverage

### ✅ CLI/Unit Tests (Jest) - 30+ tests
- Database integrity and schema validation
- Full-text and vector search functionality
- Authentication and authorization
- Repository sync (GitHub/Azure DevOps)
- Content management (blog, API specs, features)

### ✅ E2E Browser Tests (Playwright) - 80+ tests
- Authentication flows
- Homepage and navigation
- Documentation viewing
- Global search
- Blog posts
- API specifications
- Feature requests
- Admin panel

---

## 📁 Test Files Location

```
tests/
├── cli/                 # Jest unit tests
├── playwright/          # E2E browser tests
├── helpers.ts          # Shared utilities
├── README.md           # Full documentation
└── QUICK_START.md      # Quick reference
```

---

## 📖 Documentation

- **[Test Suite Summary](./TEST_SUITE_SUMMARY.md)** - Overview of what was created
- **[Full Test Documentation](./tests/README.md)** - Complete testing guide
- **[Quick Start Guide](./tests/QUICK_START.md)** - Fast setup and common tasks
- **[Initial Setup Report](./test-results/INITIAL_SETUP_REPORT.md)** - Detailed setup info

---

## 🎯 First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   npx playwright install --with-deps
   ```

2. **Start the application:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run your first E2E test:**
   ```bash
   npm run test:e2e
   ```
   
   **You'll be prompted for credentials:**

   ```text
   Test user email (press Enter for admin@nextdocs.local): ⏎
   Test user password (press Enter for admin): ⏎
   ```
   
   💡 **Just press Enter twice** to use the default admin credentials!

4. **View results:**

   ```bash
   npm run test:report
   ```

---

## ✨ Features

- ✅ Multi-browser testing (Chrome, Firefox, Safari)
- ✅ Mobile device testing (iPhone, Pixel)
- ✅ Screenshot and video on failure
- ✅ Automated markdown reports
- ✅ Reusable test utilities
- ✅ Comprehensive documentation
- ✅ CI/CD ready
- ✅ **Secure credential prompting** (no passwords stored in files!)

---

## 🔐 Security

**Credentials are NEVER stored in files!**

- E2E tests prompt for credentials at runtime
- Only authentication sessions are cached temporarily
- CI/CD uses environment variables automatically
- See [tests/AUTHENTICATION.md](./tests/AUTHENTICATION.md) for details

---

## 📚 Learn More

See the complete documentation in the [tests/](./tests/) directory for:
- Writing new tests
- Debugging failed tests
- Configuration options
- Best practices
- Troubleshooting guide

---

**Ready to test!** 🎉
