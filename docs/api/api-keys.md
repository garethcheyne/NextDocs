# API Key Management API

Complete API documentation for NextDocs API key management system. This API allows administrators to manage programmatic access to the NextDocs platform.

## Overview :key:

The API Key Management system provides secure, tokenized access to NextDocs APIs without requiring interactive OAuth authentication. Perfect for:

- **CI/CD Pipelines** - Automated content updates
- **Integrations** - Third-party system connections  
- **Scripts** - Batch operations and maintenance
- **Webhooks** - External system notifications

## Base URL

```
https://your-nextdocs-instance.com/api/admin/api-keys
```

## Authentication :lock:

All API key management endpoints require:
- **Admin Role** - Only users with admin privileges can manage API keys
- **Session Authentication** - Standard NextDocs login session

## Permissions Model

API keys can have two permission levels:

| Permission | Description | Access |
|------------|-------------|---------|
| `read` | Read-only access | GET endpoints, list/view operations |
| `write` | Full access | All HTTP methods, create/update/delete |

## Endpoints

### List API Keys

Get all API keys created by the authenticated admin.

```http
GET /api/admin/api-keys
```

**Response Schema:**
```json
[
  {
    "id": "api_key_uuid",
    "name": "CI/CD Pipeline Key",
    "description": "For automated documentation updates",
    "keyPreview": "nxd_1234...5678",
    "permissions": "write",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "lastUsedAt": "2024-12-14T10:30:00.000Z",
    "isActive": true,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-12-14T10:30:00.000Z"
  }
]
```

### Create API Key

Generate a new API key with specified permissions and expiration.

```http
POST /api/admin/api-keys
```

**Request Body:**
```json
{
  "name": "Integration Key",
  "description": "For external system integration",
  "permissions": "read",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

**Response Schema:**
```json
{
  "id": "api_key_uuid",
  "name": "Integration Key", 
  "description": "For external system integration",
  "keyPreview": "nxd_abcd...wxyz",
  "permissions": "read",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "lastUsedAt": null,
  "isActive": true,
  "createdAt": "2024-12-14T15:30:00.000Z",
  "updatedAt": "2024-12-14T15:30:00.000Z",
  "key": "nxd_abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz567890abcdef"
}
```

> **⚠️ Important**: The full `key` is only returned once during creation. Store it securely!

### Update API Key

Modify an existing API key (currently only supports enabling/disabling).

```http
PATCH /api/admin/api-keys/{id}
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:** Returns updated API key object (same schema as GET).

### Delete API Key

Permanently delete an API key.

```http
DELETE /api/admin/api-keys/{id}
```

**Response:**
```json
{
  "success": true
}
```

## Using API Keys :computer:

Once created, API keys can be used to authenticate with NextDocs APIs in two ways:

### Authorization Header (Recommended)
```bash
curl -H "Authorization: Bearer nxd_your_api_key_here" \
     https://your-nextdocs-instance.com/api/features
```

### X-API-Key Header
```bash
curl -H "X-API-Key: nxd_your_api_key_here" \
     https://your-nextdocs-instance.com/api/features
```

## Error Responses :exclamation:

All endpoints follow standard HTTP status codes:

| Status | Meaning | Description |
|--------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Admin authentication required |
| 404 | Not Found | API key not found |
| 500 | Internal Error | Server error |

**Error Response Format:**
```json
{
  "error": "Description of what went wrong"
}
```

## Security Considerations :shield:

### Key Format
- **Prefix**: `nxd_` for easy identification
- **Length**: 64 hexadecimal characters
- **Entropy**: Cryptographically secure random generation
- **Hashing**: SHA-256 hashed before database storage

### Best Practices
1. **Principle of Least Privilege** - Use `read` permissions unless write access is required
2. **Regular Rotation** - Set reasonable expiration dates and rotate keys periodically
3. **Secure Storage** - Store keys in environment variables or secure vaults
4. **Monitor Usage** - Check `lastUsedAt` timestamps to identify unused keys
5. **Immediate Revocation** - Disable or delete compromised keys immediately

### Rate Limiting
API keys are subject to the same rate limits as regular user sessions. Monitor usage to avoid hitting limits.

## Examples :rocket:

### CI/CD Pipeline Integration

```yaml
# .github/workflows/update-docs.yml
name: Update Documentation
on:
  push:
    paths: ['docs/**']
    
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.NEXTDOCS_API_KEY }}" \
            -H "Content-Type: application/json" \
            https://docs.company.com/api/repositories/sync
```

### Monitoring Script

```python
import requests
import os

API_KEY = os.environ['NEXTDOCS_API_KEY']
BASE_URL = 'https://docs.company.com/api'

headers = {'Authorization': f'Bearer {API_KEY}'}

# Check system health
response = requests.get(f'{BASE_URL}/health', headers=headers)
print(f"System Status: {response.json()['status']}")

# List recent features
features = requests.get(f'{BASE_URL}/features', headers=headers)
print(f"Active Features: {len(features.json()['features'])}")
```

## Lifecycle Management :recycle:

### Creation Workflow
1. Admin logs into NextDocs dashboard
2. Navigates to Admin → API Keys
3. Clicks "Create New API Key"
4. Fills out form with name, description, permissions, expiry
5. Copies generated key (shown only once)
6. Stores key securely in target system

### Monitoring & Maintenance
- Review API key usage regularly via the admin dashboard
- Check `lastUsedAt` timestamps to identify unused keys
- Rotate keys before expiration dates
- Monitor for any suspicious usage patterns

### Revocation Process
1. **Immediate Disable** - Set `isActive: false` to temporarily disable
2. **Permanent Removal** - DELETE endpoint for complete removal
3. **Audit Trail** - All actions are logged for compliance

## Integration Examples :link:

### PowerShell Script
```powershell
$apiKey = $env:NEXTDOCS_API_KEY
$headers = @{ 'Authorization' = "Bearer $apiKey" }

# Get system health
$health = Invoke-RestMethod -Uri 'https://docs.company.com/api/health' -Headers $headers
Write-Host "Status: $($health.status)"
```

### Node.js Application
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://docs.company.com/api',
  headers: {
    'Authorization': `Bearer ${process.env.NEXTDOCS_API_KEY}`
  }
});

// Create a feature request
async function createFeature(title, description) {
  const response = await client.post('/features', {
    title,
    description,
    categoryId: 'some-category-id'
  });
  return response.data;
}
```

## Related Documentation :compass:

- [NextDocs API Authentication Guide](/docs/api/authentication) - General API authentication
- [Feature Request API](/api-specs/features-api) - Complete features API reference
- [Admin Panel Guide](/docs/admin/overview) - Admin dashboard documentation
- [Security Best Practices](/docs/security/api-keys) - Security guidelines