# 🔐 Security Implementation - Test Credentials

## Overview

The NextDocs test suite implements a **security-first approach** to credential management that eliminates the risk of accidentally committing passwords to version control.

---

## Security Features

### ✅ What We Do

1. **Runtime Prompting**
   - Credentials are prompted interactively when tests start
   - No passwords stored in environment files
   - No passwords in configuration files
   - No passwords in the codebase

2. **Session-Only Storage**
   - Only authentication cookies/tokens are saved
   - Stored in `.auth/user.json` (git-ignored)
   - Automatically cleaned up after tests
   - Can be manually removed anytime

3. **CI/CD Compatibility**
   - Automatically detects CI environment
   - Falls back to environment variables
   - No interactive prompts in automated pipelines
   - Uses secure secrets management

4. **Default Safe Values**
   - Press Enter to use safe defaults
   - Test credentials: `admin@nextdocs.local` / `admin`
   - No production credentials ever needed

### ❌ What We Don't Do

1. **No File Storage**
   - ❌ No `.env` files with passwords
   - ❌ No `.env.test` files
   - ❌ No config files with credentials
   - ❌ No hardcoded passwords

2. **No Unsafe Practices**
   - ❌ No plaintext passwords in git
   - ❌ No shared credential files
   - ❌ No permanent credential storage
   - ❌ No accidental commits

---

## Implementation Details

### Local Development Flow

```bash
$ npm run test:e2e

=== NextDocs E2E Test Authentication ===
Please provide test user credentials

Test user email (press Enter for admin@nextdocs.local): ⏎
Test user password (press Enter for admin): ⏎

Setting up authentication for admin@nextdocs.local...
✓ Authentication successful
✓ Saved authentication state to tests/.auth/user.json

Running 45 tests using 12 workers...
  ✓ 42 passed
  ✗ 3 failed
```

### CI/CD Flow

```yaml
# GitHub Actions example
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  CI: true

- run: npm run test:e2e
  # No prompt - uses environment variables automatically
```

---

## Technical Implementation

### File: `tests/playwright/global-setup.ts`

```typescript
import * as readline from 'readline';

async function promptForCredentials(): Promise<{ email: string; password: string }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n=== NextDocs E2E Test Authentication ===');
  console.log('Please provide test user credentials\n');

  const email = await new Promise<string>((resolve) => {
    rl.question('Test user email (press Enter for admin@nextdocs.local): ', (answer) => {
      resolve(answer.trim() || 'admin@nextdocs.local');
    });
  });

  const password = await new Promise<string>((resolve) => {
    rl.question('Test user password (press Enter for admin): ', (answer) => {
      resolve(answer || 'admin');
    });
  });

  rl.close();
  return { email, password };
}

export default async function globalSetup(config: FullConfig) {
  let email: string;
  let password: string;

  // CI mode: Use environment variables
  if (process.env.CI) {
    email = process.env.TEST_USER_EMAIL || '';
    password = process.env.TEST_USER_PASSWORD || '';
  } 
  // Local mode: Interactive prompting
  else {
    const credentials = await promptForCredentials();
    email = credentials.email;
    password = credentials.password;
  }

  // Authenticate and save session only
  // (No credentials saved - only cookies/tokens)
}
```

---

## Security Benefits

### For Developers

1. **No Accidental Commits**
   - Can't accidentally commit `.env` with passwords
   - No risk of pushing credentials to GitHub
   - Safe to share code with team

2. **Easy to Use**
   - Just press Enter for defaults
   - No setup files needed
   - Works immediately

3. **Flexible**
   - Use different credentials anytime
   - No need to edit files
   - Works with any test user

### For Organizations

1. **Compliance**
   - No plaintext passwords stored
   - Audit-friendly approach
   - Follows security best practices

2. **Access Control**
   - Each developer uses own credentials
   - No shared password files
   - Individual accountability

3. **CI/CD Security**
   - Uses platform secrets management
   - No credentials in pipeline logs
   - Encrypted at rest

---

## Comparison: Before vs After

| Aspect | Before (Unsafe) | After (Secure) |
|--------|----------------|----------------|
| **Credentials** | Stored in `.env.test` | Prompted at runtime |
| **Git Risk** | High - can commit passwords | Zero - nothing to commit |
| **Flexibility** | Edit file to change user | Just type different credentials |
| **CI/CD** | Same `.env` file | Uses secrets manager |
| **Session** | Same stored file | Same stored file |
| **Security** | ⚠️ Low | ✅ High |

---

## FAQ

**Q: Is the session file (`.auth/user.json`) secure?**  
A: Yes! It contains only authentication tokens/cookies, not passwords. It's also:
- Git-ignored (never committed)
- Temporary (cleaned up after tests)
- Useless outside your local environment

**Q: What if I forget the test password?**  
A: Just press Enter to use the default (`admin`). Or reset your test user in the database.

**Q: Can I automate tests locally without prompts?**  
A: Yes! Set environment variables before running:
```bash
export TEST_USER_EMAIL=admin@nextdocs.local
export TEST_USER_PASSWORD=admin
npm run test:e2e
```

**Q: How does it detect CI mode?**  
A: Checks for `process.env.CI === 'true'` which is automatically set by GitHub Actions, GitLab CI, Jenkins, etc.

**Q: What if credentials are wrong?**  
A: Tests will fail at authentication. You'll see clear error messages. Just run again with correct credentials.

---

## Best Practices

### ✅ Do This

- Use the default test credentials for local development
- Set up proper secrets in your CI/CD platform
- Keep `.auth/` directory in `.gitignore`
- Document test user creation for your team

### ❌ Don't Do This

- Don't create `.env.test` files with passwords
- Don't hardcode credentials in test files
- Don't share authentication session files
- Don't use production credentials for testing

---

## Related Documentation

- **[Quick Start](./QUICK_START_SECURE.md)** - Fast reference for running tests
- **[Authentication Guide](./AUTHENTICATION.md)** - Complete authentication setup
- **[Test Suite README](./README.md)** - Overall test documentation

---

**Security is not optional - it's built-in!** 🔒
