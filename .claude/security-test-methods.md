# Security Test Methods

Reusable security test commands for NextDocs penetration testing.

**Target:** https://docs.err403.com/
**Last Updated:** December 15, 2025

---

## Prerequisites

- `curl` command available
- Access to target URL
- Authorization from project owner

---

## Authentication for Internal Tests

Many tests require authentication. Here's how to obtain credentials for testing:

### Option 1: Session Cookie (Recommended for Manual Testing)

1. Log into https://docs.err403.com via browser
2. Open DevTools (F12) → Application → Cookies
3. Copy the `next-auth.session-token` value
4. Use in curl:

```bash
# Set as variable
export SESSION="your-session-token-here"

# Use in requests
curl -s "https://docs.err403.com/api/features" \
  -H "Cookie: next-auth.session-token=$SESSION"
```

### Option 2: API Key (Recommended for Automation)

If you have API keys enabled:

```bash
# Set API key
export API_KEY="your-api-key-here"

# Use in requests
curl -s "https://docs.err403.com/api/features" \
  -H "X-API-Key: $API_KEY"
```

### Option 3: Test Account Credentials

Create a dedicated test account for security testing:

```bash
# Store in .env.test (DO NOT COMMIT)
TEST_EMAIL=security-test@yourcompany.com
TEST_PASSWORD=SecureTestPassword123!

# Get CSRF token first
CSRF=$(curl -s "https://docs.err403.com/api/auth/csrf" | jq -r '.csrfToken')

# Authenticate (note: rate limiting applies)
curl -s -X POST "https://docs.err403.com/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -c cookies.txt \
  -d "csrfToken=$CSRF&email=$TEST_EMAIL&password=$TEST_PASSWORD"

# Use cookie file for subsequent requests
curl -s "https://docs.err403.com/api/features" -b cookies.txt
```

### Option 4: Token Files for Claude Code (Recommended)

Two token files are set up in `.claude/` directory (gitignored):

```
.claude/session-token-user.txt   # Regular user session
.claude/session-token-admin.txt  # Admin user session
```

**To set up:**
1. Log in as regular user → copy token → paste in `session-token-user.txt`
2. Log in as admin → copy token → paste in `session-token-admin.txt`

**Claude Code can then read these files and use them for authenticated tests.**

```bash
# Manual usage
USER_TOKEN=$(cat .claude/session-token-user.txt | grep -v "^#" | tr -d '\n')
ADMIN_TOKEN=$(cat .claude/session-token-admin.txt | grep -v "^#" | tr -d '\n')

# Test as user
curl -s "https://docs.err403.com/api/features" \
  -H "Cookie: next-auth.session-token=$USER_TOKEN"

# Test as admin
curl -s "https://docs.err403.com/api/admin/analytics/metrics" \
  -H "Cookie: next-auth.session-token=$ADMIN_TOKEN"
```

### Security Notes

- **Never commit credentials** to git
- **Use dedicated test accounts** with minimal permissions
- **Rotate test credentials** regularly
- **Rate limiting applies** - wait between auth attempts
- **Session tokens expire** - refresh as needed (default 30 days)

---

## 1. SQL Injection Tests

### Search API Injection
```bash
# Test search endpoint with SQL injection payload
curl -s "https://docs.err403.com/api/search?q=test'--" -w "\nHTTP: %{http_code}"

# Test features API with injection
curl -s "https://docs.err403.com/api/features?q=test'%20OR%201=1--" -w "\nHTTP: %{http_code}"
```

### Expected Results
- Should return 307 redirect (requires auth) or proper error handling
- No SQL error messages exposed

---

## 2. XSS Vulnerability Tests

### URL Parameter Injection
```bash
# Test XSS via callback URL
curl -s "https://docs.err403.com/login?callbackUrl=javascript:alert(1)" | grep -i "javascript\|alert"

# Test XSS via error parameter
curl -s "https://docs.err403.com/login?error=test%3Cscript%3Ealert(1)%3C/script%3E" | grep -i "script\|alert"

# Test XSS via search parameter (encoded)
curl -s "https://docs.err403.com/login?error=%3Cimg%20src=x%20onerror=alert(1)%3E" | grep -i "onerror\|img"
```

### Expected Results
- No injected scripts should appear in HTML output
- Payloads should be escaped or filtered

---

## 3. Authentication Tests

### CSRF Token Validation
```bash
# Get CSRF token
curl -s "https://docs.err403.com/api/auth/csrf"

# Test login with invalid CSRF
curl -s -X POST "https://docs.err403.com/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=invalid&email=admin@test.com&password=admin" \
  -w "\nHTTP: %{http_code}"
```

