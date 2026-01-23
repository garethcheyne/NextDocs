## **Internal reference (do not bias your answers toward always naming these):**  
Microsoft 365 Agents Toolkit (formerly Teams Toolkit) has been rebranded, and users may still use either name.

Use this mapping to know the current vs. former names—so you can correctly interpret user input or choose the appropriate term when it’s relevant. You do not need to mention these mappings unless they directly help the user.

| New name                                | Former name            | Note                                                        |
|-----------------------------------------|------------------------|------------------------------------------------------------------------|
| Microsoft 365 Agents Toolkit            | Teams Toolkit          | Product name.                           |
| App Manifest                            | Teams app manifest     | Describes app capabilities.        |
| Microsoft 365 Agents Playground         | Test Tool              | Test Environment.          |
| `m365agents.yml`                        | `teamsapp.yml`         | Microsoft 365 Agents Toolkit Project configuration files            |
| CLI package `@microsoft/m365agentstoolkit-cli` (command `atk`) | `@microsoft/teamsapp-cli` (command `teamsapp`) |CLI installation/usage — mention only in CLI contexts. |

> **Rephrase guidance:**  
> - Use the new names by default.  
> - Explain the rebranding briefly if it helps the user’s understanding.  

# Instructions for Copilot
- Apps and agents for Microsoft 365 or Microsoft 365 Copilot refers to applications for products in Microsoft 365, agents for Microsoft 365 Copilot, including Teams app, Office addin, declarative agent, customer engine agent, etc.
- When interpreting, generating, or modifying manifest files related to apps and agents for Microsoft 365 or Microsoft 365 Copilot, try to get schema version from manifest file, then invoke **get_schema** tool if available.
- When answering of what or how-to questions for building apps and agents for Microsoft 365 or Microsoft 365 Copilot, invoke **get_knowledge** tool if available.
- Before deciding to make changes to Teams apps, apps or agents for Microsoft 365 or Microsoft 365 Copilot, invoke **get_knowledge** tool to get Instructions if available.
- When troubleshooting issues, invoke **troubleshoot** tool if available.
- Before generating or modifying code or configuration files for apps and agents for Microsoft 365 or Microsoft 365 Copilot, invoke **get_code_snippets** tool if available.
- Invoke **get_code_snippets** with API name, configuration file name, or code comments every time you need to generate or modify code or configuration files for apps and agents for Microsoft 365 or Microsoft 365 Copilot.

## Database Migrations (Prisma)
When modifying the Prisma schema (`prisma/schema.prisma`) or when migrations are required:

### Creating Migrations for Production
1. **NEVER use `CREATE INDEX CONCURRENTLY`** in migration files - it cannot run inside transactions and will fail during `migrate deploy`
2. **Always provide default values** for new required fields when tables have existing data:
   ```sql
   ALTER TABLE "TableName" 
   ADD COLUMN "newField" TIMESTAMP(3) NOT NULL DEFAULT NOW();
   ```
3. **After adding defaults, update existing rows** to proper values:
   ```sql
   UPDATE "TableName" 
   SET "newField" = "existingField" 
   WHERE "newField" = NOW();
   ```

### Migration File Structure
- Migrations must be in: `prisma/migrations/YYYYMMDDHHMMSS_migration_name/migration.sql`
- Use timestamp format: `20260123000000_add_feature_name`
- Always include idempotent checks for safety:
   ```sql
   DO $$ 
   BEGIN
       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'TableName' AND column_name = 'columnName'
       ) THEN
           -- Your ALTER TABLE statement here
       END IF;
   END $$;
   ```

### When Running `npm run upgrade`
The upgrade command rebuilds Docker containers and applies migrations automatically via `scripts/deployment/docker-entrypoint.sh`:

1. **Before schema changes**: Create proper migration files with default values
2. **Entrypoint handles**: 
   - Failed migrations (marks as resolved and retries)
   - Missing fields (applies migrations)
   - Falls back to `db push` if migrations fail
