# Publishing Your Docs

Learn how to connect your documentation repository to NextDocs and keep it in sync.

## What You'll Need :clipboard:

Before publishing, make sure you have:

- [x] A GitHub repository with a `docs/` folder
- [x] At least one `index.md` file
- [x] `_meta.json` files for navigation (recommended)
- [x] Content written in Markdown

## Information for Your Admin :handshake:

Your NextDocs administrator needs the following information to connect your documentation:

### 1. Repository Details

**Repository URL**:
```
https://github.com/your-username/your-repo-name
```

**Documentation Path** (where your docs live):
```
docs/
```

Or if your docs are in a different location:
```
documentation/
wiki/
```

### 2. Category Information

**Category Name**: What should this documentation be called in NextDocs?
- Example: "User Guide"
- Example: "API Documentation"
- Example: "Product Manual"

**Category Description** (optional):
- A brief description of what this documentation covers

### 3. Sync Preferences

**Sync Schedule** (optional preference):
- Hourly
- Daily
- On-demand only
- Custom schedule

**Branch** (if not `main` or `master`):
```
develop
docs
v2.0
```

## Publishing Checklist :rocket:

Before asking your admin to connect your repository:

- [ ] **Test locally**: Make sure markdown renders correctly in GitHub preview
- [ ] **Check links**: Verify all internal links work (use relative paths)
- [ ] **Validate JSON**: Ensure all `_meta.json` files have valid syntax
- [ ] **Review structure**: Confirm folder organization makes sense
- [ ] **Add icons**: Include icons in `_meta.json` for better navigation
- [ ] **Proofread**: Check for typos and formatting issues
- [ ] **Images**: Ensure all images are committed to the repository

## How Syncing Works :refresh-cw:

Once your admin connects your repository:

1. **Initial Sync**: All documentation is imported into NextDocs
2. **Automatic Updates**: Changes you push to GitHub are synced automatically
3. **Search Indexing**: Your content is indexed for the search feature
4. **Version Tracking**: NextDocs tracks when docs were last updated

### What Gets Synced

✅ **Synced**:
- All `.md` files in the docs folder
- `_meta.json` files
- Images referenced in markdown

❌ **Not synced**:
- Application code outside docs folder
- README.md in the root
- Configuration files (package.json, etc.)
- Node modules or build artifacts

## Making Updates :wrench:

After your docs are connected, just work normally:

```bash
# 1. Make your changes to markdown files
vim docs/guide/new-feature.md

# 2. Commit your changes
git add docs/
git commit -m "Add new feature documentation"

# 3. Push to GitHub
git push origin main

# 4. NextDocs syncs automatically!
```

Your changes will appear in NextDocs within minutes (depending on the sync schedule).

## Common Issues :alert-triangle:

### Changes Not Appearing

**Problem**: Pushed changes but they don't show up in NextDocs

**Solutions**:
1. Check the sync schedule - may need to wait
2. Ask your admin to trigger a manual sync
3. Verify you pushed to the correct branch
4. Check if the sync worker is running (admin can see this)

### Broken Links

**Problem**: Links work in GitHub but not in NextDocs

**Solution**: Make sure you're using relative paths with `.md` extensions:
- ✅ `./installation.md`
- ✅ `../index.md`
- ❌ `/docs/installation`
- ❌ `installation` (missing extension)

### Icons Not Showing

**Problem**: Icons in `_meta.json` don't appear

**Solution**: 
1. Check icon name spelling (case-sensitive)
2. Verify JSON syntax is valid
3. Use correct format: `"icon": "IconName"` or `"icon": "#fluentui IconName"`
4. See [Icon Libraries](./icons/index.md) for valid icon names

### Images Missing

**Problem**: Images don't load in NextDocs

**Solution**:
1. Ensure images are committed to the repository
2. Use relative paths: `![Alt](./images/screenshot.png)`
3. Verify image files exist in the correct location
4. Check file extensions are lowercase (.png not .PNG)

## Best Practices :lightbulb:

### Commit Messages

Write clear commit messages for documentation changes:

```bash
# Good
git commit -m "Add authentication guide"
git commit -m "Update API endpoint documentation"
git commit -m "Fix typos in installation guide"

# Less helpful
git commit -m "Update docs"
git commit -m "Changes"
```

### Testing Before Publishing

1. **Preview locally**: Use GitHub's markdown preview
2. **Check links**: Click through all internal links
3. **Validate structure**: Ensure navigation makes sense
4. **Review on mobile**: Check that content is readable on smaller screens

### Organizing Large Updates

For major documentation updates:

1. **Use branches**: Create a feature branch for large changes
2. **Small commits**: Break changes into logical commits
3. **Review before merging**: Preview the entire update
4. **Coordinate with admin**: Let them know about major restructuring

## Advanced: Multiple Categories :settings:

If you have different documentation sets in the same repository:

```
my-repo/
├── docs/
│   ├── user-guide/     # Category 1: User Guide
│   │   ├── _meta.json
│   │   └── index.md
│   ├── api/            # Category 2: API Reference
│   │   ├── _meta.json
│   │   └── index.md
│   └── tutorials/      # Category 3: Tutorials
│       ├── _meta.json
│       └── index.md
```

Your admin can set up separate categories pointing to different paths (e.g., `docs/user-guide`, `docs/api`, `docs/tutorials`) in the same repository.

## FAQ :help-circle:

**Q: Can I delete old documentation?**  
A: Yes! Delete the files and commit. The next sync will remove them from NextDocs.

**Q: Can I rename files?**  
A: Yes, but be aware this may break external links to those pages.

**Q: Can I reorganize folder structure?**  
A: Yes! Update your `_meta.json` files accordingly. Internal links may need updating.

**Q: How do I unpublish documentation?**  
A: Ask your admin to disconnect the repository or make it inactive.

**Q: Can I have private documentation?**  
A: Ask your admin about authentication settings for your category.

**Q: What happens if I break something?**  
A: You can always revert the commit in Git and re-sync. Your admin can also trigger a fresh sync from any commit.

## Getting Help :mail:

If you encounter issues:

1. **Check this guide**: Most common issues are covered here
2. **Contact your admin**: They can check sync logs and trigger manual syncs
3. **Review examples**: Download the sample template for working examples
4. **Check Git history**: See what changed between working and broken states

## Next Steps :compass:

Now that you understand publishing:

- Review [Repository Structure](./structure.md) for organizing your docs
- Check [Markdown Syntax](./markdown.md) for formatting options
- Browse [Icon Libraries](./icons/index.md) for navigation icons
- Download the sample template to see a working example

Ready to publish? Gather the information above and contact your NextDocs administrator! :rocket:
