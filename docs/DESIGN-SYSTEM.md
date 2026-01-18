# Design System Standards

**Last Updated:** January 10, 2026  
**Version:** 1.0.0 (Pre-Production Release)

This document defines the design standards and conventions for the NextDocs application to ensure consistency across all components and pages.

---

## 🎨 Color System

### Brand Colors
Defined in `tailwind.config.ts`:
```typescript
'brand-navy': '#1a2332'
'brand-navy-light': '#2a3442'
'brand-orange': '#ff6b35'
'brand-orange-hover': '#ff5520'
'brand-gray': '#8b9bb3'
```

### Status Colors
**Centralized in:** `src/lib/status-colors.ts`

All status-based components **MUST** import from this file to maintain consistency.

| Status | Color | Usage |
|--------|-------|-------|
| `proposal` | Yellow (`bg-yellow-500`) | New feature requests awaiting review |
| `approved` | Purple (`bg-purple-500`) | Approved and ready for development |
| `in-progress` | Blue (`bg-blue-500`) | Currently being developed |
| `completed` | Green (`bg-green-500`) | Finished and deployed |
| `declined` | Red (`bg-red-500`) | Rejected or won't implement |
| `on-hold` | Orange (`bg-orange-500`) | Paused or delayed |

**Important:** Use the helper functions:
```typescript
import { getStatusBgClass, getStatusHoverClass, getStatusColors } from '@/lib/status-colors'

// For badge backgrounds
<Badge className={getStatusBgClass(status)}>

// For hover effects
<Card className={getStatusHoverClass(status)}>
```

---

## 📦 Component Standards

### Card Padding
Standardized padding values for consistent spacing:

| Context | Padding Class | Usage |
|---------|--------------|-------|
| **Extended Card Content** | `p-4` | Full-featured card displays (blog posts, features, releases) |
| **Compact Card Content** | `p-3` | Condensed card displays (lists, grids) |
| **Large Content Areas** | `p-6` | Profile tabs, analytics, dashboard cards |
| **No Padding** | `p-0` | Special cases (API docs, custom layouts) |

**Examples:**
```tsx
// Extended view
<CardContent className="p-4">

// Compact view  
<CardContent className="p-3">

// Dashboard/Profile
<CardContent className="p-6">
```

### Card Hover Effects
Standardized hover border animations:

| Card Type | Hover Class | Notes |
|-----------|-------------|-------|
| **Status-based Cards** | `getStatusHoverClass(status)` | Feature requests, activities |
| **Release Cards** | `hover:border-primary/50` | Consistent primary color |
| **Blog Cards** | `hover:border-primary` | Full primary color |
| **Animated Cards** | Built-in via AnimatedCard | Uses brand-orange |

**Migration:** All cards have been updated to use centralized hover classes.

---

## 📏 Spacing Scale

### Gap Values
Consistent spacing between elements:

| Use Case | Gap Class | Pixels |
|----------|-----------|--------|
| Icon + Text | `gap-1` or `gap-2` | 4px - 8px |
| Inline Elements | `gap-2` or `gap-3` | 8px - 12px |
| Card Items | `gap-3` or `gap-4` | 12px - 16px |
| Section Spacing | `gap-6` or `gap-8` | 24px - 32px |

**Examples:**
```tsx
// Icon with label
<span className="flex items-center gap-1">
  <Icon className="w-4 h-4" />
  Label
</span>

// List of cards
<div className="flex flex-col gap-4">

// Page sections
<div className="space-y-6">
```

### Margin Guidelines
- Use `space-y-*` for vertical stacking
- Use `gap-*` for flexbox/grid layouts
- Avoid mixing margins and gaps in the same container

---

## 🧩 Component Organization

### Upload Components
**Consolidated to 2 components:**

1. **`category-icon-upload.tsx`** - Advanced icon upload with crop/zoom (412 lines)
   - Use for: Category icons, team logos
   - Features: Drag-drop, crop, zoom, rotation
   
2. **`image-upload.tsx`** - Markdown image insertion
   - Use for: Blog posts, feature descriptions
   - Features: File upload, URL insertion, preview

**Deleted:** `icon-upload.tsx` (redundant, unused)