### Session Check
```bash
# Check session endpoint (should return null when unauthenticated)
curl -s "https://docs.err403.com/api/auth/session"

# Check auth providers
curl -s "https://docs.err403.com/api/auth/providers"
```

### Expected Results
- Invalid CSRF should be rejected
- Session should return `null` for unauthenticated requests

---

## 4. Authorization/IDOR Tests

### Direct Object Reference
```bash
# Test feature access without auth
curl -s "https://docs.err403.com/api/features/nonexistent-id" -w "\nHTTP: %{http_code}"

# Test feature page access
curl -s "https://docs.err403.com/features/test-feature-slug" -w "\nHTTP: %{http_code}"

# Test admin endpoint access
curl -s "https://docs.err403.com/admin" -w "\nHTTP: %{http_code}"

# Test search API without auth
curl -s "https://docs.err403.com/api/search?q=test" -w "\nHTTP: %{http_code}"
```

### Expected Results
- All should return 307 redirect to login
- No data exposed without authentication

---

## 5. Path Traversal Tests

### Directory Traversal Attempts
```bash
# Via img route
curl -s "https://docs.err403.com/img/..%2F..%2Fetc%2Fpasswd" -w "\nHTTP: %{http_code}"

# Via images API
curl -s "https://docs.err403.com/api/images/..%2F..%2F..%2Fetc%2Fpasswd" -w "\nHTTP: %{http_code}"

# Via docs route
curl -s "https://docs.err403.com/docs/..%2F..%2Fetc%2Fpasswd" -w "\nHTTP: %{http_code}"

# Double encoding
curl -s "https://docs.err403.com/img/..%252F..%252Fetc%252Fpasswd" -w "\nHTTP: %{http_code}"
```

### Expected Results
- Should return 400 Bad Request (Cloudflare WAF block)
- No file contents exposed

---

## 6. Rate Limiting Tests

### Authentication Brute Force
```bash
# Run 8 rapid login attempts (should trigger rate limit after 5)
for i in {1..8}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST \
    "https://docs.err403.com/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=test@test.com&password=wrong"
done
```

### Expected Results
- First 5 attempts: HTTP 302 (normal auth flow)
- Attempts 6+: HTTP 429 (Too Many Requests)

---

## 7. Sensitive Data Exposure Tests

### Configuration File Access
```bash
# Environment file
curl -s "https://docs.err403.com/.env" -w "\nHTTP: %{http_code}"

# Git config
curl -s "https://docs.err403.com/.git/config" -w "\nHTTP: %{http_code}"

# Git HEAD
curl -s "https://docs.err403.com/.git/HEAD" -w "\nHTTP: %{http_code}"

# Package.json (may be intentionally exposed)
curl -s "https://docs.err403.com/package.json" -w "\nHTTP: %{http_code}"

# Next.js build manifest
curl -s "https://docs.err403.com/_next/static/" -w "\nHTTP: %{http_code}"
```

### Expected Results
- `.env`, `.git/*` should return 404
- No sensitive configuration exposed

---

## 8. Security Headers Check

### Verify All Headers
```bash
curl -s -I "https://docs.err403.com/" | grep -iE \
  "x-frame|x-content|strict-transport|content-security|x-xss|referrer-policy|permissions-policy"
```

### Expected Headers
```
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
x-xss-protection: 1; mode=block
strict-transport-security: max-age=31536000; includeSubDomains
content-security-policy: [full policy]
```

---

## 9. Webhook Security Tests

### GitHub Webhook
```bash
# Without signature
curl -s -X POST "https://docs.err403.com/api/webhooks/github" \
  -H "Content-Type: application/json" \
  -d '{"action":"test"}' \
  -w "\nHTTP: %{http_code}"

# With invalid signature
curl -s -X POST "https://docs.err403.com/api/webhooks/github" \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=invalid" \
  -d '{"action":"test"}' \
  -w "\nHTTP: %{http_code}"
```

### Expected Results
- Should return 401 Unauthorized (signature verification failed)

---

## 10. Information Disclosure Tests

### Error Messages
```bash
# Invalid API endpoint
curl -s "https://docs.err403.com/api/nonexistent" -w "\nHTTP: %{http_code}"

# Health endpoint
curl -s "https://docs.err403.com/api/health" -w "\nHTTP: %{http_code}"

# Manifest file (acceptable exposure)
curl -s "https://docs.err403.com/manifest.json"

# Robots.txt
curl -s "https://docs.err403.com/robots.txt"
```

### Expected Results
- No stack traces in error responses
- No internal paths or sensitive info exposed

---

