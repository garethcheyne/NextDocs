# API Keys Documentation

## Overview

The NextDocs API Key system provides programmatic access to the API with fine-grained permissions and secure authentication. This system is designed for server-to-server communication and automated workflows.

## Authentication Methods

### API Key Authentication
- **Format**: 64-character hexadecimal string
- **Headers**: 
  - `Authorization: Bearer {api_key}` (Recommended)
  - `X-API-Key: {api_key}` (Alternative)

### Permissions
- **Read**: Access to GET endpoints (view data)
- **Write**: Access to all endpoints (create, update, delete)

## API Endpoints

### List API Keys
**GET** `/api/admin/api-keys`

Lists all API keys created by the authenticated admin.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "keyPreview": "string",
    "permissions": "read|write",
    "expiresAt": "2024-12-31T23:59:59Z",
    "lastUsedAt": "2024-12-14T10:30:00Z",
    "isActive": true,
    "createdAt": "2024-12-01T00:00:00Z",
    "updatedAt": "2024-12-01T00:00:00Z"
  }
]
```

### Create API Key
**POST** `/api/admin/api-keys`

Creates a new API key.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "permissions": "read|write",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "keyPreview": "string",
  "permissions": "read|write",
  "expiresAt": "2024-12-31T23:59:59Z",
  "lastUsedAt": null,
  "isActive": true,
  "createdAt": "2024-12-01T00:00:00Z",
  "updatedAt": "2024-12-01T00:00:00Z",
  "key": "string"
}
```

> **Important**: The `key` field is only returned once during creation. Store it securely.

### Update API Key
**PATCH** `/api/admin/api-keys/{id}`

Updates an API key's active status.

**Request Body:**
```json
{
  "isActive": boolean
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "keyPreview": "string",
  "permissions": "read|write",
  "expiresAt": "2024-12-31T23:59:59Z",
  "lastUsedAt": "2024-12-14T10:30:00Z",
  "isActive": boolean,
  "createdAt": "2024-12-01T00:00:00Z",
  "updatedAt": "2024-12-01T00:00:00Z"
}
```

### Delete API Key
**DELETE** `/api/admin/api-keys/{id}`

Permanently deletes an API key.

**Response:**
```json
{
  "success": true
}
```

## Security Features

- **SHA-256 Hashing**: Keys are stored as irreversible hashes
- **Expiration**: All keys must have an expiration date
- **Permissions**: Granular read/write access control
- **Admin Only**: Only admin users can manage API keys
- **Audit Trail**: Track creation, usage, and modifications

## Error Handling

### Common HTTP Status Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation error)
- `401`: Unauthorized (invalid or missing authentication)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Internal server error

### Error Response Format
```json
{
  "error": "Error description"
}
```

## Rate Limiting

API keys are subject to the same rate limits as regular user sessions. Monitor usage through the admin interface.

## Best Practices

1. **Secure Storage**: Store API keys in environment variables or secure vaults
2. **Least Privilege**: Use read-only keys when possible
3. **Regular Rotation**: Rotate keys periodically
4. **Monitor Usage**: Check last used timestamps regularly
5. **Immediate Revocation**: Deactivate compromised keys immediately

## Integration Examples

### JavaScript/Node.js
```javascript
const response = await fetch('https://your-domain.com/api/admin/api-keys', {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

### cURL
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://your-domain.com/api/admin/api-keys
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

response = requests.get('https://your-domain.com/api/admin/api-keys', headers=headers)
```