### Badge Components
**Centralized badge system:**

1. **`StatusBadge`** - Feature status display
   - Location: `src/components/features/status-badge.tsx`
   - Props: `status`, `className`
   - Includes icon + label

2. **`CategoryBadge`** - Category display
   - Location: `src/components/features/category-badge.tsx`
   - Props: `category`, `className`
   - Supports custom icons and colors

---

## 🔧 Best Practices

### Import Standards
```typescript
// ✅ DO: Import from centralized config
import { getStatusColors } from '@/lib/status-colors'

// ❌ DON'T: Hardcode status colors
const colors = { approved: 'bg-purple-500' }
```

### Consistent Prop Naming
```typescript
// Card components should use consistent props:
interface CardProps {
  isExtended?: boolean  // Full vs compact view
  isAnimated?: boolean  // Enable AnimatedCard wrapper
  statusColors?: Record<string, string> // Legacy, use centralized instead
}
```

### Animation Props
All card components support `isAnimated` prop:
```tsx
<BlogPostCard isAnimated={true} />
<ReleaseCard isAnimated={true} />
<FeatureRequestCard isAnimated={true} />
<FeatureActivityCard isAnimated={true} />
```

---

## 📚 Component Reference

### Card Components
Located in `src/components/cards/`:
- ✅ `blog-post-card.tsx` - Blog display
- ✅ `release-card.tsx` - Release notes
- ✅ `feature-request-card.tsx` - Feature displays
- ✅ `feature-activity-card.tsx` - User activity
- ✅ `author-hover-card.tsx` - Author info popover

### UI Components
Located in `src/components/ui/`:
- ✅ `animated-card.tsx` - Reusable animation wrapper
- ✅ `button.tsx` - Shadcn/ui button (single source)
- ✅ `badge.tsx` - Shadcn/ui badge
- ✅ `card.tsx` - Shadcn/ui card base
- ✅ `category-icon-upload.tsx` - Icon upload with crop
- ✅ `image-upload.tsx` - Markdown image insertion

### Feature Components
Located in `src/components/features/`:
- ✅ `status-badge.tsx` - Centralized status display
- ✅ `category-badge.tsx` - Category display
- ✅ `comment-form.tsx` - Comment input
- ✅ `new-feature-form.tsx` - Feature request form

---

## 🚀 Production Readiness Checklist

### ✅ Completed
- [x] Centralized status color configuration
- [x] Updated StatusBadge component
- [x] Updated all card components with unified colors
- [x] Deleted redundant icon-upload.tsx
- [x] Standardized card hover effects
- [x] Created design standards documentation

### 📋 Recommended Before Launch
- [ ] Run full production build: `npm run build`
- [ ] Test all status color variations
- [ ] Verify card animations across browsers
- [ ] Check responsive layouts on mobile
- [ ] Review accessibility (WCAG 2.1)
- [ ] Optimize images in public/img
- [ ] Database backup verification
- [ ] Environment variables check
- [ ] SSL certificate configuration
- [ ] CDN setup for static assets

---

## 🔄 Migration Guide

### For Developers

If you're updating existing code:

1. **Replace hardcoded status colors:**
   ```typescript
   // Before
   const statusColors = {
     approved: 'bg-purple-500',
     completed: 'bg-green-500'
   }
   
   // After
   import { getStatusBgClass } from '@/lib/status-colors'
   ```

2. **Update card hover classes:**
   ```tsx
   // Before
   <Card className="hover:border-yellow-500/50">
   
   // After (for status-based)
   <Card className={getStatusHoverClass(feature.status)}>
   
   // After (for generic)
   <Card className="hover:border-primary/50">
   ```

3. **Standardize card padding:**
   ```tsx
   // Check if your card should use p-3, p-4, or p-6
   // See "Card Padding" section above
   <CardContent className="p-4"> {/* Extended view */}
   ```

---

## 📝 Notes

- All changes are backward compatible
- Legacy `statusColors` prop still works but is deprecated
- AnimatedCard wrapper is opt-in via `isAnimated` prop
- Design system will be versioned with releases

**Questions?** Contact the development team or check the component source code for implementation examples.
