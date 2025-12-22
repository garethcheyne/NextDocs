#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Updates azure-pipelines.yml with actual Azure resource names

.DESCRIPTION
    This script reads the azure-resources-config.json file created by setup-azure-resources.ps1
    and updates the azure-pipelines.yml file with the actual resource names.

.PARAMETER ConfigFile
    Path to the configuration file (default: azure-resources-config.json)

.EXAMPLE
    .\update-pipeline-config.ps1
    
.EXAMPLE
    .\update-pipeline-config.ps1 -ConfigFile "my-config.json"
#>

param(
    [string]$ConfigFile = "azure-resources-config.json"
)

Write-Host "🔧 Updating Azure DevOps pipeline configuration..." -ForegroundColor Green

# Check if config file exists
if (!(Test-Path $ConfigFile)) {
    Write-Error "Configuration file not found: $ConfigFile"
    Write-Host "Run setup-azure-resources.ps1 first to create the configuration file." -ForegroundColor Yellow
    exit 1
}

# Read configuration
try {
    $config = Get-Content $ConfigFile | ConvertFrom-Json
} catch {
    Write-Error "Failed to read configuration file: $($_.Exception.Message)"
    exit 1
}

# Check if pipeline file exists
$pipelineFile = "azure-pipelines.yml"
if (!(Test-Path $pipelineFile)) {
    Write-Error "Pipeline file not found: $pipelineFile"
    exit 1
}

Write-Host "📋 Configuration loaded:" -ForegroundColor Cyan
Write-Host "  Container Registry: $($config.containerRegistry)"
Write-Host "  UAT Web App: $($config.webApps.uat)"
Write-Host "  Production Web App: $($config.webApps.production)"
Write-Host "  UAT Resource Group: $($config.resourceGroups.uat)"
Write-Host "  Production Resource Group: $($config.resourceGroups.production)"
Write-Host ""

# Read pipeline file
$pipelineContent = Get-Content $pipelineFile -Raw

# Update variables in pipeline
$originalContent = $pipelineContent

# Update container registry (remove any random suffix and add .azurecr.io)
$registryName = $config.containerRegistry
if ($registryName -notmatch "\.azurecr\.io$") {
    $registryName = "$registryName.azurecr.io"
}

$pipelineContent = $pipelineContent -replace "containerRegistry: '.*'", "containerRegistry: '$registryName'"
$pipelineContent = $pipelineContent -replace "resourceGroupUAT: '.*'", "resourceGroupUAT: '$($config.resourceGroups.uat)'"
$pipelineContent = $pipelineContent -replace "resourceGroupProd: '.*'", "resourceGroupProd: '$($config.resourceGroups.production)'"
$pipelineContent = $pipelineContent -replace "appServiceUAT: '.*'", "appServiceUAT: '$($config.webApps.uat)'"
$pipelineContent = $pipelineContent -replace "appServiceProd: '.*'", "appServiceProd: '$($config.webApps.production)'"

# Update URL references in app settings
$uatUrl = "https://$($config.webApps.uat).azurewebsites.net"
$prodUrl = "https://$($config.webApps.production).azurewebsites.net"

$pipelineContent = $pipelineContent -replace 'NEXT_PUBLIC_URL="https://\$\(appServiceUAT\)\.azurewebsites\.net"', "NEXT_PUBLIC_URL=`"$uatUrl`""
$pipelineContent = $pipelineContent -replace 'NEXTAUTH_URL="https://\$\(appServiceUAT\)\.azurewebsites\.net/"', "NEXTAUTH_URL=`"$uatUrl/`""

