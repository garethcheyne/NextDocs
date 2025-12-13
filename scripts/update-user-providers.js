// Script to update user providers from 'credentials' to 'microsoft-entra-id'
// Excludes local users (those with passwords)

const { PrismaClient } = require('@prisma/client')

async function updateUserProviders() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking current users...')
    
    // First, let's see what users we have
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        password: true
      },
      orderBy: [
        { provider: 'asc' },
        { email: 'asc' }
      ]
    })
    
    console.log('\n📊 Current users:')
    allUsers.forEach(user => {
      const hasPassword = user.password ? 'HAS_PASSWORD' : 'NO_PASSWORD'
      console.log(`  ${user.email} | Provider: ${user.provider || 'NULL'} | ${hasPassword}`)
    })
    
    // Find users with NULL provider who don't have passwords (SSO users)
    const usersToUpdate = await prisma.user.findMany({
      where: {
        provider: null,
        password: null, // Exclude local users with passwords
        email: {
          contains: '@' // Ensure they have proper email addresses
        }
      }
    })
    
    console.log(`\n🎯 Found ${usersToUpdate.length} SSO users to update:`)
    usersToUpdate.forEach(user => {
      console.log(`  - ${user.email} (${user.name || 'No name'})`)
    })
    
    if (usersToUpdate.length > 0) {
      console.log('\n🔄 Updating providers to microsoft-entra-id...')
      
      const result = await prisma.user.updateMany({
        where: {
          provider: null,
          password: null,
          email: {
            contains: '@'
          }
        },
        data: {
          provider: 'microsoft-entra-id'
        }
      })
      
      console.log(`✅ Updated ${result.count} users`)
      
      // Verify the updates
      console.log('\n🔍 Verification - Updated users:')
      const updatedUsers = await prisma.user.findMany({
        where: {
          provider: 'microsoft-entra-id'
        },
        select: {
          email: true,
          name: true,
          provider: true
        }
      })
      
      updatedUsers.forEach(user => {
        console.log(`  ✓ ${user.email} | Provider: ${user.provider}`)
      })
    } else {
      console.log('\n ℹ️  No users to update')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserProviders()