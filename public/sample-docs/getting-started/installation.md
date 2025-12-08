# Installation Guide

This guide will walk you through installing and setting up your documentation system.

## :package: System Requirements

Before you begin, ensure you have:

- A Git repository (Azure DevOps or GitHub)
- Access credentials for your repository
- Admin access to NextDocs

## :download: Installation Steps

### Step 1: Create Your Repository

Create a new repository in your preferred platform:

- **Azure DevOps**: Create a new Git repository in your project
- **GitHub**: Create a new repository in your organization

### Step 2: Structure Your Documentation

Organize your docs following this structure:

```
docs/
├── _meta.json
├── index.md
├── getting-started/
│   ├── _meta.json
│   ├── index.md
│   └── installation.md
└── user-guide/
    ├── _meta.json
    └── index.md
```

### Step 3: Connect to NextDocs

1. Navigate to **Admin** → **Repositories**
2. Click **Add Repository**
3. Fill in your repository details:
   - Repository URL
   - Branch name
   - Access credentials
4. Click **Test Connection** to verify
5. Click **Save** to create the repository

### Step 4: Initial Sync

After adding your repository:

1. Click the :refresh-cw: **Sync** button
2. Wait for the sync to complete
3. Check the sync logs for any errors
4. Navigate to your docs to verify they appear correctly

## :wrench: Configuration

### Auto-sync Setup

Enable automatic synchronization to keep your docs up-to-date:

1. Edit your repository settings
2. Set **Sync Frequency** to your preferred interval (e.g., 1 hour)
3. Ensure the sync worker is running (check the status indicator)

### Access Control

Configure who can view your documentation:

- All authenticated users can view docs by default
- Use Azure AD SSO for enterprise authentication
- Admin users can manage repositories and features

## :white_check_mark: Verification

After installation, verify everything works:

- [ ] Repository is connected
- [ ] Initial sync completed successfully
- [ ] Documentation appears in navigation
- [ ] Links work correctly
- [ ] Icons display properly

## :sos: Troubleshooting

### Sync Fails

If synchronization fails:

1. Check the sync logs for error messages
2. Verify your credentials are correct
3. Ensure the repository URL and branch are valid
4. Test the connection again

### Missing Content

If content doesn't appear:

1. Verify files are in the correct location
2. Check that `_meta.json` files are valid JSON
3. Ensure markdown files have proper formatting
4. Review the sync logs for warnings

## Next Steps

Now that you're set up, continue to [Quick Start](./quick-start.md) to create your first documentation.
