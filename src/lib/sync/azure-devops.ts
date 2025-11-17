import { Repository } from '@prisma/client'
import { decryptToken } from '@/lib/crypto/encryption'

interface AzureDevOpsFile {
  path: string
  url: string
  objectId: string
}

export async function syncAzureDevOps(repository: Repository) {
  console.log('🔗 Connecting to Azure DevOps...')
  
  const pat = decryptToken(repository.patEncrypted!)
  const { organization, project, repositoryId, branch, basePath } = repository

  const baseUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repositoryId}`
  
  // Get files from repository
  const itemsUrl = `${baseUrl}/items?scopePath=${basePath}&recursionLevel=Full&api-version=7.0`
  
  const authHeader = Buffer.from(`:${pat}`).toString('base64')
  
  console.log('📡 Fetching repository tree...')
  const response = await fetch(itemsUrl, {
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Azure DevOps API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const files: AzureDevOpsFile[] = data.value.filter((item: any) => {
    const isFile = !item.isFolder
    const isMarkdownOrMeta = item.path.endsWith('.md') || item.path.endsWith('.mdx') || item.path.endsWith('_meta.json')
    
    // Check if file is in api-specs directory
    const inApiSpecs = item.path.includes('/api-specs/') || item.path.startsWith('/api-specs/')
    
    // If in api-specs, only allow index.md or readme.md files (optional - may not exist)
    if (inApiSpecs) {
      const fileName = item.path.split('/').pop()?.toLowerCase()
      return isFile && (fileName === 'index.md' || fileName === 'readme.md')
    }
    
    return isFile && isMarkdownOrMeta
  })

  // Also fetch API spec files (YAML/YML) from api-specs/[category]/ directories
  const apiSpecFiles: AzureDevOpsFile[] = data.value.filter((item: any) => {
    const isFile = !item.isFolder
    const inApiSpecs = item.path.includes('/api-specs/') || item.path.startsWith('/api-specs/')
    const isYamlFile = item.path.endsWith('.yaml') || item.path.endsWith('.yml')
    
    // Only include YAML files that are in api-specs/[category]/ subdirectories
    if (inApiSpecs && isYamlFile) {
      const pathParts = item.path.split('/')
      const apiSpecsIndex = pathParts.findIndex((p: string) => p === 'api-specs')
      // Must have at least: api-specs/[category]/[file].yaml
      return apiSpecsIndex !== -1 && pathParts.length >= apiSpecsIndex + 3
    }
    
    return false
  })

  console.log(`📋 Found ${files.length} markdown files in repository tree`)
  if (apiSpecFiles.length > 0) {
    console.log(`📋 Found ${apiSpecFiles.length} API specification files`)
  }

  const documents = []
  const apiSpecs = []
  let fetchedCount = 0

  for (const file of files) {
    try {
      // Fetch file content
      const contentUrl = `${baseUrl}/items?path=${encodeURIComponent(file.path)}&versionType=Branch&version=${branch}&api-version=7.0`
      
      const contentResponse = await fetch(contentUrl, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'text/plain',
        },
      })

      if (contentResponse.ok) {
        const content = await contentResponse.text()
        documents.push({
          path: file.path,
          content,
          objectId: file.objectId,
        })
        fetchedCount++
        
        // Log progress every 10 files
        if (fetchedCount % 10 === 0) {
          console.log(`   📥 Fetched ${fetchedCount}/${files.length} files...`)
        }
      }
    } catch (error) {
      console.error(`   ⚠️  Failed to fetch file ${file.path}:`, error)
    }
  }

  // Fetch API spec files
  for (const file of apiSpecFiles) {
    try {
      const contentUrl = `${baseUrl}/items?path=${encodeURIComponent(file.path)}&versionType=Branch&version=${branch}&api-version=7.0`
      
      const contentResponse = await fetch(contentUrl, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'text/plain',
        },
      })

      if (contentResponse.ok) {
        const content = await contentResponse.text()
        apiSpecs.push({
          path: file.path,
          content,
          objectId: file.objectId,
        })
      }
    } catch (error) {
      console.error(`   ⚠️  Failed to fetch API spec ${file.path}:`, error)
    }
  }

  console.log(`✅ Successfully fetched ${documents.length}/${files.length} files`)
  if (apiSpecFiles.length > 0) {
    console.log(`✅ Successfully fetched ${apiSpecs.length}/${apiSpecFiles.length} API specs`)
  }

  return { documents, apiSpecs }
}
