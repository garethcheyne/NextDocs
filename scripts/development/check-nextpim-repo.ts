import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNextPIMRepo() {
  console.log('🔍 Checking NextPIM repository data...\n')

  // Find the repository
  const repo = await prisma.repository.findFirst({
    where: {
      name: {
        contains: 'NextPIM',
        mode: 'insensitive',
      },
    },
  })

  if (!repo) {
    console.log('❌ NextPIM repository not found!')
    return
  }

  console.log(`✅ Found repository: ${repo.name} (ID: ${repo.id})`)
  console.log(`   Source: ${repo.source}`)
  console.log(`   Last sync: ${repo.lastSyncAt}\n`)

  // Check documents
  const documents = await prisma.document.findMany({
    where: { repositoryId: repo.id },
    select: {
      slug: true,
      title: true,
      category: true,
      filePath: true,
    },
    orderBy: { slug: 'asc' },
  })

  console.log(`📄 Documents in database: ${documents.length}`)
  if (documents.length > 0) {
    console.log('\nDocuments:')
    documents.forEach((doc, idx) => {
      console.log(`   ${idx + 1}. ${doc.slug}`)
      console.log(`      Title: ${doc.title}`)
      console.log(`      Category: ${doc.category || 'none'}`)
      console.log(`      File: ${doc.filePath}\n`)
    })
  }

  // Check category metadata
  const categories = await prisma.categoryMetadata.findMany({
    where: { repositoryId: repo.id },
    orderBy: [
      { level: 'asc' },
      { order: 'asc' },
    ],
  })

  console.log(`📁 Category metadata entries: ${categories.length}`)
  if (categories.length > 0) {
    console.log('\nCategories:')
    categories.forEach((cat, idx) => {
      const indent = '  '.repeat(cat.level)
      console.log(`   ${idx + 1}. ${indent}${cat.title} (${cat.categorySlug})`)
      console.log(`      ${indent}Level: ${cat.level}, Order: ${cat.order}, Parent: ${cat.parentSlug || 'none'}`)
      console.log(`      ${indent}Icon: ${cat.icon || 'none'}\n`)
    })
  }

  await prisma.$disconnect()
}

checkNextPIMRepo().catch(console.error)
