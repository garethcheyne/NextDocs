# CI/CD Pipeline Quick Start Guide

## Overview
This Next.js application uses Azure DevOps for CI/CD with automatic deployment to UAT and manual approval for production.

## Quick Setup (5 minutes)

### 1. Prerequisites
- Azure subscription with owner/contributor access
- Azure DevOps organization
- PowerShell 5.1+ (Windows) or PowerShell Core 6+ (cross-platform)

### 2. Create Azure Resources
```bash
npm run azure:setup
```
This script will create:
- Resource groups (UAT and Production)
- Azure Container Registry
- App Service plans and web apps
- Optional PostgreSQL and Redis instances

### 3. Configure Azure DevOps
1. **Import Pipeline**: In Azure DevOps, create new pipeline from `azure-pipelines.yml`
2. **Run Config Script**: 
   ```bash
   npm run azure:config
   ```
3. **Add Service Connections**: Follow the output instructions to create Azure service connections
4. **Create Variable Groups**: Set up environment-specific variables as shown in the output

### 4. Deploy
1. Push to `main` branch → Triggers build and UAT deployment
2. Approve production deployment from Azure DevOps UI
3. Monitor deployments in Azure DevOps > Pipelines > Environments

## Environment URLs
After setup, your apps will be available at:
- **UAT**: `https://nextdocs-uat-[uniqueid].azurewebsites.net`
- **Production**: `https://nextdocs-prod-[uniqueid].azurewebsites.net`

## Troubleshooting
See the [full setup guide](./azure-devops-cicd-setup.md) for detailed troubleshooting and configuration options.

## Key Features
- ✅ Docker-based deployment
- ✅ Automatic UAT deployment
- ✅ Manual production approval
- ✅ Environment-specific configurations
- ✅ Rollback capabilities
- ✅ Comprehensive logging