# Writing Blog Posts

Learn how to create and publish blog posts in your documentation repository.

## What are Blog Posts? :newspaper:

Blog posts are time-based content that appear in reverse chronological order. They're perfect for:

- Release announcements
- Product updates
- Tutorials and how-to guides
- Company news
- Technical articles

## Blog Post Location :folder:

Blog posts should be placed in a `/blog` folder at the root of your documentation repository:

```
your-repo/
├── docs/           # Regular documentation
└── blog/           # Blog posts here
    ├── 2024-01-15-first-post.md
    ├── 2024-02-20-new-feature.md
    └── authors/    # Author profiles
```

## File Naming :file-text:

Blog post files should follow the naming convention:

```
YYYY-MM-DD-title-slug.md
```

**Examples:**
- `2024-01-15-getting-started.md`
- `2024-03-20-major-update.md`
- `2024-12-01-year-in-review.md`

The date in the filename is used as the publication date.

## Blog Post Frontmatter :file-code:

Each blog post requires frontmatter at the top of the file:

```markdown
---
title: Your Blog Post Title
author: john-doe
category: tutorials
tags: [getting-started, tips, features]
excerpt: A brief summary of your blog post that appears in listings
---

Your blog post content starts here...
```

### Required Fields

- **title**: The title of your blog post
- **author**: The author's ID (matches a file in `/blog/authors/`)
- **excerpt**: A short description (1-2 sentences)

### Optional Fields

- **category**: Category for grouping posts (e.g., tutorials, news, updates)
- **tags**: Array of tags for filtering and organization
- **publishedAt**: Override the file date with a specific datetime
- **isDraft**: Set to `true` to hide from publication

## Example Blog Post :package:

```markdown
---
title: Getting Started with Our New API
author: sarah-smith
category: tutorials
tags: [api, getting-started, developers]
excerpt: Learn how to integrate our new API in just 5 minutes with this step-by-step guide.
---

# Getting Started with Our New API

We're excited to announce our new REST API! Here's how to get started.

## Prerequisites

Before you begin, make sure you have:

- An API key (get one from the dashboard)
- Basic knowledge of REST APIs
- Your favorite HTTP client

## Quick Start

1. First, authenticate with your API key:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/v1/
\`\`\`

2. Make your first request...

## Next Steps

Check out our [API Documentation](/api-specs) for complete reference.
```

## Categories :tag:

Organize your blog posts with categories. Common categories include:

- `announcements` - Product announcements and releases
- `tutorials` - How-to guides and walkthroughs
- `news` - Company and product news
- `updates` - Feature updates and improvements
- `technical` - Technical deep-dives

## Tags :tags:

Use tags for cross-cutting topics:

```yaml
tags: [api, security, performance, mobile, cloud]
```

Tags help readers find related content across different categories.

## Publishing :send:

1. **Create** your blog post file in `/blog/`
2. **Add frontmatter** with required fields
3. **Write** your content in Markdown
4. **Commit and push** to your repository
5. **Sync** - NextDocs will automatically import it

## Draft Posts :file-edit:

To save a draft without publishing:

```yaml
---
title: My Draft Post
author: john-doe
isDraft: true
---
```

Draft posts are synced but not displayed publicly.

## Best Practices :lightbulb:

### Keep it Focused
- One main topic per post
- Clear, descriptive title
- Concise excerpt (under 200 characters)

### Use Good Structure
- Start with an introduction
- Use headings to organize content
- Include code examples when relevant
- End with next steps or conclusion

### Add Metadata
- Always include category and tags
- Use descriptive, searchable tags
- Link to related documentation

### Formatting
- Use markdown syntax (same as docs)
- Include inline icons: :lightbulb: for tips
- Add code blocks with syntax highlighting
- Use blockquotes for important notes

## Common Mistakes :x:

❌ **Don't** use spaces in filenames
❌ **Don't** forget the date prefix
❌ **Don't** skip the author field
❌ **Don't** use overly long excerpts

✅ **Do** use kebab-case for slugs
✅ **Do** include publication date
✅ **Do** create author profiles
✅ **Do** keep excerpts short and engaging

## Need Help? :help-circle:

- Check the [Markdown Guide](/guide/markdown) for formatting
- Learn about [Authors](/guide/authors) to create profiles
- See [Publishing](/guide/publishing) for sync setup
