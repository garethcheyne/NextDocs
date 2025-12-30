---
version: 2025.12.31.01
title: "AI Guild: Documentation Creation Guide"
description: "Comprehensive guide for AI systems on creating and organizing documentation in the NextDocs repository following established patterns and conventions."
---

# AI Guild: Documentation Creation Guide

This guide provides instructions for AI systems on how to create and organize documentation in this NextDocs repository following established patterns and conventions.

## 🏗️ Repository Structure

### Required Directory Structure

```
project-root/
├── docs/              # Main documentation (REQUIRED)
│   ├── _meta.json     # Project listings (REQUIRED)
│   ├── project-a/     # Individual project documentation
│   │   ├── _meta.json # Navigation configuration
│   │   ├── index.md   # Project homepage
│   │   └── [sections]/ # Organized content sections
│   └── project-b/     # Another project
│       ├── _meta.json
│       ├── index.md
│       └── [sections]/
├── blog/              # Blog posts (optional)
│   ├── 2024/          # Year-based organization
│   │   ├── 01/        # Month subdirectories
│   │   │   └── post-title.md
│   │   └── 12/
│   │       └── another-post.md
│   └── 2025/
│       └── 01/
├── authors/           # Author profiles (shared, root level)
│   ├── john-doe.json
│   └── sarah-smith.json
├── api-specs/         # API documentation (optional)
│   ├── user-api/      # API spec subdirectories
│   │   ├── index.md   # API documentation
│   │   └── swagger.yaml
│   └── admin-api/
│       ├── index.md
│       └── swagger.yaml
└── public/sample-docs/ # Sample documentation structure
```

### Content Types

