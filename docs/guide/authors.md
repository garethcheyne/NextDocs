# Author Profiles

Create author profiles for blog posts and documentation contributors.

## What are Author Profiles? :user:

Author profiles provide information about content creators. They appear on:

- Blog posts (byline and author card)
- Documentation (when specified)
- Author listing pages

## Author File Location :folder:

Author profiles are JSON files stored in the `/blog/authors/` directory:

```
your-repo/
└── blog/
    └── authors/
        ├── john-doe.json
        ├── sarah-smith.json
        └── tech-team.json
```

## Author File Format :file-code:

Each author is defined in a JSON file:

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

## Field Descriptions :info:

### Required Fields

**name** (string)
- The author's full name
- Example: `"Jane Smith"`

**bio** (string)
- A short biography (1-3 sentences)
- Describes expertise or role
- Example: `"Product manager focused on developer experience"`

### Optional Fields

**title** (string)
- Job title or role
- Example: `"Lead Software Engineer"`

**email** (string)
- Contact email address
- Example: `"author@company.com"`

**avatar** (string)
- Path to author's profile image
- Can be relative `/img/authors/photo.jpg` or absolute URL
- Recommended size: 400x400px

**social** (object)
- Social media and professional profiles
- Supported platforms:
  - `twitter` - Twitter/X profile URL
  - `linkedin` - LinkedIn profile URL
  - `github` - GitHub profile URL
  - `website` - Personal website URL

## Complete Example

```json
{
  "name": "Sarah Chen",
  "title": "API Product Manager",
  "bio": "Passionate about creating developer-friendly APIs. Former software engineer turned product manager with a focus on developer experience.",
  "email": "sarah.chen@example.com",
  "avatar": "/img/authors/sarah-chen.jpg",
  "social": {
    "twitter": "https://twitter.com/sarahchen",
    "linkedin": "https://linkedin.com/in/sarah-chen",
    "github": "https://github.com/sarahchen",
    "website": "https://sarahchen.dev"
  }
}
```

## Using Authors in Blog Posts :link:

Reference an author in your blog post frontmatter using the filename (without `.json`):

```markdown
---
title: My Blog Post
author: sarah-chen
---
```

The system will automatically:
- Display the author's name and title
- Show their avatar
- Link to their profile
- Include their bio on the post page

## Team Authors :users:

You can create shared team accounts:

```json
{
  "name": "Engineering Team",
  "bio": "Posts from the entire engineering team covering technical topics, architecture decisions, and development best practices.",
  "avatar": "/img/authors/team-engineering.png"
}
```

Reference as:

```markdown
---
author: engineering-team
---
```

## Author Images :image:

### Image Guidelines

**Size**: 400x400 pixels (square)
**Format**: JPG or PNG
**Location**: `/blog/images/authors/` or `/public/img/authors/`

**Example structure:**
```
your-repo/
└── blog/
    ├── images/
    │   └── authors/
    │       ├── john-doe.jpg
    │       └── sarah-chen.jpg
    └── authors/
        ├── john-doe.json
        └── sarah-chen.json
```

### Using Images

In your author JSON:

```json
{
  "avatar": "/blog/images/authors/john-doe.jpg"
}
```

Or use external URLs:

```json
{
  "avatar": "https://example.com/photos/author.jpg"
}
```

## Multiple Authors :user-plus:

Some systems support multiple authors per post:

```markdown
---
title: Collaborative Post
authors: [john-doe, sarah-chen, tech-team]
---
```

Check with your admin if multi-author support is enabled.

## Best Practices :lightbulb:

### Naming Files
- Use lowercase
- Use hyphens (kebab-case)
- Match the author ID used in posts
- Example: `first-last.json`

### Writing Bios
- Keep it concise (1-3 sentences)
- Mention expertise or role
- Optional: Add personal touch
- Avoid jargon

### Profile Images
- Use professional photos
- Ensure good lighting
- Crop to square
- Use consistent style across team

### Social Links
- Only include active profiles
- Use complete URLs
- Verify links work
- Keep professional

## Common Mistakes :x:

❌ **Don't** use spaces in filenames  
❌ **Don't** forget required fields (name, bio)  
❌ **Don't** use broken image links  
❌ **Don't** include private information  

✅ **Do** use kebab-case filenames  
✅ **Do** test all social media links  
✅ **Do** keep bios professional  
✅ **Do** use square profile images  

## Updating Profiles :refresh-cw:

To update an author:

1. Edit their JSON file in `/blog/authors/`
2. Modify the fields you want to change
3. Commit and push changes
4. Sync will update all references automatically

Changes will apply to:
- All past blog posts
- Current author listings
- Future posts

## Example Directory Structure :package:

```
your-repo/
└── blog/
    ├── authors/
    │   ├── john-doe.json
    │   ├── sarah-chen.json
    │   ├── tech-team.json
    │   └── _meta.json (optional)
    ├── images/
    │   └── authors/
    │       ├── john-doe.jpg
    │       ├── sarah-chen.jpg
    │       └── tech-team.png
    └── 2024-01-15-first-post.md
```

## Related Topics :compass:

- [Blog Posts](/guide/blogs) - Learn how to write blog posts
- [Markdown Guide](/guide/markdown) - Formatting your content
- [Publishing](/guide/publishing) - Getting your content online
