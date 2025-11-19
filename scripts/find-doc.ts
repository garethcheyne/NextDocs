import { prisma } from '../src/lib/db/prisma'

async function main() {
  const slug = 'docs/dynamics-365-bc/finance'
  
  console.log(`Looking for document with slug: "${slug}"\n`)
  
  const doc = await prisma.document.findFirst({
    where: { slug },
    select: { id: true, title: true, slug: true, filePath: true, category: true },
  })
  
  if (doc) {
    console.log('✅ Document found:')
    console.log(JSON.stringify(doc, null, 2))
  } else {
    console.log('❌ Document not found')
    
    // Find similar
    const similar = await prisma.document.findMany({
      where: {
        OR: [
          { slug: { startsWith: 'docs/dynamics-365-bc' } },
          { filePath: { contains: 'finance' } },
        ],
      },
      select: { slug: true, title: true, filePath: true },
      take: 5,
    })
    
    console.log('\nSimilar documents:')
    similar.forEach(s => console.log(`  - ${s.slug} (${s.filePath})`))
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
