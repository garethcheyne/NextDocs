import { Repository } from '@prisma/client'
import { decryptToken } from '@/lib/crypto/encryption'

interface GitHubFile {
  path: string
  sha: string
  download_url: string
}

export async function syncGitHub(repository: Repository) {
  console.log('🔗 Connecting to GitHub...')
  
  const token = decryptToken(repository.patEncrypted!)
  const { owner, repo, branch, basePath } = repository

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`
  
  // Get repository tree
  const treeUrl = `${baseUrl}/git/trees/${branch}?recursive=1`
  
  console.log('📡 Fetching repository tree...')
  const response = await fetch(treeUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  // Filter for markdown files and metadata in the base path, excluding api-specs directory
  // Exception: Allow index.md or readme.md files in api-specs for intro/overview pages (if they exist)
  // Also include JSON files from /authors/ directory
  const files: GitHubFile[] = data.tree.filter((item: any) => {
    const isBlob = item.type === 'blob'
    const inBasePath = item.path.startsWith(basePath === '/' ? '' : basePath.replace(/^\//, ''))
    const isMarkdownOrMeta = item.path.endsWith('.md') || item.path.endsWith('.mdx') || item.path.endsWith('_meta.json')
    
    // Check if file is a JSON file in the authors directory
    const isAuthorJson = (item.path.includes('/authors/') || item.path.startsWith('authors/')) && item.path.endsWith('.json')
    
    // Check if file is in api-specs directory
    const inApiSpecs = item.path.includes('/api-specs/') || item.path.startsWith('api-specs/')
    
    // If in api-specs, only allow index.md or readme.md files (optional - may not exist)
    if (inApiSpecs) {
      const fileName = item.path.split('/').pop()?.toLowerCase()
      return isBlob && (fileName === 'index.md' || fileName === 'readme.md')
    }
    
    return isBlob && inBasePath && (isMarkdownOrMeta || isAuthorJson)
  })

  // Also fetch API spec files (YAML/YML) from api-specs/[category]/ directories
  const apiSpecFiles: GitHubFile[] = data.tree.filter((item: any) => {
    const isBlob = item.type === 'blob'
    const inApiSpecs = item.path.includes('/api-specs/') || item.path.startsWith('api-specs/')
    const isYamlFile = item.path.endsWith('.yaml') || item.path.endsWith('.yml')
    
    // Only include YAML files that are in api-specs/[category]/ subdirectories
    if (inApiSpecs && isYamlFile) {
      const pathParts = item.path.split('/')
      const apiSpecsIndex = pathParts.indexOf('api-specs')
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
      const contentUrl = `${baseUrl}/contents/${file.path}?ref=${branch}`
      
      const contentResponse = await fetch(contentUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })

      if (contentResponse.ok) {
        const content = await contentResponse.text()
        documents.push({
          path: file.path,
          content,
          sha: file.sha,
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
      const contentUrl = `${baseUrl}/contents/${file.path}?ref=${branch}`
      
      const contentResponse = await fetch(contentUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })

      if (contentResponse.ok) {
        const content = await contentResponse.text()
        apiSpecs.push({
          path: file.path,
          content,
          sha: file.sha,
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