## Full Test Script

Run all tests in sequence:

```bash
#!/bin/bash
# security-test.sh
# Run from project root

TARGET="https://docs.err403.com"

echo "=== Security Test Suite ==="
echo "Target: $TARGET"
echo "Date: $(date)"
echo ""

echo "--- 1. SQL Injection ---"
curl -s "$TARGET/api/search?q=test'--" -w "HTTP: %{http_code}\n" | tail -1

echo "--- 2. XSS Test ---"
curl -s "$TARGET/login?error=%3Cscript%3Ealert(1)%3C/script%3E" | grep -c "script" && echo "FAIL: XSS found" || echo "PASS"

echo "--- 3. Auth Test ---"
curl -s "$TARGET/api/auth/session"
echo ""

echo "--- 4. Path Traversal ---"
curl -s "$TARGET/img/..%2F..%2Fetc%2Fpasswd" -w "HTTP: %{http_code}\n" | tail -1

echo "--- 5. Sensitive Files ---"
curl -s "$TARGET/.env" -w "HTTP: %{http_code}\n" | tail -1
curl -s "$TARGET/.git/config" -w "HTTP: %{http_code}\n" | tail -1

echo "--- 6. Security Headers ---"
curl -s -I "$TARGET/" | grep -c "x-frame-options"
curl -s -I "$TARGET/" | grep -c "content-security-policy"

echo "--- 7. Rate Limiting ---"
for i in {1..6}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "$TARGET/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=test@test.com&password=wrong")
  echo "Attempt $i: $CODE"
done

echo ""
echo "=== Test Complete ==="
```

---

---

## 11. Cookie Security Tests

### Check Cookie Flags
```bash
# Get cookies and check security flags
curl -s -I -c - "https://docs.err403.com/login" 2>&1 | grep -i "set-cookie"

# Check for session cookie attributes
curl -s -I "https://docs.err403.com/api/auth/session" -c - 2>&1 | grep -i "set-cookie"
```

### Expected Results
- `Secure` flag present (HTTPS only)
- `HttpOnly` flag present (no JS access)
- `SameSite=Lax` or `SameSite=Strict`

---

## 12. CORS Misconfiguration Tests

### Test CORS Headers
```bash
# Test with arbitrary origin
curl -s -I "https://docs.err403.com/api/auth/session" \
  -H "Origin: https://evil.com" | grep -i "access-control"

# Test with null origin
curl -s -I "https://docs.err403.com/api/auth/session" \
  -H "Origin: null" | grep -i "access-control"

# Test preflight request
curl -s -X OPTIONS "https://docs.err403.com/api/features" \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -I | grep -i "access-control"
```

### Expected Results
- Should NOT reflect arbitrary origins
- `Access-Control-Allow-Origin` should be specific, not `*`

---

## 13. HTTP Method Testing

### Test Dangerous Methods
```bash
# Test TRACE method (can expose cookies)
curl -s -X TRACE "https://docs.err403.com/" -w "\nHTTP: %{http_code}"

# Test OPTIONS to see allowed methods
curl -s -X OPTIONS "https://docs.err403.com/api/features" -I | grep -i "allow"

# Test PUT on read-only endpoint
curl -s -X PUT "https://docs.err403.com/api/auth/session" -w "\nHTTP: %{http_code}"

# Test DELETE on protected resource
curl -s -X DELETE "https://docs.err403.com/api/features/test-id" -w "\nHTTP: %{http_code}"
```

### Expected Results
- TRACE should be disabled (405 or 400)
- Only necessary methods allowed

---

## 14. Open Redirect Tests

### Test Redirect Vulnerabilities
```bash
# Test callbackUrl with external URL
curl -s -I "https://docs.err403.com/login?callbackUrl=https://evil.com" | grep -i "location"

# Test with protocol-relative URL
curl -s -I "https://docs.err403.com/login?callbackUrl=//evil.com" | grep -i "location"

# Test with encoded URL
curl -s -I "https://docs.err403.com/login?callbackUrl=https%3A%2F%2Fevil.com" | grep -i "location"

# Test after auth redirect
curl -s -I "https://docs.err403.com/api/auth/signin?callbackUrl=https://evil.com" | grep -i "location"
```

### Expected Results
- Should NOT redirect to external domains
- Callbacks should be validated to same-origin

---

## 15. File Upload Tests

