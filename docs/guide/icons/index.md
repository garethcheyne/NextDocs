# Icon Libraries

NextDocs supports two icon libraries to enhance your documentation with visual elements.

## Available Libraries :package:

### Lucide Icons (Primary)

- **Count**: 1,000+ icons
- **Style**: Clean, consistent, modern
- **Usage**: `:icon-name:` in markdown, `"IconName"` in `_meta.json`
- **Best for**: General purpose icons (this is what NextDocs uses throughout)

[Browse Lucide Icons →](./lucide.md)

### FluentUI Icons

- **Count**: 2,000+ icons
- **Style**: Microsoft Fluent Design System
- **Usage**: `:#fluentui IconName:` in markdown, `"#fluentui IconName"` in `_meta.json`
- **Best for**: Microsoft-style interfaces

[Browse FluentUI Icons →](./fluentui.md)

## Where to Use Icons

### 1. In Navigation (`_meta.json`)

Add visual indicators to your navigation menus:

```json
{
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

### 2. In Markdown Content

Enhance your text with inline icons:

```markdown
:check-circle: Feature enabled
:alert-triangle: Warning message
:info: Additional information
```

**Result**:
:check-circle: Feature enabled  
:alert-triangle: Warning message  
:info: Additional information

## Icon Syntax

### Lucide Icons

**In Markdown**:
```markdown
:icon-name: Text here
```

**In _meta.json**:
```json
{
  "page": {
    "title": "Page Title",
    "icon": "IconName"
  }
}
```

**Format Notes**:
- Markdown: Use kebab-case (`:check-circle:`, `:arrow-right:`)
- JSON: Use PascalCase (`"CheckCircle"`, `"ArrowRight"`)
- Both formats work in either location

### FluentUI Icons

**In Markdown**:
```markdown
:#fluentui IconName: Text here
```

**In _meta.json**:
```json
{
  "page": {
    "title": "Page Title",
    "icon": "#fluentui IconName"
  }
}
```

**Format Notes**:
- Always use the `#fluentui` prefix
- Icon names are PascalCase
- Some icons have size variants (e.g., `Add`, `Add24`)

## Finding the Right Icon :search:

### By Category

Both libraries organize icons into categories:

- **Common**: Home, Menu, Search, Settings
- **Media**: Play, Pause, Volume, Music
- **Communication**: Mail, Phone, Message, Send
- **Files**: File, Folder, Download, Upload
- **UI**: ChevronDown, X, Check, Plus
- **Alerts**: Info, Warning, Error, AlertTriangle
- **Navigation**: ArrowLeft, ArrowRight, ChevronUp
- **Social**: GitHub, Twitter, Facebook, Share

### By Use Case

**Documentation Navigation**:
- `BookOpen`, `FileText`, `Book`, `Scroll`

**Getting Started**:
- `Rocket`, `Zap`, `Play`, `FastForward`

**Guides & Tutorials**:
- `GraduationCap`, `Lightbulb`, `Target`, `Map`

**API & Code**:
- `Code`, `Terminal`, `Braces`, `FileCode`

**Settings & Config**:
- `Settings`, `Sliders`, `Tool`, `Wrench`

**Status & Actions**:
- `CheckCircle`, `XCircle`, `AlertTriangle`, `Info`

## Best Practices :lightbulb:

### Choose Meaningful Icons

✅ **Good**:
```json
{
  "installation": { "icon": "Download" },
  "configuration": { "icon": "Settings" },
  "troubleshooting": { "icon": "AlertTriangle" }
}
```

❌ **Confusing**:
```json
{
  "installation": { "icon": "Smile" },
  "configuration": { "icon": "Music" },
  "troubleshooting": { "icon": "Coffee" }
}
```

### Be Consistent

Pick one library for navigation and stick with it:

✅ **Consistent**:
```json
{
  "guide": { "icon": "BookOpen" },
  "api": { "icon": "Code" },
  "faq": { "icon": "HelpCircle" }
}
```

❌ **Mixed** (works but inconsistent):
```json
{
  "guide": { "icon": "BookOpen" },
  "api": { "icon": "#fluentui Code" },
  "faq": { "icon": "HelpCircle" }
}
```

### Don't Overuse in Content

Icons in navigation: ✅ Great!  
Icons to emphasize points: ✅ Good!  
Icons after every word: ❌ Distracting!

**Good balance**:
```markdown
## Features

:check-circle: Easy to use
:check-circle: Fast and reliable
:check-circle: Well documented
```

**Too many**:
```markdown
:book: Our :rocket: platform :sparkles: makes :computer: development :chart: easier!
```

### Consider Accessibility

When using icons:
- Don't rely solely on icons for meaning
- Include descriptive text
- Use icons to enhance, not replace, content

## Common Icon Sets :package:

### Status Indicators

```markdown
:check-circle: Success
:x-circle: Error
:alert-triangle: Warning
:info: Information
```

### Actions

```markdown
:download: Download
:upload: Upload
:edit: Edit
:trash: Delete
:copy: Copy
:share: Share
```

### Navigation

```markdown
:home: Home
:arrow-left: Back
:arrow-right: Next
:external-link: External Link
```

### Development

```markdown
:code: Code
:terminal: Terminal
:git-branch: Git Branch
:package: Package
:bug: Bug
:wrench: Tool
```

## FAQ :help-circle:

**Q: What if an icon doesn't exist?**  
A: The icon name will display as text. Check the icon library references for valid names.

**Q: Can I use custom icons?**  
A: Currently only Lucide and FluentUI icons are supported.

**Q: Do icons affect SEO?**  
A: No, icons are visual enhancements. Screen readers see the text content.

**Q: Can I change icon libraries?**  
A: Yes! Just update your `_meta.json` files. Icons in markdown content will need manual updating.

**Q: Which library should I use?**  
A: Lucide for most cases. Use FluentUI if you want Microsoft's design style or need specific icons from that library.

## Browse Icons :compass:

Ready to find the perfect icon?

- [Browse Lucide Icons →](./lucide.md)
- [Browse FluentUI Icons →](./fluentui.md)

Both pages include searchable lists and common icons categorized by use case.
