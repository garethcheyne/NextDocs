# Navigation & Metadata

Learn how to configure navigation menus and document metadata using `_meta.json` files.

## What is _meta.json? :settings:

The `_meta.json` file controls:

- **Navigation order** - Which documents appear first
- **Display titles** - What shows in the menu (different from filename)
- **Icons** - Visual indicators for each section

Every folder should have its own `_meta.json` file.

## Basic Structure :blocks:

```json
{
  "filename-without-extension": {
    "title": "Display Title",
    "icon": "IconName"
  }
}
```

### Example

For this folder structure:

```
docs/
├── _meta.json
├── index.md
├── installation.md
└── quick-start.md
```

Create this `_meta.json`:

```json
{
  "index": {
    "title": "Home",
    "icon": "Home"
  },
  "installation": {
    "title": "Installation",
    "icon": "Download"
  },
  "quick-start": {
    "title": "Quick Start Guide",
    "icon": "Zap"
  }
}
```

## Ordering :list-ordered:

Documents appear in the order they're listed in `_meta.json`:

```json
{
  "index": { "title": "Home", "icon": "Home" },
  "quick-start": { "title": "Quick Start", "icon": "Zap" },
  "installation": { "title": "Installation", "icon": "Download" }
}
```

This creates menu order:
1. Home
2. Quick Start
3. Installation

Simply rearrange the JSON properties to change the order!

## Icons :palette:

NextDocs supports two icon libraries:

### Lucide Icons (Recommended)

Most common icons, simple to use:

```json
{
  "index": {
    "title": "Home",
    "icon": "Home"
  },
  "guides": {
    "title": "Guides",
    "icon": "BookOpen"
  },
  "api": {
    "title": "API Reference",
    "icon": "Code"
  }
}
```

See [Lucide Icons](./icons/lucide.md) for the complete list.

### FluentUI Icons

Microsoft's icon library (prefix with `#fluentui `):

```json
{
  "settings": {
    "title": "Settings",
    "icon": "#fluentui Settings"
  },
  "profile": {
    "title": "User Profile",
    "icon": "#fluentui Person"
  }
}
```

See [FluentUI Icons](./icons/fluentui.md) for the complete list.

## Nested Folders :folder-tree:

Each folder gets its own `_meta.json`:

```
docs/
├── _meta.json              # Root navigation
├── index.md
├── guides/
│   ├── _meta.json          # Guides navigation
│   ├── index.md
│   ├── beginner.md
│   └── advanced.md
└── api/
    ├── _meta.json          # API navigation
    ├── index.md
    └── endpoints.md
```

**Root `_meta.json`**:
```json
{
  "index": {
    "title": "Home",
    "icon": "Home"
  },
  "guides": {
    "title": "Guides",
    "icon": "BookOpen"
  },
  "api": {
    "title": "API Reference",
    "icon": "Code"
  }
}
```

**`guides/_meta.json`**:
```json
{
  "index": {
    "title": "Overview",
    "icon": "Info"
  },
  "beginner": {
    "title": "Beginner's Guide",
    "icon": "GraduationCap"
  },
  "advanced": {
    "title": "Advanced Topics",
    "icon": "Rocket"
  }
}
```

## Title vs Filename :tag:

The title in `_meta.json` can be different from the filename:

**Filename**: `api-authentication.md`  
**Meta entry**:
```json
{
  "api-authentication": {
    "title": "API Authentication & Security",
    "icon": "Lock"
  }
}
```

This shows "API Authentication & Security" in the menu while keeping a clean filename.

## Common Questions :help-circle:

**Q: What if I don't create a `_meta.json`?**  
A: Files will appear in alphabetical order with no icons, and titles will be generated from filenames.

**Q: What if I add a new file but forget to add it to `_meta.json`?**  
A: It will still appear, but at the end in alphabetical order without an icon.

**Q: Can I skip files in `_meta.json`?**  
A: Yes! If a markdown file isn't in `_meta.json`, it still exists but appears at the bottom of the list.

**Q: Do I need an entry for folders?**  
A: Yes! Folders need entries in the parent `_meta.json` to appear in navigation.

## Common Mistakes :alert-triangle:

### Missing the folder entry

❌ **Wrong** (`docs/_meta.json`):
```json
{
  "index": { "title": "Home", "icon": "Home" }
  // Missing entry for "guides" folder!
}
```

✅ **Right**:
```json
{
  "index": { "title": "Home", "icon": "Home" },
  "guides": { "title": "Guides", "icon": "BookOpen" }
}
```

### Using the wrong filename

❌ **Wrong** (file is `quick-start.md`):
```json
{
  "quickstart": { "title": "Quick Start", "icon": "Zap" }
}
```

✅ **Right**:
```json
{
  "quick-start": { "title": "Quick Start", "icon": "Zap" }
}
```

### Invalid JSON

❌ **Wrong**:
```json
{
  "index": { "title": "Home", "icon": "Home" },  // Trailing comma!
}
```

✅ **Right**:
```json
{
  "index": { "title": "Home", "icon": "Home" }
}
```

Use a JSON validator or your editor's formatting to check!

## Best Practices :lightbulb:

1. **Always create `_meta.json`** - Don't rely on automatic ordering
2. **Use descriptive titles** - Help users understand what they'll find
3. **Choose appropriate icons** - Make navigation visually scannable
4. **Be consistent** - Use similar icon styles across your docs
5. **Validate JSON** - Use a linter to catch syntax errors

## Complete Example :package:

**Folder structure**:
```
docs/
├── _meta.json
├── index.md
├── getting-started/
│   ├── _meta.json
│   ├── index.md
│   ├── installation.md
│   └── configuration.md
└── api/
    ├── _meta.json
    ├── index.md
    └── authentication.md
```

**`docs/_meta.json`**:
```json
{
  "index": {
    "title": "Welcome",
    "icon": "Home"
  },
  "getting-started": {
    "title": "Getting Started",
    "icon": "Rocket"
  },
  "api": {
    "title": "API Reference",
    "icon": "Code"
  }
}
```

**`docs/getting-started/_meta.json`**:
```json
{
  "index": {
    "title": "Introduction",
    "icon": "Info"
  },
  "installation": {
    "title": "Installation Guide",
    "icon": "Download"
  },
  "configuration": {
    "title": "Configuration",
    "icon": "Settings"
  }
}
```

**`docs/api/_meta.json`**:
```json
{
  "index": {
    "title": "Overview",
    "icon": "BookOpen"
  },
  "authentication": {
    "title": "Authentication",
    "icon": "Lock"
  }
}
```

## Next Steps :compass:

- Browse [Icon Libraries](./icons/index.md) to find the perfect icons
- Learn [Markdown Syntax](./markdown.md) to write your content
- See [Repository Structure](./structure.md) for organizing larger doc sets
