# Secure Image Access Implementation

## Overview
Images uploaded to feature requests are now protected with permission-aware access control. Only authenticated users who have access to a feature request can view its attached images.

## Changes Made

### 1. New Secure Image Endpoint
**File:** `src/app/api/images/secure/route.ts`

- Endpoint: `/api/images/secure?filename=...&requestId=...`
- Requires authentication
- Verifies user has access to the feature request
- Checks if image belongs to that specific feature request
- Serves image only if all checks pass

**Access Control:**
- Request creator can access
- Admins can access
- Permission denied to other users

### 2. Updated Image Serving Endpoint
**File:** `src/app/api/images/[filename]/route.ts`

- Old direct access is now deprecated (returns 403)
- Forces use of the secure endpoint
- Logs warnings for backward compatibility

### 3. Enhanced Markdown Component
**File:** `src/components/markdown/enhanced-markdown.tsx`

- Added `requestId` prop to pass context
- Passes `requestId` to `MarkdownImage` component
- Updated interface to accept optional `requestId`

### 4. Markdown Image Component
**File:** `src/components/markdown/markdown-image.tsx`

- Added `requestId` prop to interface
- Detects uploaded images (`/api/images/` URLs)
- Redirects to secure endpoint when `requestId` is provided
- Constructs: `/api/images/secure?filename=...&requestId=...`

### 5. Feature Request Page
**File:** `src/app/features/[slug]/page.tsx`

- Passes `requestId={feature.id}` to EnhancedMarkdown
- Description renders with permission checking
- Comments also support images with permission checking

### 6. Comment Item Component
**File:** `src/components/features/comment-item.tsx`

- Added `featureId` prop to interface
- Passes `requestId={featureId}` to EnhancedMarkdown
- Both edit preview and display use secure endpoint
- Feature page passes `featureId` to each comment

## Database Requirements

### Existing Schema
The `FeatureRequest` model already has:
- `id` (UUID primary key)
- `attachments` (array of URLs)
- `createdBy` (user ID for permission check)

**No migration required** - uses existing fields.

## How It Works

### Image Upload Flow
1. User uploads image via `/api/upload/images`
2. File validated and stored in `/public/uploads/images/`
3. URL returned: `/api/images/{hash}.png`
4. Stored in feature request `attachments` array

### Image Display Flow
1. Feature request page renders with `requestId`
2. Markdown processor detects `![alt](/api/images/hash.png)`
3. Converts to secure URL: `/api/images/secure?filename=hash.png&requestId=123`
4. Browser requests with authentication
5. Secure endpoint verifies:
   - ✓ User authenticated
   - ✓ User created feature OR is admin
   - ✓ Image belongs to this feature request
6. Image served with `Cache-Control: private`

## Security Model

**Protected by:**
- Secure random filenames (impossible to guess)
- Permission verification on every request
- User authentication required
- Feature request ownership check
- Image-to-request association validation

**Note:** Images are `private` cache (not publicly cached) since access depends on user permissions.

## Testing

### Test Case 1: Creator Can View
```bash
# As feature creator, view own feature
GET /features/my-feature-id
# Images load successfully
```

### Test Case 2: Admin Can View
```bash
# As admin, view any feature
GET /features/any-feature-id
# Images load successfully
```

### Test Case 3: Non-Creator Cannot View
```bash
# As non-creator, non-admin user
GET /api/images/secure?filename=abc.png&requestId=other-user-feature
# Returns 403 Forbidden
```

### Test Case 4: Direct Access Blocked
```bash
# Try to bypass secure endpoint
GET /api/images/abc.png
# Returns 403 with deprecation message
```

## Extending Access Control

To allow other users (e.g., team members, watchers), modify the check in `src/app/api/images/secure/route.ts`:

```typescript
// Example: Allow followers to view
const iswatching = featureRequest.followers?.some(f => f.userId === session.user.id)

if (!isCreator && !isAdmin && !isWatching) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
}
```

## Performance Considerations

- Images cached locally with immutable, long-lived headers
- Secure endpoint validates permissions (fast DB query)
- Private cache prevents public sharing
- Consider adding rate limiting if needed

## Future Enhancements

1. **Signed URLs**: Generate temporary tokens instead of requestId parameter
2. **Caching Strategy**: Cache permission checks for performance
3. **Audit Logging**: Log all image access for security
4. **CDN Integration**: Use CDN with signed URLs
5. **Permission Scopes**: Fine-grained permissions (viewers, editors, etc.)
