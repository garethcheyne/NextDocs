# Azure DevOps CI/CD Pipeline Setup Guide

This guide helps you set up a complete CI/CD pipeline for NextDocs using Azure DevOps, deploying to UAT first, then Production after manual approval.

## 🏗️ **Pipeline Architecture**

```mermaid
graph LR
    A[Push to Main] --> B[Build Docker Image]
    B --> C[Push to ACR]
    C --> D[Deploy to UAT]
    D --> E[Manual Approval]
    E --> F[Deploy to Production]
```

## 📋 **Prerequisites**

### 1. Azure Resources Required

**Container Registry:**
- Azure Container Registry (ACR) for storing Docker images
- Name: `nextdocs-acr` (or update in pipeline variables)

**UAT Environment:**
- Resource Group: `rg-nextdocs-uat`
- App Service: `nextdocs-uat` (Linux, Docker container)
- Azure Database for PostgreSQL (or containerized)
- Azure Cache for Redis (or containerized)

**Production Environment:**
- Resource Group: `rg-nextdocs-prod`
- App Service: `nextdocs-prod` (Linux, Docker container)
- Azure Database for PostgreSQL (or containerized)
- Azure Cache for Redis (or containerized)

### 2. Azure DevOps Setup

**Service Connection:**
- Create Azure Resource Manager service connection
- Name: `nextdocs-service-connection`
- Scope: Subscription level with Contributor access

**Variable Groups:**

Create two variable groups in Azure DevOps:

#### `nextdocs-uat-vars`
```
UAT_DATABASE_URL = postgresql://user:pass@uat-db-host:5432/nextdocs
UAT_REDIS_URL = redis://:pass@uat-redis-host:6380
UAT_POSTGRES_PASSWORD = <uat-db-password>
UAT_REDIS_PASSWORD = <uat-redis-password>
```

#### `nextdocs-prod-vars`
```
PROD_DATABASE_URL = postgresql://user:pass@prod-db-host:5432/nextdocs
PROD_REDIS_URL = redis://:pass@prod-redis-host:6380
PROD_POSTGRES_PASSWORD = <prod-db-password>
PROD_REDIS_PASSWORD = <prod-redis-password>
```

**Shared Variables (add to both groups):**
```
NEXTAUTH_SECRET = <your-nextauth-secret>
ENCRYPTION_KEY = <your-encryption-key>
WORKER_SECRET = <your-worker-secret>
AZURE_AD_CLIENT_ID = <your-azure-ad-client-id>
AZURE_AD_CLIENT_SECRET = <your-azure-ad-client-secret>
AZURE_AD_TENANT_ID = <your-azure-ad-tenant-id>
ALLOWED_AD_GROUPS = <your-allowed-groups>
ADMIN_AD_GROUPS = <your-admin-groups>
AZURE_GRAPH_CLIENT_ID = <your-graph-client-id>
AZURE_GRAPH_CLIENT_SECRET = <your-graph-client-secret>
AZURE_GRAPH_TENANT_ID = <your-graph-tenant-id>
EMAIL_REST_API = <your-email-api-url>
EMAIL_API_KEY = <your-email-api-key>
```

## 🔧 **Setup Steps**

### 1. Create Azure Resources

**Create Resource Groups:**
```bash
az group create --name rg-nextdocs-uat --location australiaeast
az group create --name rg-nextdocs-prod --location australiaeast
```

**Create Container Registry:**
```bash
az acr create --resource-group rg-nextdocs-uat --name nextdocsacr --sku Basic --admin-enabled true
```

**Create App Services:**
```bash
# UAT App Service
az appservice plan create --name nextdocs-plan-uat --resource-group rg-nextdocs-uat --sku B1 --is-linux
az webapp create --resource-group rg-nextdocs-uat --plan nextdocs-plan-uat --name nextdocs-uat --deployment-container-image-name nextdocsacr.azurecr.io/nextdocs:latest

# Production App Service
az appservice plan create --name nextdocs-plan-prod --resource-group rg-nextdocs-prod --sku P1V2 --is-linux
az webapp create --resource-group rg-nextdocs-prod --plan nextdocs-plan-prod --name nextdocs-prod --deployment-container-image-name nextdocsacr.azurecr.io/nextdocs:latest
```

