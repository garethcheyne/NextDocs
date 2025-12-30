import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBasePath() {
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

  console.log(`Repository: ${repo.name}`)
  console.log(`Base Path: "${repo.basePath}"`)
  console.log(`Branch: ${repo.branch}`)
  
  await prisma.$disconnect()
}

checkBasePath().catch(console.error)