# Check if content changed
if ($pipelineContent -eq $originalContent) {
    Write-Host "⚠️  No changes needed in pipeline file." -ForegroundColor Yellow
} else {
    # Backup original file
    $backupFile = "$pipelineFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $pipelineFile $backupFile
    Write-Host "💾 Original pipeline backed up to: $backupFile" -ForegroundColor Gray
    
    # Write updated content
    $pipelineContent | Out-File $pipelineFile -Encoding UTF8
    Write-Host "✅ Pipeline configuration updated successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 NEXT STEPS FOR AZURE DEVOPS:" -ForegroundColor Cyan
Write-Host "================================"
Write-Host ""

Write-Host "1. Create Service Connection:" -ForegroundColor Yellow
Write-Host "   - Name: nextdocs-service-connection"
Write-Host "   - Type: Azure Resource Manager"
Write-Host "   - Scope: Subscription"
Write-Host "   - Resource Group: (leave empty for subscription scope)"
Write-Host ""

Write-Host "2. Create Variable Groups:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Group: nextdocs-uat-vars" -ForegroundColor Cyan
Write-Host "   ========================"
Write-Host "   UAT_DATABASE_URL = <your-uat-database-url>"
Write-Host "   UAT_REDIS_URL = <your-uat-redis-url>"
Write-Host "   UAT_POSTGRES_PASSWORD = <your-uat-db-password>"
Write-Host "   UAT_REDIS_PASSWORD = <your-uat-redis-password>"
Write-Host ""

Write-Host "   Group: nextdocs-prod-vars" -ForegroundColor Cyan
Write-Host "   ========================="
Write-Host "   PROD_DATABASE_URL = <your-prod-database-url>"
Write-Host "   PROD_REDIS_URL = <your-prod-redis-url>"
Write-Host "   PROD_POSTGRES_PASSWORD = <your-prod-db-password>"
Write-Host "   PROD_REDIS_PASSWORD = <your-prod-redis-password>"
Write-Host ""

Write-Host "   Shared Variables (add to both groups):" -ForegroundColor Cyan
Write-Host "   ======================================"
Write-Host "   NEXTAUTH_SECRET = <your-nextauth-secret>"
Write-Host "   ENCRYPTION_KEY = <your-encryption-key>"
Write-Host "   WORKER_SECRET = <your-worker-secret>"
Write-Host "   AZURE_AD_CLIENT_ID = <your-azure-ad-client-id>"
Write-Host "   AZURE_AD_CLIENT_SECRET = <your-azure-ad-client-secret> (mark as secret)"
Write-Host "   AZURE_AD_TENANT_ID = <your-azure-ad-tenant-id>"
Write-Host "   ALLOWED_AD_GROUPS = <your-allowed-groups>"
Write-Host "   ADMIN_AD_GROUPS = <your-admin-groups>"
Write-Host "   AZURE_GRAPH_CLIENT_ID = <your-graph-client-id>"
Write-Host "   AZURE_GRAPH_CLIENT_SECRET = <your-graph-client-secret> (mark as secret)"
Write-Host "   AZURE_GRAPH_TENANT_ID = <your-graph-tenant-id>"
Write-Host "   EMAIL_REST_API = <your-email-api-url>"
Write-Host "   EMAIL_API_KEY = <your-email-api-key> (mark as secret)"
Write-Host ""

Write-Host "3. Create Environments:" -ForegroundColor Yellow
Write-Host "   - nextdocs-uat"
Write-Host "   - nextdocs-production (with approval required)"
Write-Host ""

Write-Host "4. Create Pipeline:" -ForegroundColor Yellow
Write-Host "   - Use existing YAML: azure-pipelines.yml"
Write-Host "   - Run the pipeline to test deployment"
Write-Host ""

Write-Host "🌐 Your application URLs will be:" -ForegroundColor Green
Write-Host "   UAT: $uatUrl"
Write-Host "   Production: $prodUrl"
Write-Host ""

# Create a summary file
$summary = @{
    setup_completed = Get-Date
    urls = @{
        uat = $uatUrl
        production = $prodUrl
    }
    next_steps = @(
        "Create Azure DevOps service connection 'nextdocs-service-connection'",
        "Create variable groups 'nextdocs-uat-vars' and 'nextdocs-prod-vars'",
        "Create environments 'nextdocs-uat' and 'nextdocs-production'",
        "Create and run the Azure DevOps pipeline",
        "Configure custom domain for production (optional)",
        "Set up SSL certificates and CDN (optional)"
    )
}

$summaryFile = "pipeline-setup-summary.json"
$summary | ConvertTo-Json -Depth 3 | Out-File $summaryFile -Encoding UTF8
Write-Host "📝 Setup summary saved to: $summaryFile" -ForegroundColor Gray