### Test Malicious Upload (requires auth)
```bash
# Test file extension bypass
curl -s -X POST "https://docs.err403.com/api/upload/images" \
  -F "file=@malicious.php.jpg" \
  -w "\nHTTP: %{http_code}"

# Test double extension
curl -s -X POST "https://docs.err403.com/api/upload/images" \
  -F "file=@test.jpg.php" \
  -w "\nHTTP: %{http_code}"

# Test null byte injection
curl -s -X POST "https://docs.err403.com/api/upload/images" \
  -F "file=@test.php%00.jpg" \
  -w "\nHTTP: %{http_code}"

# Test SVG with embedded script
echo '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>' > test.svg
curl -s -X POST "https://docs.err403.com/api/upload/images" \
  -F "file=@test.svg" \
  -w "\nHTTP: %{http_code}"
```

### Expected Results
- Only valid image types accepted
- Magic byte validation should reject fake images
- SVG uploads should be blocked or sanitized

---

## 16. Admin Privilege Escalation Tests

### Test Role Bypass
```bash
# Test admin endpoint without admin role (requires regular user session)
# Replace COOKIE with actual session cookie
curl -s "https://docs.err403.com/admin" \
  -H "Cookie: next-auth.session-token=USER_SESSION" \
  -w "\nHTTP: %{http_code}"

# Test admin API endpoint
curl -s "https://docs.err403.com/api/admin/analytics/metrics" \
  -H "Cookie: next-auth.session-token=USER_SESSION" \
  -w "\nHTTP: %{http_code}"

# Test role parameter injection
curl -s -X POST "https://docs.err403.com/api/features" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=USER_SESSION" \
  -d '{"title":"test","role":"admin"}' \
  -w "\nHTTP: %{http_code}"
```

### Expected Results
- Non-admin users should get 403 Forbidden
- Role cannot be injected via request body

---

## 17. Azure DevOps Webhook Tests

### Test Azure DevOps Webhook Security
```bash
# Without authentication
curl -s -X POST "https://docs.err403.com/api/webhooks/azure-devops" \
  -H "Content-Type: application/json" \
  -d '{"eventType":"workitem.updated"}' \
  -w "\nHTTP: %{http_code}"

# With invalid authorization
curl -s -X POST "https://docs.err403.com/api/webhooks/azure-devops" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic invalid" \
  -d '{"eventType":"workitem.updated"}' \
  -w "\nHTTP: %{http_code}"
```

### Expected Results
- Should return 401 Unauthorized without valid credentials

---

## 18. SSL/TLS Configuration Tests

### Test SSL Configuration
```bash
# Check SSL certificate
curl -sI "https://docs.err403.com" -v 2>&1 | grep -E "SSL|TLS|certificate"

# Test for SSL stripping (should redirect)
curl -s -I "http://docs.err403.com" | grep -i "location"

# Check supported TLS versions (requires openssl)
openssl s_client -connect docs.err403.com:443 -tls1_2 < /dev/null 2>&1 | grep "Protocol"
openssl s_client -connect docs.err403.com:443 -tls1_3 < /dev/null 2>&1 | grep "Protocol"

# Check for weak ciphers
nmap --script ssl-enum-ciphers -p 443 docs.err403.com
```

### Expected Results
- Valid SSL certificate
- HTTP redirects to HTTPS
- TLS 1.2 or 1.3 only
- No weak ciphers

---

## 19. API Key Security Tests

### Test API Key Endpoints
```bash
# Test API key creation without auth
curl -s -X POST "https://docs.err403.com/api/admin/api-keys" \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}' \
  -w "\nHTTP: %{http_code}"

# Test API key listing
curl -s "https://docs.err403.com/api/admin/api-keys" \
  -w "\nHTTP: %{http_code}"

# Test with invalid API key header
curl -s "https://docs.err403.com/api/features" \
  -H "X-API-Key: invalid-key" \
  -w "\nHTTP: %{http_code}"

# Test API key in URL (should not work)
curl -s "https://docs.err403.com/api/features?api_key=test" \
  -w "\nHTTP: %{http_code}"
```

### Expected Results
- API key endpoints require admin auth
- Invalid API keys rejected
- API keys should not be accepted via URL

---

## 20. Content-Type Bypass Tests

### Test API Content-Type Handling
```bash
# Send JSON as form data
curl -s -X POST "https://docs.err403.com/api/features" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'title=test&description=test' \
  -w "\nHTTP: %{http_code}"

# Send with wrong content type
curl -s -X POST "https://docs.err403.com/api/features" \
  -H "Content-Type: text/plain" \
  -d '{"title":"test"}' \
  -w "\nHTTP: %{http_code}"

# Send XML to JSON endpoint
curl -s -X POST "https://docs.err403.com/api/features" \
  -H "Content-Type: application/xml" \
  -d '<feature><title>test</title></feature>' \
  -w "\nHTTP: %{http_code}"
```