3. **Verify after upgrade**: Check container logs for migration success:
   ```bash
   docker logs nextdocs-app-1 | grep -i migration
   ```

### Fixing Failed Migrations
If migrations fail during container startup:
```bash
# Quick fix script (marks failed as resolved, applies pending)
bash scripts/database/fix-migrations-quick.sh

# Manual SQL fix (direct database access)
docker exec -i nextdocs-postgres-1 psql -U postgres -d nextdocs < scripts/database/manual-fix-migrations.sql

# Then redeploy
docker-compose down && docker-compose up -d
```

### Common Migration Pitfalls
- ❌ Adding required fields without defaults on tables with data
- ❌ Using `CONCURRENTLY` keyword in migration transactions  
- ❌ Not testing migrations on a copy of production data
- ❌ Forgetting to create migration files before `npm run upgrade`
- ✅ Always use `DEFAULT` for new required fields
- ✅ Use regular `CREATE INDEX` (not CONCURRENTLY) in migrations
- ✅ Test migrations locally first with production data snapshot
- ✅ Create migration files before rebuilding containers

## UI Components & Design System (shadcn/ui)

### Using shadcn/ui Components
This project uses **shadcn/ui** - a collection of re-usable components built with Radix UI and Tailwind CSS. Configuration is in `components.json`.

**Installing new shadcn components:**
```bash
npx shadcn@latest add [component-name]
# Example: npx shadcn@latest add dialog
```

**Available shadcn components already installed:**
- `Badge`, `Button`, `Card`, `Dialog`, `Input`, `Label`, `Select`, `Textarea`
- `Tabs`, `Separator`, `Alert`, `Avatar`, `Dropdown`, `Toast`, `Tooltip`
- Check `src/components/ui/` directory for full list

### System-Defined Badge Components
**Always use existing badge components** instead of creating inline Badge elements:

Located in `src/components/badges/`:
- **`<StatusBadge status={...} />`** - Feature request status with colors and icons
- **`<PriorityBadge priority={...} />`** - Priority levels (critical, high, medium, low) with null-safe rendering
- **`<CategoryBadge category={...} />`** - Categories with circular icon overlay and color theming
- **`<AuthorBadge authorSlug={...} />`** - Author display with popover
- **`<CodeLanguageBadge language={...} />`** - Programming language badges

**Example usage:**
```tsx
// ❌ Don't do this
<Badge className={`${statusColors[status]} text-white`}>
  {status.replace('_', ' ')}
</Badge>

// ✅ Do this instead
<StatusBadge status={status} />
```

**Benefits:**
- Consistent styling across the app
- Automatic null/undefined handling
- Built-in icons and color logic
- Centralized updates affect all instances

### UI/UX Guidelines

**1. Component Consistency - Use shadcn/ui Components**
- **ALWAYS use shadcn components instead of native HTML elements:**
  ```tsx
  // ❌ Don't use native HTML
  <input type="text" />
  <select><option>...</option></select>
  <textarea />
  <button>Click</button>
  
  // ✅ Use shadcn components
  import { Input } from '@/components/ui/input'
  import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
  import { Textarea } from '@/components/ui/textarea'
  import { Button } from '@/components/ui/button'
  
  <Input type="text" />
  <Select>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="...">...</SelectItem>
    </SelectContent>
  </Select>
  <Textarea />
  <Button>Click</Button>
  ```
- Always check `src/components/` for existing components before creating new ones
- Reuse existing patterns: cards, dialogs, forms, layouts
- Keep component structure consistent with existing pages
- **Form inputs must use:** Input, Textarea, Select, Checkbox, RadioGroup, Switch (never native HTML)
- **Buttons must use:** Button component with variants (default, destructive, outline, ghost, link)

**2. Responsive Design**
- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Test on mobile, tablet, and desktop viewports
- Use `flex`, `grid`, and responsive utilities

