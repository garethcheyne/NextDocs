# Image Support in NextDocs

NextDocs supports three types of images in markdown documentation:

## 1. Local Images (Static Assets)

Place images in `/public/img/` directory and reference them with absolute paths:

```markdown
![Logo](/img/logo.png)
![Screenshot](/img/screenshots/dashboard.png)
```

Or use relative paths (will be resolved to `/public/img/`):

```markdown
![Icon](icon.png)
![Diagram](diagrams/architecture.png)
```

**Benefits:**
- Fast loading (served directly from Next.js)
- Automatic optimization and responsive sizing
- Works offline in development

## 2. Repository Images (Synced)

When `syncImages` is enabled on a repository, all images from the repository are automatically synced to `/public/img/[repo-path]/`:

```markdown
![Feature Screenshot](../assets/features/screenshot.png)
![Architecture](./diagrams/architecture.svg)
```

**Setup:**
1. Go to Admin → Repositories
2. Edit your repository
3. Enable "Sync Images" checkbox
4. Run sync

**Benefits:**
- Images from repository are available locally
- Faster loading than external URLs
- Works with relative paths in markdown
- Images cached between syncs

**Supported Formats:**
- PNG, JPG, JPEG, GIF, SVG, WebP, ICO

## 3. External URLs

Link directly to images hosted elsewhere:

```markdown
![GitHub Logo](https://github.com/github.png)
![Diagram](https://example.com/diagrams/flow.png)
```

**Benefits:**
- No storage needed
- Always up-to-date
- CDN delivery

**Note:** External images require internet connection and may load slower.

## Features

### Automatic Optimization
- Next.js automatically optimizes images
- Lazy loading for better performance
- Responsive sizing based on viewport
- WebP format when supported

### Captions
Images automatically display their alt text or title as a caption:

```markdown
![Dashboard Screenshot](screenshot.png "The main dashboard interface")
```

### Error Handling
If an image fails to load, a placeholder with the image path is shown:

```
⚠️ Image failed to load: /img/missing.png
```

### Accessibility
- Alt text for screen readers
- Semantic HTML structure
- Proper ARIA attributes

## Best Practices

1. **Use descriptive alt text** for accessibility
2. **Optimize images before upload** (compress, resize)
3. **Use appropriate formats**:
   - PNG for screenshots with text
   - JPG for photos
   - SVG for diagrams and icons
   - WebP for best compression
4. **Keep images organized** in subdirectories
5. **Use relative paths** in repository markdown for portability

## Repository Structure

```
your-repo/
├── docs/
│   ├── getting-started.md
│   └── assets/
│       ├── logo.png
│       └── screenshots/
│           └── dashboard.png
├── assets/
│   └── diagrams/
│       └── architecture.svg
```

When synced with `syncImages` enabled, images become available at:
- `/img/docs/assets/logo.png`
- `/img/docs/assets/screenshots/dashboard.png`
- `/img/assets/diagrams/architecture.svg`

## Next.js Configuration

The image loader is configured in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**', // Allow all HTTPS images
    },
  ],
}
```

## Troubleshooting

### Image not showing?

1. Check the image path is correct
2. Verify image is in `/public/img/` or synced from repository
3. Check browser console for errors
4. Ensure repository sync completed successfully

### External image blocked?

- Check Next.js allows the hostname in `next.config.ts`
- Verify image URL is accessible
- Check Content Security Policy settings

### Image sync not working?

1. Verify `syncImages` is enabled on repository
2. Check repository has valid access token
3. Review sync logs for errors
4. Ensure image extensions are supported
