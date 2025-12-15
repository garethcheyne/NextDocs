# NextDocs API Authentication

NextDocs API supports two authentication methods: OAuth sessions (for web interface) and API keys (for programmatic access).

## API Key Authentication

### Creating API Keys

1. **Admin Access Required**: Only admin users can create API keys
2. **Navigate to API Keys**: Go to Admin → API Keys in the sidebar
3. **Create New Key**: Click "Create API Key" button
4. **Configure Key**:
   - **Name**: Required. Human-readable identifier (e.g., "CI/CD Integration", "Mobile App")
   - **Description**: Optional. Purpose or usage notes
   - **Permissions**: 
     - **Read Only**: Can view and list resources
     - **Read/Write**: Can create, update, and delete resources
   - **Expiry Date**: Choose from predefined options (7 days, 30 days, 90 days, 1 year) or set custom date

5. **Copy Key**: The 64-character API key is shown **only once**. Copy it immediately and store securely.

### Using API Keys

#### Method 1: Authorization Header (Recommended)
```bash
curl -H "Authorization: Bearer YOUR_64_CHAR_API_KEY" \
     https://your-domain.com/api/features
```

#### Method 2: X-API-Key Header
```bash
curl -H "X-API-Key: YOUR_64_CHAR_API_KEY" \
     https://your-domain.com/api/features
```

### API Key Format

- **Length**: Exactly 64 hexadecimal characters
- **Example**: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`
- **Storage**: Keys are hashed using SHA-256 before storage

### Permissions

#### Read Permissions
- `GET /api/features` - List feature requests
- `GET /api/features/{id}` - Get specific feature
- `GET /api/features/{id}/comments` - Get feature comments
- All other GET endpoints

#### Write Permissions
- All Read permissions, plus:
- `POST /api/features` - Create feature requests  
- `POST /api/features/{id}/vote` - Vote on features
- `POST /api/features/{id}/comments` - Add comments
- `PUT /api/features/{id}` - Update features (creator/admin only)
- `DELETE /api/features/{id}` - Delete features (creator/admin only)

### Error Responses

```json
// Invalid API key format
{
  "error": "Invalid API key format",
  "status": 401
}

// Expired or inactive key
{
  "error": "API key has expired", 
  "status": 401
}

// Insufficient permissions
{
  "error": "write permission required",
  "status": 403
}

// User account inactive
{
  "error": "User account is inactive",
  "status": 401
}
```

## API Key Management

### Security Best Practices

1. **Secure Storage**: Store API keys in environment variables or secure key management systems
2. **Least Privilege**: Use read-only keys when write access isn't needed
3. **Regular Rotation**: Set appropriate expiry dates and rotate keys regularly
4. **Monitoring**: Check "Last Used" timestamps in the admin interface
5. **Immediate Revocation**: Deactivate or delete compromised keys immediately

### Monitoring Usage

Admin users can monitor API key usage:
- **Last Used**: Timestamp of most recent API call
- **Status**: Active, Inactive, or Expired
- **Activity**: Deactivate keys temporarily without deletion
- **Deletion**: Permanently remove keys (cannot be undone)

### Rate Limiting

API keys are subject to the same rate limiting as session-based requests:
- Standard rate limits apply per user account
- Monitor usage through admin dashboard analytics

## Examples

### List Feature Requests
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://your-domain.com/api/features?status=approved&limit=10"
```

### Create Feature Request
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "New Feature Request",
       "description": "Detailed description of the feature",
       "categoryId": "category-uuid",
       "tags": ["enhancement", "api"]
     }' \
     "https://your-domain.com/api/features"
```

### Vote on Feature
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"voteType": 1}' \
     "https://your-domain.com/api/features/feature-uuid/vote"
```

## Migration from Session Auth

Existing endpoints continue to work with session authentication. API key support is additive - both methods work simultaneously. Web interface uses sessions, while programmatic access can use API keys.

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check API key format (64 hex chars) and expiry
2. **403 Forbidden**: Verify key has required permissions (read/write)  
3. **Key Not Working**: Ensure key is active and user account is active
4. **Rate Limited**: Reduce request frequency or contact admin

### Support

For API key issues:
1. Check key status in Admin → API Keys
2. Verify user account is active
3. Review API key permissions and expiry
4. Check recent usage timestamps