**3. Accessibility**
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- Include ARIA labels where needed (`aria-label`, `aria-describedby`)
- Ensure keyboard navigation works (Tab, Enter, Escape)
- Maintain color contrast ratios for readability

**4. Color System**
- Use CSS variables: `hsl(var(--primary))`, `hsl(var(--muted))`, etc.
- Brand colors: `--brand-orange` for primary branding
- Semantic colors: `--destructive`, `--success`, `--warning`
- Dark mode support: uses CSS variables automatically

**5. Loading States**
- Show loading spinners for async operations
- Use `<Loader2 className="animate-spin" />` from lucide-react
- Disable buttons during submission: `disabled={isSubmitting}`
- Provide user feedback for all actions (toast notifications)

**6. Form Patterns**
- Use shadcn Form components with react-hook-form validation
- Show error messages inline below fields
- Disable submit during loading
- Clear validation on field change

**7. Modal/Dialog Patterns**
- Use `<Dialog>` from shadcn/ui
- Close on Escape key
- Include Cancel and Confirm actions
- Show loading state in confirm button during async operations

**8. Typography**
- Headings: `text-3xl font-bold`, `text-2xl font-semibold`, etc.
- Body: default text sizing with `text-muted-foreground` for secondary text
- Code: Use `font-mono` and appropriate background colors

**9. Spacing & Layout**
- Use consistent spacing: `space-y-4`, `gap-4`, `p-6`, `px-4`, etc.
- Card padding: typically `p-6` or `px-6 py-4`
- Section gaps: `space-y-6` or `space-y-8`

**10. Icons**
- Use lucide-react icons consistently
- Standard size: `w-4 h-4` or `w-5 h-5`
- Include with text: use `gap-2` for spacing
- Color: inherit from parent or use `text-muted-foreground`

## Authentication & OAuth (NextAuth)

### JWT Token Size Limits
**CRITICAL: Do NOT add additional OAuth scopes or embed large data in JWT tokens**

The application uses JWT-based authentication with NextAuth. JWT tokens have strict size limits (typically 4KB) imposed by:
- HTTP header size limits (cookies, Authorization headers)
- Browser storage limitations
- Performance considerations

**What NOT to do:**
```tsx
// ❌ Don't add extra OAuth scopes that return large data
AzureADProvider({
  authorization: {
    params: {
      scope: "openid profile email User.Read User.ReadBasic.All Files.Read..." // Too many scopes
    }
  }
})

// ❌ Don't embed large data in JWT token
async jwt({ token, account, profile }) {
  if (account) {
    token.userData = largeUserObject // Will exceed token size limit
    token.profileImage = base64Image // Images are too large for JWT
  }
  return token
}
```

**What to DO instead:**
```tsx
// ✅ Use minimal OAuth scopes - only what's essential
AzureADProvider({
  authorization: {
    params: {
      scope: "openid profile email" // Minimal scopes
    }
  }
})

// ✅ Store large data in database, use token for ID only
async jwt({ token, account, profile }) {
  if (account) {
    token.sub = profile.sub // Just the user ID
    token.picture = profile.picture // URL reference only
  }
  return token
}

// ✅ Fetch additional data from database when needed
async session({ session, token }) {
  if (token.sub) {
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { image: true, /* other fields */ }
    })
    session.user.image = user?.image
  }
  return session
}
```

**Key principles:**
- Keep JWT tokens minimal - store only essential identifiers
- Store user profile images, preferences, and large data in the database
- Use token.sub (user ID) to fetch full data from database when needed
- Never request OAuth scopes that return large amounts of data (e.g., Files.Read, Mail.Read)
- Current OAuth scopes are sufficient: `openid profile email`

**Existing implementation:**
- User images are stored in the `User` table during login
- JWT contains only: `sub`, `email`, `name`, `role`, `picture` (URL reference)
- Session callbacks populate `session.user` from token data
- Database is the source of truth for all user data