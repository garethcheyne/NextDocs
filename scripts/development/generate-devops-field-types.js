/**
 * Generate TypeScript types from Azure DevOps custom fields
 * 
 * This script:
 * 1. Authenticates with Azure DevOps using OAuth
 * 2. Fetches all work item fields for a project
 * 3. Generates TypeScript types based on the field definitions
 * 4. Saves the types to a file for use in the application
 * 
 * Usage: node scripts/development/generate-devops-field-types.js [ProjectName]
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')

const DEVOPS_ORG_URL = process.env.DEVOPS_ORG_URL
const CLIENT_ID = process.env.DEVOPS_CLIENT_ID
const CLIENT_SECRET = process.env.DEVOPS_CLIENT_SECRET
const TENANT_ID = process.env.DEVOPS_TENANT_ID

const PROJECT_NAME = process.argv[2] || 'YourProjectName'

// Map Azure DevOps field types to TypeScript types
const FIELD_TYPE_MAP = {
  'string': 'string',
  'String': 'string',
  'integer': 'number',
  'Integer': 'number',
  'double': 'number',
  'Double': 'number',
  'dateTime': 'string', // ISO date string
  'DateTime': 'string',
  'boolean': 'boolean',
  'Boolean': 'boolean',
  'plainText': 'string',
  'PlainText': 'string',
  'html': 'string',
  'HTML': 'string',
  'treePath': 'string',
  'TreePath': 'string',
  'history': 'string',
  'History': 'string',
  'picklistString': 'string',
  'PicklistString': 'string',
  'picklistInteger': 'number',
  'PicklistInteger': 'number',
  'picklistDouble': 'number',
  'PicklistDouble': 'number',
  'identity': 'string',
  'Identity': 'string',
}

async function getAccessToken() {
  console.log('🔐 Getting Azure AD access token...')
  
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: '499b84ac-1321-427f-aa17-267ca6975798/.default',
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

async function getWorkItemFields(accessToken) {
  console.log(`\n📋 Fetching work item fields for project: ${PROJECT_NAME}...`)
  
  const orgName = DEVOPS_ORG_URL.split('/').pop()
  const apiUrl = `https://dev.azure.com/${orgName}/${PROJECT_NAME}/_apis/wit/fields?api-version=7.1`
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API request failed: ${response.status} ${error}`)
    }

    const data = await response.json()
    console.log(`✅ Found ${data.value.length} fields`)
    
    return data.value
  } catch (error) {
    console.error('❌ Failed to fetch fields:', error.message)
    throw error
  }
}

function categorizeFields(fields) {
  const categories = {
    system: [],
    microsoft: [],
    custom: []
  }

  fields.forEach(field => {
    if (field.referenceName.startsWith('System.')) {
      categories.system.push(field)
    } else if (field.referenceName.startsWith('Microsoft.')) {
      categories.microsoft.push(field)
    } else {
      categories.custom.push(field)
    }
  })

  return categories
}

function generateTypeScriptTypes(fields) {
  const { system, microsoft, custom } = categorizeFields(fields)
  
  let output = `/**
 * Azure DevOps Work Item Field Types
 * 
 * Auto-generated from project: ${PROJECT_NAME}
 * Generated: ${new Date().toISOString()}
 * 
 * DO NOT EDIT MANUALLY - Run: npm run devops:generate-types
 */

// ============================================
// SYSTEM FIELDS (Built-in Azure DevOps fields)
// ============================================

export interface SystemFields {
`

  // Add system fields
  system.forEach(field => {
    const tsType = FIELD_TYPE_MAP[field.type] || 'any'
    const optional = field.isQueryable ? '?' : ''
    const comment = field.description ? `  /** ${field.description} */\n` : ''
    output += comment
    output += `  '${field.referenceName}'${optional}: ${tsType};\n`
  })

  output += `}

// ============================================
// MICROSOFT FIELDS (Microsoft extensions)
// ============================================

export interface MicrosoftFields {
`

  // Add Microsoft fields
  microsoft.forEach(field => {
    const tsType = FIELD_TYPE_MAP[field.type] || 'any'
    const optional = field.isQueryable ? '?' : ''
    const comment = field.description ? `  /** ${field.description} */\n` : ''
    output += comment
    output += `  '${field.referenceName}'${optional}: ${tsType};\n`
  })

  output += `}

// ============================================
// CUSTOM FIELDS (Organization-specific fields)
// ============================================

