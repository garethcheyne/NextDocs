# API Specification Multi-Version Support - Implementation Summary

## Overview
Implemented multi-version support for API specifications, allowing users to select and view different versions of the same API documentation.

## Changes Made

### 1. Database Schema Updates (`prisma/schema.prisma`)
- **Modified APISpec model**:
  - Removed `@unique` constraint from `slug` field (now allows multiple versions)
  - Added composite unique constraint: `@@unique([slug, version])`
  - Added index on `slug` for efficient queries: `@@index([slug])`
  
- **Migration Applied**: `20251117081243_add_api_spec_versioning`
- **Prisma Client**: Regenerated to support new composite key lookups

### 2. API Spec Storage (`src/lib/sync/api-spec-storage.ts`)
- Updated to use composite key for lookups:
  ```typescript
  where: { slug_version: { slug, version } }
  ```
- Slug generation excludes version (extracted separately from YAML)
- Logs now show version numbers in console output

### 3. Sync Parsers
**GitHub Sync** (`src/lib/sync/github.ts`):
- Returns `{ documents, apiSpecs }` object instead of array
- Filters YAML/YML files from `api-specs/[category]/` directories
- Validates path structure before processing

**Azure DevOps Sync** (`src/lib/sync/azure-devops.ts`):
- Returns `{ documents, apiSpecs }` object instead of array
- Filters YAML/YML files from `api-specs/[category]/` directories
- Fixed TypeScript type for findIndex callback

**Sync Service** (`src/lib/sync/sync-service.ts`):
- Handles both documents and apiSpecs
- Calls `storeApiSpecs()` after `storeDocuments()`
- Logs API spec results separately

### 4. API Documentation Pages

**List Page** (`src/app/api-docs/page.tsx`):
- Groups API specs by slug
- Shows all available versions for each API
- Latest version displayed first (sorted by version desc)
- Version selector using clickable badges
- Links to versioned routes: `/api-docs/${slug}/${version}`

**Detail Page** (`src/app/api-docs/[slug]/[version]/page.tsx`):
- New versioned route structure
- Fetches specific version using composite key
- Displays version selector in header (if multiple versions exist)
- Shows appropriate renderer (Swagger UI or Redoc)
- Displays:
  - API metadata (name, description, category)
  - Auto-sync status (if enabled)
  - Repository information
  - Specification file path

**API Route** (`src/app/api/spec/[slug]/[version]/route.ts`):
- Serves YAML spec files from `/content/api-specs/`
- Uses composite key to find correct spec
- Returns YAML content with appropriate headers
- Includes caching (1 hour)

### 5. Removed Files
- **Deleted**: `src/app/api-docs/[slug]/page.tsx` (old non-versioned route)

## How It Works

### Data Model
```
API Specs are now uniquely identified by (slug, version):
- slug: "nextdoc-api" + version: "1.0.0"
- slug: "nextdoc-api" + version: "2.0.0"  ✅ Allowed
- slug: "commerce-orders" + version: "1.5.0"
```

### File Structure
```
content/
  api-specs/
    [category]/
      my-api-v1.yaml      → slug: "category-my-api", version: "1.0.0"
      my-api-v2.yaml      → slug: "category-my-api", version: "2.0.0"
      another-api.yaml    → slug: "category-another-api", version: "1.0.0"
```

### Version Extraction
From YAML file:
```yaml
openapi: 3.0.0
info:
  title: NextDoc API
  version: 1.0.0
  description: API for NextDoc platform
```

Extracted:
- `name`: "NextDoc API"
- `version`: "1.0.0"
- `slug`: "category-nextdoc-api" (from category + filename, no version)

### User Experience

**API Docs List Page**:
1. Shows one card per API (grouped by slug)
2. Latest version displayed by default
3. Version selector shows all available versions
4. Click version badge to navigate to that version

**API Detail Page**:
1. URL format: `/api-docs/[slug]/[version]`
2. Header shows current version with selector
3. Spec rendered in iframe using selected renderer
4. Footer shows sync status and repository info

## Database Queries

**Find specific version**:
```typescript
await prisma.aPISpec.findUnique({
  where: {
    slug_version: { slug, version }
  }
})
```

**Get all versions of an API**:
```typescript
await prisma.aPISpec.findMany({
  where: { slug: 'my-api' },
  orderBy: { version: 'desc' }
})
```

**List all enabled APIs**:
```typescript
await prisma.aPISpec.findMany({
  where: { enabled: true },
  orderBy: [
    { slug: 'asc' },
    { version: 'desc' }
  ]
})
```

## Benefits

1. **Multiple Versions**: Support different API versions simultaneously
2. **Version Selection**: Users can switch between versions easily
3. **Backward Compatibility**: Old versions remain accessible
4. **Clean URLs**: `/api-docs/my-api/1.0.0` vs `/api-docs/my-api/2.0.0`
5. **Database Integrity**: Composite unique key prevents duplicate slug+version combinations

## Testing Checklist

- [ ] Sync repository with multiple versions of same API
- [ ] Verify each version is stored separately in database
- [ ] Check API docs list page groups by slug correctly
- [ ] Verify version selector shows all versions
- [ ] Test navigation between versions
- [ ] Confirm correct spec is loaded for each version
- [ ] Verify API route serves correct YAML file
- [ ] Test Swagger UI and Redoc renderers
- [ ] Check auto-sync updates correct version
- [ ] Verify migration applied successfully

## Future Enhancements

- [ ] Add "Latest" badge to newest version
- [ ] Deprecation warnings for old versions
- [ ] Version comparison view
- [ ] Changelog between versions
- [ ] Default to latest version in UI
- [ ] Version dropdown instead of badges
- [ ] API endpoint to list all versions

## Files Modified

### Database
- `prisma/schema.prisma`
- `prisma/migrations/20251117081243_add_api_spec_versioning/migration.sql`

### Sync System
- `src/lib/sync/api-spec-storage.ts`
- `src/lib/sync/github.ts`
- `src/lib/sync/azure-devops.ts`
- `src/lib/sync/sync-service.ts`

### Frontend
- `src/app/api-docs/page.tsx`
- `src/app/api-docs/[slug]/[version]/page.tsx` (new)
- `src/app/api/spec/[slug]/[version]/route.ts` (new)

### Removed
- `src/app/api-docs/[slug]/page.tsx` (old)

## Notes

- All TypeScript compile errors resolved after Prisma client regeneration
- Migration applied successfully to database
- API specs now support versioning at both schema and UI levels
- Backward compatible with existing sync workflows
