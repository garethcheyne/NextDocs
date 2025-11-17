import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create default admin user
    const adminPassword = await hashPassword('admin123')
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nextdocs.local' },
        update: {},
        create: {
            email: 'admin@nextdocs.local',
            name: 'Admin User',
            password: adminPassword,
            role: 'admin',
            provider: 'credentials',
            emailVerified: new Date(),
        },
    })
    console.log('✅ Created admin user:', admin.email)

    // Create test regular user
    const userPassword = await hashPassword('user123')
    const user = await prisma.user.upsert({
        where: { email: 'user@nextdocs.local' },
        update: {},
        create: {
            email: 'user@nextdocs.local',
            name: 'Regular User',
            password: userPassword,
            role: 'user',
            provider: 'credentials',
            emailVerified: new Date(),
        },
    })
    console.log('✅ Created regular user:', user.email)


    const karen = await prisma.author.upsert({
        where: { email: 'karen.denter@harveynorman.com.au' },
        update: {},
        create: {
            email: 'karen.denter@harveynorman.com.au',
            name: 'Karen Denter',
            title: 'Technical Lead',
            bio: 'Technical lead for enterprise solutions and system architecture.',
            location: 'Australia',
            joinedDate: new Date('2019-03-15'),
        },
    })
    console.log('✅ Created author:', karen.name)

    const leigh = await prisma.author.upsert({
        where: { email: 'leigh.hogan@harveynorman.com.au' },
        update: {},
        create: {
            email: 'leigh.hogan@harveynorman.com.au',
            name: 'Leigh Hogan',
            title: 'Solutions Architect',
            bio: 'Solutions architect with expertise in cloud infrastructure and DevOps.',
            location: 'Australia',
            joinedDate: new Date('2018-06-01'),
        },
    })
    console.log('✅ Created author:', leigh.name)

    console.log('🎉 Database seed completed successfully!')
    console.log('\n📝 Test Credentials:')
    console.log('   Admin:  admin@nextdocs.local / admin123')
    console.log('   User:   user@nextdocs.local / user123')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