export interface CustomFields {
`

  // Add custom fields
  if (custom.length > 0) {
    custom.forEach(field => {
      const tsType = FIELD_TYPE_MAP[field.type] || 'any'
      const optional = field.isQueryable ? '?' : ''
      const comment = field.description ? `  /** ${field.description} */\n` : ''
      output += comment
      output += `  '${field.referenceName}'${optional}: ${tsType};\n`
    })
  } else {
    output += `  // No custom fields found\n`
  }

  output += `}

// ============================================
// COMBINED TYPE
// ============================================

export type WorkItemFields = SystemFields & MicrosoftFields & CustomFields;

// ============================================
// COMMONLY USED FIELDS BY WORK ITEM TYPE
// ============================================

export interface WorkItemTypeFields {
  'User Story': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.IterationPath'?: string;
    'System.State'?: string;
    'System.Reason'?: string;
    'System.AssignedTo'?: string;
    'System.Tags'?: string;
    'Microsoft.VSTS.Common.Priority'?: number;
    'Microsoft.VSTS.Common.Severity'?: string;
    'Microsoft.VSTS.Scheduling.StoryPoints'?: number;
    'Microsoft.VSTS.Common.AcceptanceCriteria'?: string;
  };
  'Bug': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.State'?: string;
    'System.AssignedTo'?: string;
    'System.Tags'?: string;
    'Microsoft.VSTS.Common.Priority'?: number;
    'Microsoft.VSTS.Common.Severity'?: string;
    'Microsoft.VSTS.TCM.ReproSteps'?: string;
  };
  'Task': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.State'?: string;
    'System.AssignedTo'?: string;
    'Microsoft.VSTS.Common.Activity'?: string;
    'Microsoft.VSTS.Scheduling.RemainingWork'?: number;
  };
  'Feature': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.State'?: string;
    'Microsoft.VSTS.Scheduling.TargetDate'?: string;
    'Microsoft.VSTS.Common.BusinessValue'?: number;
  };
  'Epic': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.State'?: string;
    'Microsoft.VSTS.Scheduling.TargetDate'?: string;
    'Microsoft.VSTS.Common.BusinessValue'?: number;
  };
}

// ============================================
// FIELD METADATA
// ============================================

export interface FieldMetadata {
  referenceName: string;
  name: string;
  type: string;
  description?: string;
  isPicklist: boolean;
  picklistValues?: string[];
}

export const FIELD_METADATA: Record<string, FieldMetadata> = {
`

  // Add field metadata
  const allFields = [...system, ...microsoft, ...custom]
  allFields.forEach((field, index) => {
    const isLast = index === allFields.length - 1
    output += `  '${field.referenceName}': {
    referenceName: '${field.referenceName}',
    name: '${field.name}',
    type: '${field.type}',
    description: ${field.description ? `'${field.description.replace(/'/g, "\\'")}'` : 'undefined'},
    isPicklist: ${field.isPicklist || false},
  }${isLast ? '' : ','}\n`
  })

  output += `};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFieldName(referenceName: string): string {
  return FIELD_METADATA[referenceName]?.name || referenceName;
}

export function getFieldType(referenceName: string): string {
  return FIELD_METADATA[referenceName]?.type || 'String';
}

export function isPicklistField(referenceName: string): boolean {
  return FIELD_METADATA[referenceName]?.isPicklist || false;
}
`

  return output
}

function saveTypesToFile(typesContent) {
  const outputPath = path.join(__dirname, '..', '..', 'src', 'types', 'devops-fields.ts')
  const outputDir = path.dirname(outputPath)
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, typesContent, 'utf-8')
  console.log(`\n✅ Types generated successfully!`)
  console.log(`📁 Saved to: ${outputPath}`)
}

async function main() {
  console.log('🚀 Azure DevOps Field Type Generator\n')
  console.log('Configuration:')
  console.log(`   Organization: ${DEVOPS_ORG_URL}`)
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

  if (PROJECT_NAME === 'YourProjectName') {
    console.error('❌ Please provide a project name:')
    console.error('   node scripts/development/generate-devops-field-types.js <ProjectName>')
    process.exit(1)
  }

  try {
    // Step 1: Get access token
    const accessToken = await getAccessToken()

    // Step 2: Fetch work item fields
    const fields = await getWorkItemFields(accessToken)

    // Step 3: Generate TypeScript types
    console.log('\n📝 Generating TypeScript types...')
    const typesContent = generateTypeScriptTypes(fields)

    // Step 4: Save to file
    saveTypesToFile(typesContent)

    console.log('\n✨ All done!')
    console.log('\nYou can now import these types:')
    console.log('   import { WorkItemFields, WorkItemTypeFields } from "@/types/devops-fields"')
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
