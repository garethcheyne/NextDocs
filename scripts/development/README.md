# Development Tools

## Azure DevOps Integration

### Generate DevOps Field Types
Fetches work item fields from Azure DevOps and generates TypeScript types for type-safe field access.

```bash
npm run devops:generate-types -- "ProjectName"
# or
node scripts/development/generate-devops-field-types.js "HN Commercial Division"
```

**What it does:**
- Authenticates with Azure DevOps using OAuth
- Fetches all work item fields for the specified project
- Categorizes fields (System, Microsoft, Custom)
- Generates TypeScript interfaces and types
- Saves to `src/types/devops-fields.ts`

**Generated types:**
- `SystemFields` - Built-in Azure DevOps fields
- `MicrosoftFields` - Microsoft extension fields
- `CustomFields` - Organization-specific fields
- `WorkItemFields` - Combined type of all fields
- `WorkItemTypeFields` - Common fields by work item type
- `FIELD_METADATA` - Field metadata for lookups

**Usage in code:**
```typescript
import { WorkItemFields, WorkItemTypeFields } from '@/types/devops-fields'

// Type-safe field access
const fields: Partial<WorkItemTypeFields['User Story']> = {
  'System.Title': 'My Feature',
  'Microsoft.VSTS.Scheduling.StoryPoints': 5,
}
```

### Test DevOps Authentication
Tests Azure DevOps authentication and work item creation.

```bash
npm run devops:test-auth
```

## Search & Content Tools
- search-document.ts - Find specific documents  
- validate-documents.ts - Validate content integrity
