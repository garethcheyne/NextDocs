# Repository Structure

Learn how to organize your documentation for maximum clarity and maintainability.

## Basic Structure :folder:

A complete NextDocs repository can include multiple content types:

```
my-project/
├── docs/              # Documentation (required)
│   ├── _meta.json     # Navigation configuration
│   ├── index.md       # Documentation homepage
│   └── ...            # Your documentation content
├── blog/              # Blog posts (optional)
│   └── 2024/
│       └── 12/
│           └── post.md
├── authors/           # Author profiles (optional)
│   └── author.json
├── api-specs/         # API documentation (optional)
│   └── api.yaml
├── src/               # Your application code (not synced)
├── README.md          # Project README (not synced)
└── package.json       # Project config (not synced)
```

**Content Types**:
- **docs/** - Main documentation (required)
- **blog/** - Blog posts organized by year/month
- **authors/** - Author profile JSON files
- **api-specs/** - OpenAPI/Swagger specifications

**Note**: Application code and configuration files are not synced to NextDocs.

## Organizing with Folders :folder-tree:

Use folders to group related documentation:

```
docs/
├── _meta.json
├── index.md
├── getting-started/
│   ├── _meta.json
│   ├── index.md
│   ├── installation.md
│   ├── quick-start.md
│   └── img/                # Images for this section
│       └── setup.png
├── user-guide/
│   ├── _meta.json
│   ├── index.md
│   ├── features.md
│   ├── advanced.md
│   └── img/
│       └── dashboard.png
└── api-reference/
    ├── _meta.json
    ├── index.md
    ├── endpoints.md
    └── img/
        └── workflow.png
```

**Best Practice**: Store images in an `img/` folder within each documentation section.

## Naming Conventions :file-text:

### Files

- Use **lowercase** with **hyphens**: `getting-started.md`, `api-reference.md`
- Always use `.md` extension for Markdown files
- Each folder should have an `index.md` (the folder's homepage)

### Folders

- Use **lowercase** with **hyphens**: `user-guide/`, `api-reference/`
- Keep names short but descriptive
- Folder names become part of the URL

**Example URLs**:
- `docs/index.md` → `/docs/my-category`
- `docs/getting-started/installation.md` → `/docs/my-category/getting-started/installation`

## Ordering Content :list-ordered:

Use `_meta.json` files to control the order and appearance of navigation:

```json
{
  "index": {
    "title": "Overview",
    "icon": "Home"
  },
  "installation": {
    "title": "Installation",
    "icon": "Download"
  },
  "quick-start": {
    "title": "Quick Start",
    "icon": "Zap"
  }
}
```

Items appear in the order they're listed in the JSON file.

## Recommended Structures :layout:

### Small Project (< 10 pages)

```
docs/
├── _meta.json
├── index.md
├── installation.md
├── usage.md
└── faq.md
```

### Medium Project (10-50 pages)

```
docs/
├── _meta.json
├── index.md
├── getting-started/
│   ├── _meta.json
│   ├── index.md
│   └── installation.md
├── guides/
│   ├── _meta.json
│   ├── index.md
│   └── ...
└── reference/
    ├── _meta.json
    ├── index.md
    └── ...
```

### Large Project (50+ pages)

```
docs/
├── _meta.json
├── index.md
├── getting-started/
│   ├── _meta.json
│   └── ...
├── user-guide/
│   ├── _meta.json
│   ├── basics/
│   │   ├── _meta.json
│   │   └── ...
│   └── advanced/
│       ├── _meta.json
│       └── ...
├── api-reference/
│   ├── _meta.json
│   └── ...
└── examples/
    ├── _meta.json
    └── ...
```

## Linking Between Pages :link:

### Relative Links

Link to pages in the same folder:

```markdown
See [installation guide](./installation.md) for setup instructions.
```

Link to pages in parent folder:

```markdown
Back to [home](../index.md).
```

Link to pages in subfolders:

```markdown
Read about [advanced features](./user-guide/advanced.md).
```

### Important Notes

- Always use `.md` extension in links
- Use `./` for current folder, `../` for parent folder
- Links are automatically converted to proper URLs

## Things to Avoid :alert-triangle:

### Don't Use Absolute Paths

❌ **Wrong**: `/docs/getting-started/installation.md`  
✅ **Right**: `./getting-started/installation.md`

### Don't Skip index.md Files

Every folder should have an `index.md` as its landing page.

❌ **Wrong**:
```
guides/
├── _meta.json
└── tutorial.md
```

✅ **Right**:
```
guides/
├── _meta.json
├── index.md
└── tutorial.md
```

### Don't Use Spaces in File Names

❌ **Wrong**: `getting started.md`  
✅ **Right**: `getting-started.md`

## Best Practices :lightbulb:

1. **Keep it shallow**: Try to stay within 2-3 levels of nesting
2. **Use meaningful names**: `installation.md` is better than `setup.md` or `step1.md`
3. **One topic per file**: Break large topics into multiple focused files
4. **Consistent naming**: Pick a convention (kebab-case) and stick to it
5. **Group logically**: Put related docs in the same folder

## Example: Complete Structure :package:

Here's a real-world example for a web application:

```
docs/
├── _meta.json
├── index.md
├── getting-started/
│   ├── _meta.json
│   ├── index.md
│   ├── prerequisites.md
│   ├── installation.md
│   └── first-steps.md
├── user-guide/
│   ├── _meta.json
│   ├── index.md
│   ├── dashboard.md
│   ├── creating-projects.md
│   ├── managing-users.md
│   └── settings.md
├── developer-guide/
│   ├── _meta.json
│   ├── index.md
│   ├── api-overview.md
│   ├── authentication.md
│   └── webhooks.md
└── troubleshooting/
    ├── _meta.json
    ├── index.md
    ├── common-errors.md
    └── faq.md
```

## Next Steps :compass:

- Learn about [Navigation & Metadata](./metadata.md) to configure your `_meta.json` files
- Explore [Markdown Syntax](./markdown.md) to write rich content
- Add [Icons](./icons/index.md) to enhance your navigation
