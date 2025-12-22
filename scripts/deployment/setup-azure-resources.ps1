#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Creates Azure resources for NextDocs CI/CD pipeline

.DESCRIPTION
    This script creates all necessary Azure resources for the NextDocs application:
    - Resource Groups (UAT and Production)
    - Container Registry
    - App Service Plans
    - Web Apps
    - PostgreSQL Databases (optional)
    - Redis Caches (optional)

.PARAMETER Location
    Azure region for resources (default: australiaeast)

.PARAMETER SubscriptionId
    Azure subscription ID (optional - uses current subscription)

.PARAMETER CreateDatabases
    Whether to create Azure Database for PostgreSQL instances (default: false)

.PARAMETER CreateRedis
    Whether to create Azure Cache for Redis instances (default: false)

.PARAMETER AppServiceSku
    SKU for production App Service (default: P1v2)

.EXAMPLE
    .\setup-azure-resources.ps1
    
.EXAMPLE
    .\setup-azure-resources.ps1 -CreateDatabases -CreateRedis -Location "eastus"
#>

param(
    [string]$Location = "australiaeast",
    [string]$SubscriptionId = "",
    [switch]$CreateDatabases = $false,
    [switch]$CreateRedis = $false,
    [string]$AppServiceSku = "P1v2"
)

# Configuration
$resourcePrefix = "nextdocs"
$uatRG = "rg-nextdocs-uat"
$prodRG = "rg-nextdocs-prod"
$acrName = "nextdocsacr$(Get-Random -Minimum 1000 -Maximum 9999)"  # ACR names must be globally unique
$uatAppName = "nextdocs-uat-$(Get-Random -Minimum 1000 -Maximum 9999)"  # App Service names must be globally unique
$prodAppName = "nextdocs-prod-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "🚀 Setting up Azure resources for NextDocs CI/CD Pipeline" -ForegroundColor Green
Write-Host ""

# Check if Azure CLI is installed
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI is not installed. Please install it first: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Check if logged in to Azure
$account = az account show 2>$null | ConvertFrom-Json
if (!$account) {
    Write-Host "⚠️  Please log in to Azure first: az login" -ForegroundColor Yellow
    exit 1
}

if ($SubscriptionId) {
    Write-Host "🔄 Setting subscription to: $SubscriptionId"
    az account set --subscription $SubscriptionId
}

$currentSubscription = az account show | ConvertFrom-Json
Write-Host "📋 Using subscription: $($currentSubscription.name) ($($currentSubscription.id))" -ForegroundColor Cyan
Write-Host ""

# Create Resource Groups
Write-Host "📁 Creating Resource Groups..." -ForegroundColor Yellow
az group create --name $uatRG --location $Location --output table
az group create --name $prodRG --location $Location --output table

# Create Container Registry
Write-Host "🐳 Creating Container Registry..." -ForegroundColor Yellow
az acr create `
    --resource-group $uatRG `
    --name $acrName `
    --sku Basic `
    --admin-enabled true `
    --output table

# Create App Service Plans
Write-Host "📦 Creating App Service Plans..." -ForegroundColor Yellow
az appservice plan create `
    --name "$resourcePrefix-plan-uat" `
    --resource-group $uatRG `
    --sku B1 `
    --is-linux `
    --output table

az appservice plan create `
    --name "$resourcePrefix-plan-prod" `
    --resource-group $prodRG `
    --sku $AppServiceSku `
    --is-linux `
    --output table

# Create Web Apps
Write-Host "🌐 Creating Web Apps..." -ForegroundColor Yellow
az webapp create `
    --resource-group $uatRG `
    --plan "$resourcePrefix-plan-uat" `
    --name $uatAppName `
    --deployment-container-image-name "$acrName.azurecr.io/nextdocs:latest" `
    --output table

