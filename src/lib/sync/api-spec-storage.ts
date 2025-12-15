import { prisma } from '@/lib/db/prisma'
import { updateApiSpecSearchVector } from '@/lib/search/indexer'
import path from 'path'

interface ApiSpecFile {
  path: string
  content: string
}

/**
 * Process and store API specification files (YAML/YML) from api-specs directory
 * Expected structure: api-specs/[category]/[spec-name].yaml or .yml
 */
export async function storeApiSpecs(
  repositoryId: string,
  files: ApiSpecFile[]
) {
  console.log(`\n📋 Processing ${files.length} API specification files...`)

  const results = {
    totalAdded: 0,
    totalUpdated: 0,
    totalDeleted: 0,
    totalSkipped: 0,
    errors: [] as string[],
  }

  const processedPaths: string[] = []

  for (const file of files) {
    try {
      // Extract category and spec name from path
      // Expected: api-specs/[category]/[spec-name].yaml
      const pathParts = file.path.split('/')
      const apiSpecsIndex = pathParts.indexOf('api-specs')
      
      if (apiSpecsIndex === -1 || pathParts.length < apiSpecsIndex + 3) {
        console.log(`   ⚠️  Skipping ${file.path}: Invalid path structure`)
        results.totalSkipped++
        continue
      }

      const category = pathParts[apiSpecsIndex + 1]
      const fileName = pathParts[pathParts.length - 1]
      const specName = fileName.replace(/\.(yaml|yml)$/i, '')
      
      // Try to parse YAML to extract metadata (name, version, description)
      let apiName = specName
      let version = '1.0.0'
      let description: string | null = null
      
      try {
        // Basic YAML parsing to extract info.title, info.version, info.description
        const infoMatch = file.content.match(/info:\s*\n([\s\S]*?)(?=\n\w+:|$)/)
        if (infoMatch) {
          const infoSection = infoMatch[1]
          
          const titleMatch = infoSection.match(/title:\s*["']?([^"'\n]+)["']?/)
          if (titleMatch) apiName = titleMatch[1].trim()
          
          const versionMatch = infoSection.match(/version:\s*["']?([^"'\n]+)["']?/)
          if (versionMatch) version = versionMatch[1].trim()
          
          const descMatch = infoSection.match(/description:\s*["']?([^"'\n]+)["']?/)
          if (descMatch) description = descMatch[1].trim()
        }
      } catch (parseError) {
        console.log(`   ⚠️  Could not parse metadata from ${file.path}, using defaults`)
      }

      // Generate slug from spec name (without version suffix)
      // Remove version pattern like -1.0.0 or -v1.0.0 from the end of specName
      const specNameWithoutVersion = specName.replace(/-v?\d+\.\d+\.\d+$/i, '')
      const slug = specNameWithoutVersion.toLowerCase().replace(/[^a-z0-9-]/g, '-')

      // Check if this specific version already exists
      const existingSpec = await prisma.aPISpec.findUnique({
        where: { 
          slug_version: {
            slug,
            version,
          }
        },
      })

      // Store the spec file path and content
      const specPath = file.path
      const specContent = file.content

      processedPaths.push(specPath)

      if (existingSpec) {
        // Check if content has actually changed by comparing content
        if (existingSpec.specContent !== specContent || existingSpec.specPath !== specPath) {
          // Update existing spec version
          await prisma.aPISpec.update({
            where: { 
              slug_version: {
                slug,
                version,
              }
            },
            data: {
              name: apiName,
              description,
              specPath,
              specContent,
              category,
              lastSyncAt: new Date(),
            },
          })
          
          // Update search vector
          await updateApiSpecSearchVector(existingSpec.id)
          
          console.log(`   ✏️  Updated: ${apiName} v${version} (${category})`)
          results.totalUpdated++
        } else {
          console.log(`   ➖ Unchanged: ${apiName} v${version} (${category})`)
          results.totalSkipped++
        }
      } else {
        // Get repository info for createdBy
        const repository = await prisma.repository.findUnique({
          where: { id: repositoryId },
          select: { createdBy: true },
        })

        if (!repository) {
          throw new Error('Repository not found')
        }

        // Create new spec
        const newSpec = await prisma.aPISpec.create({
          data: {
            name: apiName,
            slug,
            description,
            version,
            specPath,
            specContent,
            category,
            repositoryId,
            createdBy: repository.createdBy,
            lastSyncAt: new Date(),
          },
        })
        
        // Update search vector
        await updateApiSpecSearchVector(newSpec.id)
        
        console.log(`   ➕ Added: ${apiName} v${version} (${category})`)
        results.totalAdded++
      }
    } catch (error) {
      const errorMsg = `Failed to process ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(`   ❌ ${errorMsg}`)
      results.errors.push(errorMsg)
    }
  }

  // Delete API specs that no longer exist in the repository
  const deletedSpecs = await prisma.aPISpec.findMany({
    where: {
      repositoryId,
      specPath: { notIn: processedPaths.length > 0 ? processedPaths : ['__none__'] },
    },
  })

  for (const spec of deletedSpecs) {
    await prisma.aPISpec.delete({ where: { id: spec.id } })
    console.log(`   🗑️  Deleted: ${spec.name} v${spec.version} (no longer exists)`)
    results.totalDeleted++
  }

  console.log(`\n✅ API Specs: ${results.totalAdded} added, ${results.totalUpdated} updated, ${results.totalDeleted} deleted, ${results.totalSkipped} skipped`)
  if (results.errors.length > 0) {
    console.error(`⚠️  Errors: ${results.errors.length}`)
  }

  return results
}