**Configure Container Settings:**
```bash
# UAT
az webapp config container set --name nextdocs-uat --resource-group rg-nextdocs-uat --docker-custom-image-name nextdocsacr.azurecr.io/nextdocs:latest --docker-registry-server-url https://nextdocsacr.azurecr.io

# Production
az webapp config container set --name nextdocs-prod --resource-group rg-nextdocs-prod --docker-custom-image-name nextdocsacr.azurecr.io/nextdocs:latest --docker-registry-server-url https://nextdocsacr.azurecr.io
```

### 2. Setup Azure DevOps Pipeline

**Create the Pipeline:**
1. Go to Azure DevOps → Pipelines → Create Pipeline
2. Select "Azure Repos Git" (or your source)
3. Select your repository
4. Choose "Existing Azure Pipelines YAML file"
5. Select `/azure-pipelines.yml`
6. Review and run

**Configure Environments:**
1. Go to Pipelines → Environments
2. Create two environments:
   - `nextdocs-uat`
   - `nextdocs-production`
3. Add approval checks to `nextdocs-production`

### 3. Configure Database & Redis

**Option A: Azure PaaS Services (Recommended)**
```bash
# PostgreSQL
az postgres flexible-server create --resource-group rg-nextdocs-uat --name nextdocs-db-uat --admin-user nextdocs --admin-password <password> --sku-name Standard_B1ms --tier Burstable --public-access 0.0.0.0 --storage-size 32

# Redis Cache
az redis create --resource-group rg-nextdocs-uat --name nextdocs-cache-uat --location australiaeast --sku Basic --vm-size c0
```

**Option B: Container Instances (Cost-effective)**
- Deploy PostgreSQL and Redis as Azure Container Instances
- Connect via private virtual network

## 🚀 **Pipeline Workflow**

### 1. **Build Stage**
- Triggers on push to main branch
- Builds Docker image using your Dockerfile
- Pushes image to Azure Container Registry with build ID tag

### 2. **UAT Deployment**
- Deploys latest image to UAT App Service
- Configures environment-specific app settings
- Restarts the app service
- Available at: `https://nextdocs-uat.azurewebsites.net`

### 3. **Manual Approval**
- Pipeline pauses for manual validation
- Notification sent to specified users
- 3-day timeout for approval
- Requires testing UAT before proceeding

### 4. **Production Deployment**
- Deploys same tested image to production
- Configures production app settings
- Restarts production app service
- Available at: `https://docs.err403.com`

## 🔐 **Security Considerations**

**Service Principal Permissions:**
- Container Registry: AcrPush, AcrPull
- App Services: Website Contributor
- Resource Groups: Contributor

**Secret Management:**
- All secrets stored in Azure DevOps variable groups
- Mark sensitive variables as secret
- Use Azure Key Vault for production secrets

**Network Security:**
- Configure App Service to only accept traffic from CDN
- Use private endpoints for databases
- Implement proper firewall rules

## 📊 **Monitoring & Alerting**

**Application Insights:**
```bash
# Create Application Insights
az monitor app-insights component create --app nextdocs-uat --location australiaeast --resource-group rg-nextdocs-uat
az monitor app-insights component create --app nextdocs-prod --location australiaeast --resource-group rg-nextdocs-prod
```

**Add to App Settings:**
```
APPLICATIONINSIGHTS_CONNECTION_STRING = "<connection-string>"
```

## 🔧 **Customization**

**Update Pipeline Variables:**
- Modify `azure-pipelines.yml` for your naming conventions
- Update resource group and app service names
- Adjust approval settings and notifications

**Environment-Specific Configurations:**
- Different database connection strings per environment
- Separate authentication settings for testing
- Scaled resources for production load

## 🐛 **Troubleshooting**

**Common Issues:**

1. **Container Registry Authentication:**
   - Verify service connection has ACR permissions
   - Check admin user is enabled on ACR

2. **App Service Deployment:**
   - Verify container image exists in registry
   - Check App Service logs for startup errors

3. **Database Connectivity:**
   - Verify connection strings in variable groups
   - Check firewall rules allow App Service access

4. **Authentication Issues:**
   - Verify Azure AD app registrations
   - Check redirect URIs match App Service URLs

**Useful Commands:**
```bash
# Check App Service logs
az webapp log tail --name nextdocs-uat --resource-group rg-nextdocs-uat

# View container logs
az webapp log download --name nextdocs-uat --resource-group rg-nextdocs-uat

# Test container locally
docker run -p 8080:8100 nextdocsacr.azurecr.io/nextdocs:latest
```