/**
 * Test Azure DevOps Authentication and Work Item Creation
 * 
 * This script tests the Azure DevOps API credentials by:
 * 1. Getting an OAuth token from Azure AD
 * 2. Creating a test Task work item in Azure DevOps
 * 
 * Usage: node scripts/development/test-devops-auth.js
 */

require('dotenv').config()

const DEVOPS_ORG_URL = process.env.DEVOPS_ORG_URL
const CLIENT_ID = process.env.DEVOPS_CLIENT_ID
const CLIENT_SECRET = process.env.DEVOPS_CLIENT_SECRET
const TENANT_ID = process.env.DEVOPS_TENANT_ID

// You'll need to set these - get from your Azure DevOps organization
const PROJECT_NAME = process.argv[2] || 'YourProjectName' // e.g., 'NextDocs'
const WORK_ITEM_TYPE = 'Task' // or 'Bug', 'User Story', etc.

async function getAccessToken() {
  console.log('🔐 Getting Azure AD access token...')
  
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: '499b84ac-1321-427f-aa17-267ca6975798/.default', // Azure DevOps scope
    grant_type: 'client_credentials'
  })

  try {
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
  } catch (error) {
    console.error('❌ Failed to get access token:', error.message)
    throw error
  }
}

async function createWorkItem(accessToken) {
  console.log(`\n📝 Creating test ${WORK_ITEM_TYPE} in Azure DevOps...`)
  
  const apiUrl = `${DEVOPS_ORG_URL}/${PROJECT_NAME}/_apis/wit/workitems/$${WORK_ITEM_TYPE}?api-version=7.1`
  
  const workItemData = [
    {
      op: 'add',
      path: '/fields/System.Title',
      value: `Test Task - Created via API at ${new Date().toISOString()}`
    },
    {
      op: 'add',
      path: '/fields/System.Description',
      value: 'This is a test work item created by the NextDocs API test script to verify Azure DevOps authentication and work item creation.'
    }
    // Note: Tags removed - requires additional permissions in Azure DevOps
    // To add tags, grant "Create tag definition" permission to the service principal
  ]

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json-patch+json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(workItemData)
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Work item creation failed: ${JSON.stringify(data, null, 2)}`)
    }

    console.log('✅ Successfully created work item!')
    console.log('\n📋 Work Item Details:')
    console.log(`   ID: ${data.id}`)
    console.log(`   Title: ${data.fields['System.Title']}`)
    console.log(`   Type: ${data.fields['System.WorkItemType']}`)
    console.log(`   State: ${data.fields['System.State']}`)
    console.log(`   URL: ${data._links.html.href}`)
    
    return data
  } catch (error) {
    console.error('❌ Failed to create work item:', error.message)
    throw error
  }
}

async function listProjects(accessToken) {
  console.log('\n📂 Fetching available projects...')
  
  const apiUrl = `${DEVOPS_ORG_URL}/_apis/projects?api-version=7.1`
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Project list failed: ${JSON.stringify(data, null, 2)}`)
    }

    console.log('✅ Available projects:')
    data.value.forEach(project => {
      console.log(`   - ${project.name} (${project.id})`)
    })
    
    return data.value
  } catch (error) {
    console.error('❌ Failed to list projects:', error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Azure DevOps API Test Script\n')
  console.log('Configuration:')
  console.log(`   Organization: ${DEVOPS_ORG_URL}`)
  console.log(`   Client ID: ${CLIENT_ID}`)
  console.log(`   Tenant ID: ${TENANT_ID}`)
  console.log(`   Project: ${PROJECT_NAME}`)
  console.log('')

  // Validate environment variables
  if (!DEVOPS_ORG_URL || !CLIENT_ID || !CLIENT_SECRET || !TENANT_ID) {
    console.error('❌ Missing required environment variables!')
    console.error('Please ensure the following are set in .env:')
    console.error('   - DEVOPS_ORG_URL')
    console.error('   - DEVOPS_CLIENT_ID')
    console.error('   - DEVOPS_CLIENT_SECRET')
    console.error('   - DEVOPS_TENANT_ID')
    process.exit(1)
  }

  try {
    // Step 1: Get access token
    const accessToken = await getAccessToken()

    // Step 2: List available projects
    const projects = await listProjects(accessToken)
    
    // Check if project exists
    const projectExists = projects.some(p => p.name === PROJECT_NAME)
    if (!projectExists && PROJECT_NAME !== 'YourProjectName') {
      console.warn(`\n⚠️  Warning: Project "${PROJECT_NAME}" not found in organization`)
      console.log('Available projects are listed above.')
      console.log('\nUsage: node scripts/development/test-devops-auth.js <ProjectName>')
      process.exit(1)
    }

    if (PROJECT_NAME === 'YourProjectName') {
      console.log('\n⚠️  Please provide a project name:')
      console.log('   node scripts/development/test-devops-auth.js <ProjectName>')
      process.exit(0)
    }

    // Step 3: Create work item
    await createWorkItem(accessToken)

    console.log('\n✨ All tests passed successfully!')
    console.log('\nYour Azure DevOps credentials are working correctly.')
    console.log('You can now integrate work item creation into your application.')

  } catch (error) {
    console.error('\n💥 Test failed:', error.message)
    console.error('\nPlease check your credentials and try again.')
    process.exit(1)
  }
}

// Run the script
main()