- **docs/[project-name]/**: Project-specific documentation (always required, organized by project)
- **blog/**: Time-based blog posts organized by year/month subdirectories
- **authors/**: Author profile JSON files (shared, root level)
- **api-specs/**: OpenAPI/Swagger specifications organized in subdirectories with index.md and swagger.yaml

## 📁 Creating Documentation Sections

### 1. Directory Organization

- Use **lowercase with hyphens** for all directories: `user-guide/`, `api-reference/`, `getting-started/`
- Each directory MUST contain an `index.md` file as the section homepage
- Store section-specific images in an `_img/` subdirectory within each section

### 2. File Naming Conventions

- Use **lowercase with hyphens** for all files: `quick-start.md`, `installation-guide.md`
- Always use `.md` extension for Markdown files
- Keep names short but descriptive
- Avoid spaces, underscores, or special characters

### 3. Example Structure

```
docs/
├── my-project/        # Project-specific directory
│   ├── _meta.json
│   ├── index.md
│   ├── getting-started/
│   │   ├── _meta.json
│   │   ├── index.md
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   └── _img/
│   │       └── setup-diagram.png
│   └── user-guide/
│       ├── _meta.json
│       ├── index.md
│       ├── basic-features.md
│       ├── advanced-features.md
│       └── _img/
│           └── interface-screenshot.png
└── another-project/   # Additional project
    ├── _meta.json
    ├── index.md
    └── api-reference/
        ├── _meta.json
        ├── index.md
        └── endpoints.md
```

## 🧭 Navigation Configuration (`_meta.json`)

### Root Projects Listing (REQUIRED)

The root `docs/` directory MUST contain a `_meta.json` file that lists all projects:

**Location**: `docs/_meta.json`

```json
{
  "my-project": {
    "title": "My Project",
    "icon": "Package",
    "description": "My Project — a comprehensive solution for managing widgets and gadgets. See the project repository for details."
  },
  "another-project": {
    "title": "Another Project",
    "icon": "Rocket",
    "description": "Another Project — innovative tools for modern development workflows."
  }
}
```

**Required fields for each project**:

- `title`: Human-readable project name
- `icon`: Lucide icon name (see Available Icons section below)
- `description`: Brief description of the project (1-2 sentences)

### Project Navigation

Every directory containing documentation MUST have a `_meta.json` file that controls:

- Navigation order and hierarchy within that project/section
- Display titles (can differ from filenames)
- Icons for visual navigation

**Note**: Each project under `/docs/` has its own navigation structure defined by its `_meta.json` files.

### Format

```json
{
  "filename-without-extension": {
    "title": "Human-Readable Display Title",
    "icon": "IconName"
  }
}
```

### Example `_meta.json`

```json
{
  "index": {
    "title": "Overview",
    "icon": "Home"
  },
  "installation": {
    "title": "Installation Guide", 
    "icon": "Download"
  },
  "quick-start": {
    "title": "Quick Start",
    "icon": "Zap"
  },
  "advanced-features": {
    "title": "Advanced Features",
    "icon": "Settings"
  }
}
```

### Available Icons

Icons use the **Lucide** icon library. You can use any Lucide icon name (PascalCase format).

**Common icons include**: `Home`, `BookOpen`, `Zap`, `Download`, `Settings`, `Code`, `User`, `FolderTree`, `FileText`, `Newspaper`, `Rocket`, `Info`, `Shield`, `Database`, `Globe`, `Search`, `Smile`, `Package`, `Terminal`, `Wrench`, `Star`, `Heart`, `CheckCircle`, `AlertCircle`, `Lock`, `Unlock`, `Calendar`, `Clock`, `Mail`, `Phone`, `MapPin`, `Image`, `Video`, `Music`, `Camera`, `Headphones`

**Reference**: Visit [Lucide Icons](https://lucide.dev/icons/) for the complete icon catalog. Use the icon name exactly as shown (PascalCase).

## 📝 Creating Documentation Files

### File Structure

Each documentation file should:

1. Start with a clear H1 heading (`# Title`)
2. Include a brief description of the content
3. Use consistent heading hierarchy (H1 → H2 → H3 → etc.)
4. Include relevant examples and code snippets

### Example Documentation File

```markdown
# Feature Documentation

Brief description of what this feature does and why it's important.

## Getting Started :rocket:

Step-by-step instructions...

### Prerequisites

List what users need before starting:
- Requirement 1
- Requirement 2

### Installation

\`\`\`bash
npm install feature-name
\`\`\`

## Usage Examples :code:

Provide practical examples...

## Configuration :settings:

Explain configuration options...
```

## 📄 Document Frontmatter (YAML)

Every documentation Markdown file (project pages, guides, user manuals) should include a YAML frontmatter block at the top of the file to define metadata used by the site. This frontmatter controls title, description, author, category, page type, source, and access restrictions.

Example frontmatter:

```yaml
---
title: Accounts Payable Processes
description: Comprehensive guide for accounts payable processes including approvals, vendor invoicing, returns, and item revaluation in Business Central
author: gareth-cheyne
category: dynamics-365-bc
type: user-guide
source: UG Accounts Payable - Finance Franchise Processes - BC v1.02.pdf
restricted: true
restrictedRoles:
  - SGRP-CRM-Finance-Franchisee
  - SGRP-CRM-*
---
```

Notes and fields:

- **title** (string) — Human-readable page title.
- **description** (string) — Short summary for listings and SEO.
- **author** (string) — Author id (must match an author file in `/authors/`).
- **category** (string) — Project or product category (used for filtering/navigation).
- **type** (string) — Page type (e.g., `user-guide`, `how-to`, `api-reference`).
- **source** (string) — Optional original source (document name or reference).
- **restricted** (boolean) — If `true`, the page is access-restricted.
- **restrictedRoles** (array) — List of roles that may access the page (when `restricted: true`).

Images referenced by documentation should be stored in the section's `_img/` subdirectory and referenced in Markdown as `![](_img/your-image.png)` or from frontmatter values when applicable. Keep filenames lowercase with hyphens.

---

## � Creating API Specifications

### Directory Structure

API specifications should be organized in subdirectories within `/api-specs/`:

```
api-specs/
├── user-api/
│   ├── index.md       # API documentation
│   └── swagger.yaml   # OpenAPI specification
├── admin-api/
│   ├── index.md
│   └── swagger.yaml
└── payment-api/
    ├── index.md
    └── swagger.yaml
```

### API Directory Contents

Each API specification directory should contain:

- **index.md**: Human-readable API documentation, guides, and examples
- **swagger.yaml** (or **openapi.yaml**): Machine-readable API specification

### Example API Documentation (`index.md`)

```markdown
# User API Documentation

Comprehensive guide to the User API endpoints and functionality.

## Overview

The User API provides endpoints for managing user accounts, authentication, and profile data.

## Authentication

All endpoints require authentication via API key in the header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Base URL

\`\`\`
https://api.example.com/v1/users
\`\`\`

## Common Examples

### Get User Profile
\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.example.com/v1/users/profile
\`\`\`

## Interactive API Reference

See the [Swagger Documentation](swagger.yaml) for the complete API specification.
```

## �📰 Creating Blog Posts

### Location and Naming

- Place blog posts in `/blog/YYYY/MM/` directory structure
- Use naming convention: `title-slug.md` (date is determined by directory structure)
- Examples:
  - `/blog/2024/12/new-feature-release.md`
  - `/blog/2024/11/getting-started-guide.md`
  - `/blog/2025/01/year-review.md`

### Required Frontmatter

Every blog post MUST include frontmatter:

```markdown
---
title: Your Blog Post Title
author: author-id
category: tutorials
tags: [tag1, tag2, tag3]
excerpt: Brief 1-2 sentence description that appears in listings
---

Blog post content starts here...
```

### Fields Explained

- **title**: The display title of the blog post
- **author**: Must match an author file in `/authors/` (without .json extension)
- **category**: Group posts (tutorials, news, updates, announcements)
- **tags**: Array of relevant tags for filtering
- **excerpt**: Short summary for post listings

### Optional Blog Fields

- **isDraft**: Set to `true` to hide from publication
- **publishedAt**: Override directory date with specific datetime (ISO format: `2024-12-22T10:30:00Z`)
- **featuredImage**: Path to hero image for the post
- **description**: SEO meta description (if different from excerpt)
- **readTime**: Estimated reading time in minutes (auto-calculated if not provided)
- **updateDate**: Date when content was last significantly updated

## 👤 Creating Author Profiles

### Location

Author profiles are JSON files stored in the root `/authors/` directory:

```
authors/john-doe.json
authors/sarah-smith.json
authors/tech-team.json
```

### Author File Format

```json
{
  "name": "John Doe",
  "title": "Senior Developer", 
  "bio": "Full-stack developer with 10 years of experience in web technologies.",
  "email": "john.doe@example.com",
  "avatar": "/img/authors/john-doe.jpg",
  "social": {
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe", 
    "github": "https://github.com/johndoe"
  }
}
```

### Required Fields

- **name**: Full name of the author
- **title**: Professional title or role
- **bio**: Brief professional description

### Optional Fields  

- **email**: Contact email
- **avatar**: Path to profile image
- **social**: Object with social media URLs

## 📋 Content Creation Workflow

### For New Projects

1. **Create root projects listing** if it doesn't exist: `docs/_meta.json`
2. Add your project entry to `docs/_meta.json` with title, icon, and description
3. Create project directory under `/docs/[project-name]/`
4. Create project `_meta.json` file with navigation structure
5. Add `index.md` as the project homepage
6. Create content sections as needed

### For Documentation Sections

1. Create or identify the project directory under `/docs/[project-name]/`
2. Create content directories with appropriate lowercase-hyphen naming
3. Add `index.md` as the section homepage
4. Create the `_meta.json` file with navigation structure
5. Add individual content files following naming conventions
6. Create `_img/` subdirectory for section-specific images

### For Blog Posts

1. Create author profile in `/authors/` if it doesn't exist
2. Create year directory `/blog/YYYY/` if it doesn't exist
3. Create month directory `/blog/YYYY/MM/` if it doesn't exist
4. Create blog post with title naming: `title-slug.md`
5. Include complete frontmatter with all required fields
6. Write content following markdown best practices

### For Authors

1. Create JSON file in `/authors/` using author-id as filename
2. Include all required fields (name, title, bio)
3. Add optional fields as appropriate (email, avatar, social links)

### For API Specifications

1. Create subdirectory in `/api-specs/` with descriptive name (e.g., `user-api/`)
2. Add `index.md` with human-readable API documentation and examples
3. Add `swagger.yaml` (or `openapi.yaml`) with machine-readable specification
4. Link between documentation and specification files
5. Include practical examples and authentication details

## 🎯 Best Practices

### Content Organization

- Group related content in logical directories
- Use clear, descriptive section names
- Maintain consistent depth (avoid too many nested levels)
- Always provide an `index.md` for each directory

### Writing Style  

- Use clear, concise language
- Include practical examples
- Add appropriate emojis for visual appeal (`:icon-name:` format)
- Structure content with consistent heading hierarchy

### Technical Guidelines

- Always validate JSON files for proper syntax
- **Internal links**: Use root-relative paths starting with `/` (omit the `.md` extension), e.g., `[Quick Start](/getting-started/quick-start)` — this ensures consistent links across the site
- **Images**: Reference section images in the `_img/` subdirectory (relative to the doc file), e.g., `![](_img/setup-diagram.png)`
- Test all code examples before publishing
- Ensure all `_meta.json` files reference actual existing files

### Maintenance

- Keep navigation menus logical and not too deep
- Update `_meta.json` when adding or removing files
- Maintain consistency in naming conventions across all content
- Regular review of content organization for improvements

## 🔍 Validation Checklist

Before creating content, ensure:

- [ ] Root `docs/_meta.json` exists with project listings
- [ ] New project is added to root `docs/_meta.json` (if creating new project)
- [ ] Project directory exists under `/docs/[project-name]/`
- [ ] Directory uses lowercase-hyphen naming
- [ ] Project-level `_meta.json` exists and is valid JSON  
- [ ] All referenced files in `_meta.json` actually exist
- [ ] Author profiles exist for all blog post authors
- [ ] Blog post frontmatter includes all required fields
- [ ] Images are stored in appropriate `_img/` subdirectories
- [ ] File naming follows established conventions
- [ ] Navigation structure remains logical and user-friendly

This guide ensures consistent, well-organized documentation that follows the established patterns and conventions of this NextDocs repository.

---

## 🔧 Technical Specifications

### File Encoding and Format

- **Encoding**: All files must be UTF-8
- **Line Endings**: Use LF (Unix-style) line endings
- **Markdown**: CommonMark specification with GitHub Flavored Markdown extensions

### Image Guidelines

- **Supported Formats**: PNG, JPG, WebP, SVG
- **Recommended Size**: Maximum 1920px width for screenshots
- **Optimization**: Compress images for web (aim for <500KB per image)
- **Alt Text**: Always include descriptive alt text for accessibility
- **Naming**: Use lowercase-hyphen naming for image files

### Link Formatting

- **Internal Links**: Use root-relative paths starting with `/` for documentation pages (omit the `.md` extension), e.g., `[Quick Start](/getting-started/quick-start)` — do not use relative paths from the current file location for page links
- **Cross-Project**: Use root-level project paths, e.g., `/docs/other-project/section` (or `/project-name/section` depending on site routing)
- **External Links**: Always use HTTPS when possible
- **Anchors**: Use lowercase-hyphen format for heading anchors

### Code Block Standards

```markdown
\`\`\`language-identifier
// Always specify language for syntax highlighting
const example = "properly formatted code";
\`\`\`
```

**Supported Languages**: `javascript`, `typescript`, `python`, `bash`, `json`, `yaml`, `markdown`, `html`, `css`, `sql`, `dockerfile`

### URL and Slug Generation

- **Auto-generated**: URLs are created from file paths and project structure
- **Format**: `/docs/project-name/section/filename` (without .md extension)
- **Special Characters**: Automatically converted to hyphens in URLs
- **Case**: All URLs are lowercase

## 📝 Content Guidelines

### Writing Style

- **Tone**: Clear, concise, and helpful
- **Person**: Use second person ("you") for instructions
- **Active Voice**: Prefer active voice over passive
- **Headings**: Use sentence case (not title case)

### Formatting Standards

- **Bold**: Use `**text**` for emphasis and UI elements
- **Italics**: Use `*text*` for technical terms or emphasis
- **Code**: Use `` `code` `` for inline code, commands, and filenames
- **Lists**: Use `-` for unordered lists, `1.` for ordered lists
- **Tables**: Always include headers and align columns consistently

### Accessibility Requirements

- **Heading Hierarchy**: Use proper H1 → H2 → H3 progression (no skipping levels)
- **Alt Text**: Required for all images with descriptive content
- **Link Text**: Use descriptive text, avoid "click here" or "read more"
- **Color**: Don't rely solely on color to convey information

## 🚫 Content Restrictions

### What NOT to Include

- **Sensitive Data**: No API keys, passwords, or personal information
- **Copyrighted Material**: Only use original content or properly licensed material
- **Temporary URLs**: Avoid localhost or temporary links in examples
- **Hardcoded Dates**: Use relative dates ("recently", "in 2024") unless historically significant

### Error Prevention

- **File Conflicts**: Check if files already exist before creating
- **Broken Links**: Verify all internal links point to existing files
- **Missing Dependencies**: Ensure referenced authors, images, and files exist
- **Duplicate Content**: Avoid creating redundant documentation

## 🔄 Workflow Considerations

### Before Creating Content

1. **Survey Existing**: Check if similar content already exists
2. **Plan Structure**: Determine the best project and section placement
3. **Verify Resources**: Ensure authors, images, and references are available
4. **Consider Audience**: Match content complexity to intended users

### Content Lifecycle

- **Draft State**: Use `isDraft: true` in frontmatter for work-in-progress
- **Review Process**: Content should be complete and tested before publishing
- **Updates**: When updating existing content, maintain backward compatibility
- **Archives**: Don't delete old content; move to archive sections if needed

### Integration Points

- **Search**: Content is automatically indexed for search functionality
- **Navigation**: Appears in menus based on `_meta.json` configuration
- **Cross-references**: Can be linked from other projects and sections
- **API Integration**: API specs automatically generate interactive documentation