az webapp create `
    --resource-group $prodRG `
    --plan "$resourcePrefix-plan-prod" `
    --name $prodAppName `
    --deployment-container-image-name "$acrName.azurecr.io/nextdocs:latest" `
    --output table

# Configure container settings
Write-Host "⚙️  Configuring container settings..." -ForegroundColor Yellow
az webapp config container set `
    --name $uatAppName `
    --resource-group $uatRG `
    --docker-custom-image-name "$acrName.azurecr.io/nextdocs:latest" `
    --docker-registry-server-url "https://$acrName.azurecr.io"

az webapp config container set `
    --name $prodAppName `
    --resource-group $prodRG `
    --docker-custom-image-name "$acrName.azurecr.io/nextdocs:latest" `
    --docker-registry-server-url "https://$acrName.azurecr.io"

# Configure basic app settings
Write-Host "🔧 Configuring basic app settings..." -ForegroundColor Yellow
$commonSettings = @(
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false"
    "NODE_ENV=production"
    "AUTH_TRUST_HOST=true"
    "WEBSITES_PORT=8100"
)

foreach ($setting in $commonSettings) {
    az webapp config appsettings set --name $uatAppName --resource-group $uatRG --settings $setting --output none
    az webapp config appsettings set --name $prodAppName --resource-group $prodRG --settings $setting --output none
}

# Create databases if requested
if ($CreateDatabases) {
    Write-Host "🗄️  Creating PostgreSQL databases..." -ForegroundColor Yellow
    
    $dbPassword = Read-Host "Enter password for PostgreSQL admin user" -MaskInput
    
    # UAT Database
    az postgres flexible-server create `
        --resource-group $uatRG `
        --name "$resourcePrefix-db-uat" `
        --admin-user nextdocs `
        --admin-password $dbPassword `
        --sku-name Standard_B1ms `
        --tier Burstable `
        --public-access 0.0.0.0 `
        --storage-size 32 `
        --output table
    
    # Production Database
    az postgres flexible-server create `
        --resource-group $prodRG `
        --name "$resourcePrefix-db-prod" `
        --admin-user nextdocs `
        --admin-password $dbPassword `
        --sku-name Standard_D2s_v3 `
        --tier GeneralPurpose `
        --public-access 0.0.0.0 `
        --storage-size 128 `
        --output table
}

# Create Redis caches if requested
if ($CreateRedis) {
    Write-Host "🔴 Creating Redis caches..." -ForegroundColor Yellow
    
    # UAT Redis
    az redis create `
        --resource-group $uatRG `
        --name "$resourcePrefix-cache-uat" `
        --location $Location `
        --sku Basic `
        --vm-size c0 `
        --output table
    
    # Production Redis
    az redis create `
        --resource-group $prodRG `
        --name "$resourcePrefix-cache-prod" `
        --location $Location `
        --sku Standard `
        --vm-size c1 `
        --output table
}

# Get ACR credentials
Write-Host "🔑 Retrieving ACR credentials..." -ForegroundColor Yellow
$acrCredentials = az acr credential show --name $acrName | ConvertFrom-Json

# Output summary
Write-Host ""
Write-Host "✅ Azure resources created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 RESOURCE SUMMARY:" -ForegroundColor Cyan
Write-Host "==================="
Write-Host "Container Registry: $acrName.azurecr.io"
Write-Host "UAT Web App: https://$uatAppName.azurewebsites.net"
Write-Host "Production Web App: https://$prodAppName.azurewebsites.net"
Write-Host ""

Write-Host "🔐 AZURE DEVOPS SETUP:" -ForegroundColor Cyan
Write-Host "======================"
Write-Host "1. Create Service Connection named 'nextdocs-service-connection'"
Write-Host "2. Update azure-pipelines.yml with these values:"
Write-Host "   - containerRegistry: '$acrName'"
Write-Host "   - appServiceUAT: '$uatAppName'"
Write-Host "   - appServiceProd: '$prodAppName'"
Write-Host ""

Write-Host "3. Create Variable Groups with these connection strings:"
Write-Host ""
if ($CreateDatabases) {
    Write-Host "Database Connection Strings:" -ForegroundColor Yellow
    Write-Host "UAT_DATABASE_URL: postgresql://nextdocs:<password>@$resourcePrefix-db-uat.postgres.database.azure.com:5432/postgres"
    Write-Host "PROD_DATABASE_URL: postgresql://nextdocs:<password>@$resourcePrefix-db-prod.postgres.database.azure.com:5432/postgres"
    Write-Host ""
}

if ($CreateRedis) {
    Write-Host "Redis Connection Strings:" -ForegroundColor Yellow
    Write-Host "Get them with:"
    Write-Host "az redis list-keys --name $resourcePrefix-cache-uat --resource-group $uatRG"
    Write-Host "az redis list-keys --name $resourcePrefix-cache-prod --resource-group $prodRG"
    Write-Host ""
}

Write-Host "🔑 Container Registry Credentials:" -ForegroundColor Yellow
Write-Host "Username: $($acrCredentials.username)"
Write-Host "Password: $($acrCredentials.passwords[0].value)"
Write-Host ""

Write-Host "📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "=============="
Write-Host "1. Update azure-pipelines.yml with the resource names above"
Write-Host "2. Create Azure DevOps service connection"
Write-Host "3. Create variable groups with connection strings"
Write-Host "4. Set up custom domain for production (optional)"
Write-Host "5. Configure SSL certificates"
Write-Host "6. Run the pipeline!"
Write-Host ""

# Save configuration to file
$config = @{
    resourceGroups = @{
        uat = $uatRG
        production = $prodRG
    }
    containerRegistry = $acrName
    webApps = @{
        uat = $uatAppName
        production = $prodAppName
    }
    location = $Location
    created = (Get-Date).ToString()
}

$configPath = "azure-resources-config.json"
$config | ConvertTo-Json -Depth 3 | Out-File -FilePath $configPath -Encoding UTF8
Write-Host "💾 Configuration saved to: $configPath" -ForegroundColor Green