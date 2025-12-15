# Image Upload Documentation

## Overview
Users can now upload and paste images directly into comments and feature descriptions using markdown.

## Features

### 1. Image Upload Button
- Click the upload button (📤) in the markdown toolbar
- Select images from your device
- Supports: JPEG, PNG, GIF, WebP
- Maximum size: 5MB per image

### 2. URL Image Insertion
- Click the link button (🔗) in the markdown toolbar
- Enter any image URL
- Add optional alt text for accessibility

### 3. Paste Images from Clipboard
- Copy an image to your clipboard (from screenshot, browser, etc.)
- Paste directly into any text area (Ctrl+V / Cmd+V)
- Images are automatically uploaded and inserted as markdown

## Technical Implementation

### API Endpoints
- `POST /api/upload/images` - Handles image uploads
- Returns JSON with image URL and filename

### File Storage
- Images stored in `/public/uploads/images/`
- Unique filenames generated with crypto.randomBytes()
- Directory ignored in git except for .gitkeep

### Security
- File type validation (image/* only)
- File size limits (5MB max)
- Authentication required for uploads
- Unique filenames prevent conflicts

### Components
- `ImageUpload` - Handles file selection and URL insertion
- `useImagePaste` - Hook for clipboard paste functionality  
- `MarkdownToolbar` - Enhanced with image upload buttons
- `useMarkdownEditor` - Enhanced to support image insertion

## Usage Examples

### Markdown Generated
```markdown
![Alt text](https://example.com/image.jpg)
![Uploaded file](./uploads/images/abc123.jpg)
![Pasted image 10:30:25 AM](./uploads/images/def456.png)
```

### Supported Locations
- Feature request descriptions (admin edit)
- Comment creation and editing
- Any component using MarkdownToolbar

## Accessibility
- All images require alt text
- Default alt text provided for uploaded/pasted images
- Screen reader compatible image descriptions