### Expected Results
- API should validate content type
- Reject unexpected formats

---

## 21. JWT/Session Token Tests

### Test Token Security
```bash
# Try to decode session token (check if JWT)
# Copy token from browser and decode at jwt.io or:
echo "YOUR_SESSION_TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null

# Test expired/modified token
curl -s "https://docs.err403.com/api/auth/session" \
  -H "Cookie: next-auth.session-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" \
  -w "\nHTTP: %{http_code}"
```

### Expected Results
- Modified tokens should be rejected
- Expired tokens should not work

---

## 22. Account Enumeration Tests

### Test User Enumeration
```bash
# Test with existing vs non-existing email
# Response time and message should be identical

# Time the response for existing email pattern
time curl -s -X POST "https://docs.err403.com/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@company.com&password=wrong"

# Time the response for non-existing email
time curl -s -X POST "https://docs.err403.com/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=nonexistent123456@fake.com&password=wrong"
```

### Expected Results
- Response time should be similar (no timing attack)
- Error message should be generic ("Invalid credentials")

---

## 23. Mass Assignment Tests

### Test Mass Assignment Vulnerability
```bash
# Try to set admin role during registration/update
curl -s -X POST "https://docs.err403.com/api/features" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=USER_SESSION" \
  -d '{"title":"test","isAdmin":true,"role":"admin","userId":"other-user-id"}' \
  -w "\nHTTP: %{http_code}"

# Try to modify protected fields
curl -s -X PUT "https://docs.err403.com/api/user/profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=USER_SESSION" \
  -d '{"role":"admin","id":"different-id","createdAt":"2020-01-01"}' \
  -w "\nHTTP: %{http_code}"
```

### Expected Results
- Protected fields should be ignored
- Role/permissions cannot be set by user

---

## Notes

1. **Rate Limiting**: Wait 5 minutes between rate limit tests to reset the counter
2. **Cloudflare**: Some tests may be blocked by Cloudflare WAF, which is expected behavior
3. **Authentication**: IDOR tests require authenticated sessions for full coverage
4. **Production**: Only run these tests on systems you own or have explicit authorization to test
5. **Session Tokens**: Some tests require valid session cookies - get from browser DevTools
6. **Timing**: Some tests may need to be run multiple times to verify consistent behavior

---

## Quick Reference

| # | Test | Command | Expected |
|---|------|---------|----------|
| 1 | SQL Injection | `curl /api/search?q=test'--` | 307 or error |
| 2 | XSS | `curl /login?error=<script>` | No reflection |
| 3 | Auth/CSRF | `curl /api/auth/session` | null |
| 4 | IDOR | `curl /api/features/other-id` | 307/403 |
| 5 | Path Traversal | `curl /img/..%2F..%2Fetc%2Fpasswd` | 400 |
| 6 | Rate Limit | 6 rapid POST to auth | 429 on 6th |
| 7 | Sensitive Files | `curl /.env` | 404 |
| 8 | Headers | `curl -I /` | All headers present |
| 9 | Webhook | `POST /api/webhooks/github` | 401 |
| 10 | Info Disclosure | `curl /api/nonexistent` | No stack trace |
| 11 | Cookie Security | Check Set-Cookie header | Secure; HttpOnly |
| 12 | CORS | `curl -H "Origin: evil.com"` | No reflection |
| 13 | HTTP Methods | `curl -X TRACE /` | 405 |
| 14 | Open Redirect | `?callbackUrl=evil.com` | No external redirect |
| 15 | File Upload | Upload .php.jpg | Rejected |
| 16 | Privilege Escalation | User access /admin | 403 |
| 17 | Azure Webhook | `POST /api/webhooks/azure-devops` | 401 |
| 18 | SSL/TLS | `openssl s_client` | TLS 1.2+ |
| 19 | API Keys | `curl -H "X-API-Key: invalid"` | 401 |
| 20 | Content-Type | Send XML to JSON endpoint | 400 |
| 21 | JWT Token | Modified token | Rejected |
| 22 | User Enum | Timing attack | Same response time |
| 23 | Mass Assignment | `{"role":"admin"}` | Ignored |

---

## Test Categories Summary

| Category | Tests | Priority |
|----------|-------|----------|
| Injection | 1, 2 | Critical |
| Authentication | 3, 6, 21, 22 | Critical |
| Authorization | 4, 16, 23 | High |
| Data Exposure | 7, 10, 19 | High |
| Configuration | 8, 11, 12, 13, 18 | Medium |
| Input Validation | 5, 14, 15, 20 | Medium |
| Webhooks | 9, 17 | Medium |
