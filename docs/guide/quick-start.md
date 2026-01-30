# Quick Start

Get your documentation up and running in 5 minutes!

## What You'll Need :clipboard:

1. **A GitHub Repository** - Where your documentation will live
2. **NextDocs Access** - Contact your administrator to get your repository connected
3. **A Text Editor** - Any editor works (VS Code, Notepad++, etc.)

## 5-Minute Setup :rocket:

### Step 1: Create Your Repository Structure

Create the following structure in your GitHub repository:

```
my-project/
├── docs/                    # Documentation content
│   ├── _meta.json          # Navigation configuration
│   ├── index.md            # Documentation homepage
│   ├── getting-started/
│   │   ├── _meta.json
│   │   ├── index.md
│   │   ├── installation.md
│   │   ├── img/            # Images for this section
│   │   └── videos/         # Videos for this section
│   └── user-guide/
│       ├── _meta.json
│       ├── index.md
│       ├── img/            # Images for this section
│       └── videos/         # Videos for this section
├── blog/                    # Blog posts (optional)
│   └── 2024/
│       └── 12/
│           └── announcement.md
├── authors/                 # Author profiles (optional)
│   └── john-doe.json
├── api-specs/              # API documentation (optional)
│   └── my-api/
│       ├── index.md        # API overview
│       └── my-api.yaml     # OpenAPI spec
└── README.md               # Project README
```

### Step 2: Create Your First Page

Create `docs/index.md` with the following content:

```
# Welcome to My Documentation

This is the home page of my documentation.

## Features :sparkles:

- Easy to write
- Beautiful formatting
- Automatic sync

## Getting Started

Check out our [installation guide](./getting-started/installation.md) to begin!
```

### Step 3: Add Navigation

Create `docs/_meta.json`:

```json
{
  "index": {
    "title": "Home",
    "icon": "Home"
  },
  "getting-started": {
    "title": "Getting Started",
    "icon": "Rocket"
  },
  "guides": {
    "title": "Guides",
    "icon": "BookOpen"
  }
}
```

### Step 4: Provide Info to Admin

Send your administrator:

- **Repository URL**: `https://github.com/username/my-project`
- **Documentation Path**: `docs/` (or wherever your docs live)
- **Category Name**: What to call your docs (e.g., "My Project Documentation")

### Step 5: Write More Content!

That's it! Once your admin connects the repository, it will sync automatically. Just commit and push your changes to GitHub.

## Next Steps :lightbulb:

- Learn about [Repository Structure](./structure.md) for organizing larger doc sets
- Explore [Markdown Syntax](./markdown.md) for rich formatting
- Add [Icons](./icons/index.md) to make your docs more visual
- Read about [Navigation & Metadata](./metadata.md) for advanced organization

## Try It Out :flask:

Download our sample template to see a working example with all features demonstrated.

[Download Sample Template](#) <!-- Link will be functional in the app -->

## Common Questions :help-circle:

**Q: How often does it sync?**  
A: Your admin can set up automatic sync on a schedule (hourly, daily, etc.) or trigger manual syncs.

**Q: Can I preview changes before syncing?**  
A: Yes! Render the markdown locally or use GitHub's preview. The NextDocs rendering will be very similar.

**Q: What if I break something?**  
A: Don't worry! Git keeps all your history. You can always revert changes and re-sync.

**Q: Can I use folders to organize docs?**  
A: Absolutely! Check the [Repository Structure](./structure.md) guide for best practices.
