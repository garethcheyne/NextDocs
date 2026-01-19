/**
 * Create Azure DevOps Variable Group from .env file
 * 
 * This script:
 * 1. Reads variables from .env file
 * 2. Creates a variable group in Azure DevOps
 * 3. Adds selected variables (can mark as secrets)
 * 
 * Usage: node scripts/deployment/create-devops-variables.js [project-name] [variable-group-name]
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')

const PROJECT_NAME = process.argv[2] || 'HN Commercial Division'
const VARIABLE_GROUP_NAME = process.argv[3] || 'TheHive-Environment-Variables'

// Define which variables to include and whether they should be secret
const VARIABLES_CONFIG = {
  // Database
  'DATABASE_URL': { secret: true },
  'POSTGRES_PASSWORD': { secret: true },
  
  // Redis
  'REDIS_URL': { secret: true },
  'REDIS_PASSWORD': { secret: true },
  
  // Auth
  'NEXTAUTH_URL': { secret: false },
  'NEXTAUTH_SECRET': { secret: true },
  'AUTH_TRUST_HOST': { secret: false },
  
  // Encryption
  'ENCRYPTION_KEY': { secret: true },
  'WORKER_SECRET': { secret: true },
  
  // Azure AD
  'AZURE_AD_CLIENT_ID': { secret: false },
  'AZURE_AD_CLIENT_SECRET': { secret: true },
  'AZURE_AD_TENANT_ID': { secret: false },
  
  // Azure DevOps
  'DEVOPS_ORG_URL': { secret: false },
  'DEVOPS_CLIENT_ID': { secret: false },
  'DEVOPS_CLIENT_SECRET': { secret: true },
  'DEVOPS_TENANT_ID': { secret: false },
  
  // Azure Graph
  'AZURE_GRAPH_CLIENT_ID': { secret: false },
  'AZURE_GRAPH_CLIENT_SECRET': { secret: true },
  'AZURE_GRAPH_TENANT_ID': { secret: false },
  
  // Webhooks
  'GITHUB_WEBHOOK_SECRET': { secret: true },
  'AZURE_WEBHOOK_SECRET': { secret: true },
  
  // Email
  'EMAIL_REST_API': { secret: false },
  'EMAIL_API_KEY': { secret: true },
  
  // Push Notifications
  'PUSH_NOTIFICATIONS_ENABLED': { secret: false },
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY': { secret: false },
  'VAPID_PRIVATE_KEY': { secret: true },
  'VAPID_SUBJECT': { secret: false },
  
  // Public
  'NEXT_PUBLIC_URL': { secret: false },
  
  // Feature Flags
  'ENABLE_BLOG': { secret: false },
  'ENABLE_API_SPECS': { secret: false },
  
  // Environment
  'NODE_ENV': { secret: false },
  'DATE_LOCALE': { secret: false },
}

async function getAccessToken() {
  console.log('🔐 Getting Azure AD access token...')
  
  const tokenUrl = `https://login.microsoftonline.com/${process.env.DEVOPS_TENANT_ID}/oauth2/v2.0/token`
  
  const params = new URLSearchParams({
    client_id: process.env.DEVOPS_CLIENT_ID,
    client_secret: process.env.DEVOPS_CLIENT_SECRET,
    scope: '499b84ac-1321-427f-aa17-267ca6975798/.default',
    grant_type: 'client_credentials'
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Token request failed: ${JSON.stringify(data, null, 2)}`)
  }

  console.log('✅ Successfully obtained access token')
  return data.access_token
}

async function getProjectId(accessToken) {
  console.log(`\n🔍 Getting project ID for "${PROJECT_NAME}"...`)
  
  const orgUrl = process.env.DEVOPS_ORG_URL
  const apiUrl = `${orgUrl}/_apis/projects/${encodeURIComponent(PROJECT_NAME)}?api-version=7.1`
  
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Failed to get project: ${JSON.stringify(data, null, 2)}`)
  }

  console.log(`✅ Found project ID: ${data.id}`)
  return data.id
}

async function createVariableGroup(accessToken, projectId) {
  console.log(`\n📦 Creating variable group "${VARIABLE_GROUP_NAME}"...`)
  
  const orgUrl = process.env.DEVOPS_ORG_URL
  const apiUrl = `${orgUrl}/${encodeURIComponent(PROJECT_NAME)}/_apis/distributedtask/variablegroups?api-version=7.1`
  
  // Build variables object from config
  const variables = {}
  let secretCount = 0
  let publicCount = 0
  
  Object.entries(VARIABLES_CONFIG).forEach(([key, config]) => {
    const value = process.env[key]
    if (value !== undefined) {
      variables[key] = {
        value: value,
        isSecret: config.secret
      }
      if (config.secret) {
        secretCount++
      } else {
        publicCount++
      }
    }
  })
  
  const variableGroupData = {
    name: VARIABLE_GROUP_NAME,
    description: 'Environment variables for NextDocs application - Auto-generated from .env',
    type: 'Vsts',
    variables: variables,
    variableGroupProjectReferences: [
      {
        projectReference: {
          id: projectId,
          name: PROJECT_NAME
        },
        name: VARIABLE_GROUP_NAME
      }
    ]
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(variableGroupData)
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Variable group creation failed: ${JSON.stringify(data, null, 2)}`)
    }

    console.log('✅ Successfully created variable group!')
    console.log('\n📋 Variable Group Details:')
    console.log(`   ID: ${data.id}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Variables: ${Object.keys(data.variables).length} total`)
    console.log(`   - Public: ${publicCount}`)
    console.log(`   - Secret: ${secretCount}`)
    console.log(`   Description: ${data.description}`)
    
    console.log('\n📝 Variables added:')
    Object.entries(data.variables).forEach(([key, config]) => {
      const icon = config.isSecret ? '🔒' : '🔓'
      const valueDisplay = config.isSecret ? '***' : config.value
      console.log(`   ${icon} ${key}: ${valueDisplay}`)
    })
    
    return data
  } catch (error) {
    console.error('❌ Failed to create variable group:', error.message)
    throw error
  }
}

async function checkExistingVariableGroup(accessToken) {
  console.log(`\n🔍 Checking if variable group "${VARIABLE_GROUP_NAME}" already exists...`)
  
  const orgUrl = process.env.DEVOPS_ORG_URL
  const apiUrl = `${orgUrl}/${encodeURIComponent(PROJECT_NAME)}/_apis/distributedtask/variablegroups?groupName=${encodeURIComponent(VARIABLE_GROUP_NAME)}&api-version=7.1`
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Failed to check variable groups: ${JSON.stringify(data, null, 2)}`)
    }

    if (data.count > 0) {
      const existing = data.value[0]
      console.log(`⚠️  Variable group "${VARIABLE_GROUP_NAME}" already exists (ID: ${existing.id})`)
      console.log(`   Current variables: ${Object.keys(existing.variables).length}`)
      return existing
    }
    
    console.log('✅ Variable group does not exist, will create new one')
    return null
  } catch (error) {
    console.error('❌ Failed to check existing variable groups:', error.message)
    throw error
  }
}

async function updateVariableGroup(accessToken, groupId, projectId) {
  console.log(`\n🔄 Updating existing variable group (ID: ${groupId})...`)
  
  const orgUrl = process.env.DEVOPS_ORG_URL
  const apiUrl = `${orgUrl}/${encodeURIComponent(PROJECT_NAME)}/_apis/distributedtask/variablegroups/${groupId}?api-version=7.1`
  
  // Build variables object from config
  const variables = {}
  let secretCount = 0
  let publicCount = 0
  
  Object.entries(VARIABLES_CONFIG).forEach(([key, config]) => {
    const value = process.env[key]
    if (value !== undefined) {
      variables[key] = {
        value: value,
        isSecret: config.secret
      }
      if (config.secret) {
        secretCount++
      } else {
        publicCount++
      }
    }
  })
  
  const variableGroupData = {
    name: VARIABLE_GROUP_NAME,
    description: 'Environment variables for NextDocs application - Auto-updated from .env',
    type: 'Vsts',
    variables: variables,
    variableGroupProjectReferences: [
      {
        projectReference: {
          id: projectId,
          name: PROJECT_NAME
        },
        name: VARIABLE_GROUP_NAME
      }
    ]
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(variableGroupData)
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Variable group update failed: ${JSON.stringify(data, null, 2)}`)
    }

    console.log('✅ Successfully updated variable group!')
    console.log(`   Variables: ${Object.keys(data.variables).length} total`)
    console.log(`   - Public: ${publicCount}`)
    console.log(`   - Secret: ${secretCount}`)
    
    return data
  } catch (error) {
    console.error('❌ Failed to update variable group:', error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Azure DevOps Variable Group Setup\n')
  console.log('Configuration:')
  console.log(`   Organization: ${process.env.DEVOPS_ORG_URL}`)
  console.log(`   Project: ${PROJECT_NAME}`)
  console.log(`   Variable Group: ${VARIABLE_GROUP_NAME}`)
  console.log(`   Variables to sync: ${Object.keys(VARIABLES_CONFIG).length}`)
  console.log('')

  // Validate environment variables
  if (!process.env.DEVOPS_ORG_URL || !process.env.DEVOPS_CLIENT_ID || 
      !process.env.DEVOPS_CLIENT_SECRET || !process.env.DEVOPS_TENANT_ID) {
    console.error('❌ Missing required environment variables!')
    process.exit(1)
  }

  try {
    // Step 1: Get access token
    const accessToken = await getAccessToken()

    // Step 2: Get project ID
    const projectId = await getProjectId(accessToken)

    // Step 3: Check if variable group exists
    const existing = await checkExistingVariableGroup(accessToken)
    
    // Step 4: Create or update
    if (existing) {
      console.log('\n⚠️  Variable group already exists!')
      console.log('   This will REPLACE all variables with current .env values.')
      console.log('   Variables removed from .env will be DELETED from the group.\n')
      
      // Auto-update without confirmation - for CI/CD use
      // To require confirmation, add readline prompt here
      await updateVariableGroup(accessToken, existing.id, projectId)
    } else {
      await createVariableGroup(accessToken, projectId)
    }

    console.log('\n✨ Variable group setup complete!')
    console.log('\nNext steps:')
    console.log('1. Go to Azure DevOps → Pipelines → Library')
    console.log(`2. Find the variable group "${VARIABLE_GROUP_NAME}"`)
    console.log('3. Link it to your pipeline in azure-pipelines.yml')
    console.log('\nExample pipeline YAML:')
    console.log(`
variables:
  - group: TheHive-Env

stages:
  - stage: Build
    jobs:
      - job: BuildAndDeploy
        steps:
          - script: |
              echo "Using DATABASE_URL: $(DATABASE_URL)"
            displayName: 'Build with environment variables'
`)

  } catch (error) {
    console.error('\n💥 Setup failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main()
