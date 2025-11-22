# 🔐 Secure E2E Testing - Quick Reference

## Security-First Approach

✅ **No credentials in files**  
✅ **Prompted at runtime**  
✅ **CI/CD friendly**  

## Running Tests

### Local Development

```bash
npm run test:e2e
```

You'll see:
```
=== NextDocs E2E Test Authentication ===
Please provide test user credentials

Test user email (press Enter for admin@nextdocs.local): [your-email]
Test user password (press Enter for admin): [your-password]
```

💡 **Tip**: Just press Enter twice to use defaults (`admin@nextdocs.local` / `admin`)

### CI/CD Pipeline

Set environment variables in your pipeline:
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `CI=true` (auto-set by most platforms)

No prompt will appear - uses environment variables automatically.

## Test Commands

```bash
# All tests (prompted for credentials once)
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e:headed

# UI mode (interactive debugging)
npm run test:e2e:ui

# Specific test file
npm run test:e2e tests/playwright/auth.spec.ts

# Only CLI tests (no auth needed)
npm run test:cli
```

## How Authentication Works

1. **Before tests**: Prompts for credentials (or uses CI env vars)
2. **Login**: Authenticates and saves session to `.auth/user.json`
3. **During tests**: All tests use saved session automatically
4. **After tests**: Session cleaned up (optional)

## Security Benefits

| Old Approach | New Approach ✅ |
|-------------|----------------|
| Credentials in .env | Prompted at runtime |
| Risk of git commit | Never stored in code |
| Manual cleanup | Auto cleanup |
| One-size-fits-all | CI/Local modes |

## Troubleshooting

**Q: Can I skip the prompt?**  
A: Yes! Just press Enter twice for defaults, or set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` env vars

**Q: Does this work in CI/CD?**  
A: Yes! CI mode automatically uses environment variables

**Q: Where is my password stored?**  
A: **Nowhere!** Only the authentication session (cookies) is saved temporarily

**Q: Can I use different credentials?**  
A: Yes! Type them when prompted, or set env vars

## Files

- ✅ `global-setup.ts` - Prompts & authenticates
- ✅ `global-teardown.ts` - Cleanup
- ✅ `.auth/user.json` - Session only (git-ignored)
- ❌ No credential files needed!

---

**Need help?** See `tests/AUTHENTICATION.md` for complete guide
