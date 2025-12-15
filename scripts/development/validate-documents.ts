import { prisma } from '../src/lib/db/prisma'

async function main() {
  console.log('📄 Checking documents in database...\n')

  // Check total count
  const total = await prisma.document.count()
  console.log(`Total documents: ${total}\n`)

  // Check sample documents
  const docs = await prisma.document.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      filePath: true,
    },
    take: 20,
    orderBy: { updatedAt: 'desc' },
  })

  console.log('Recent documents:')
  docs.forEach((doc) => {
    console.log(`  - [${doc.category || 'no-category'}] ${doc.slug}`)
    console.log(`    Title: ${doc.title}`)
    console.log(`    File: ${doc.filePath}`)
    console.log()
  })

  // Check for the specific slug
  const specificDoc = await prisma.document.findUnique({
    where: { slug: 'dynamics-365-bc/finance' },
  })

  console.log('Checking for slug "dynamics-365-bc/finance":')
  if (specificDoc) {
    console.log(`  ✅ Found: ${specificDoc.title}`)
  } else {
    console.log(`  ❌ Not found`)
    
    // Check similar slugs
    const similar = await prisma.document.findMany({
      where: {
        OR: [
          { slug: { contains: 'dynamics-365-bc' } },
          { slug: { contains: 'finance' } },
          { category: 'dynamics-365-bc' },
        ],
      },
      select: { slug: true, title: true, category: true },
      take: 10,
    })
    
    console.log('\n  Similar documents:')
    similar.forEach((doc) => {
      console.log(`    - ${doc.slug} (category: ${doc.category})`)
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
