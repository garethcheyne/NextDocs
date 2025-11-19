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

    // Create authors
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

    // Create feature request categories
    const bcCategory = await prisma.featureCategory.upsert({
        where: { slug: 'd365-business-central' },
        update: {},
        create: {
            name: 'Dynamics 365 Business Central',
            slug: 'd365-business-central',
            description: 'Features related to Business Central integration',
            color: '#0078D4',
            icon: '📊',
            enabled: true,
        },
    })
    console.log('✅ Created category:', bcCategory.name)

    const ceCategory = await prisma.featureCategory.upsert({
        where: { slug: 'd365-customer-engagement' },
        update: {},
        create: {
            name: 'Dynamics 365 Customer Engagement',
            slug: 'd365-customer-engagement',
            description: 'Features related to Customer Engagement apps',
            color: '#742774',
            icon: '🤝',
            enabled: true,
        },
    })
    console.log('✅ Created category:', ceCategory.name)

    const ewayCategory = await prisma.featureCategory.upsert({
        where: { slug: 'eway-integration' },
        update: {},
        create: {
            name: 'eWay Integration',
            slug: 'eway-integration',
            description: 'Features related to eWay payment integration',
            color: '#00A651',
            icon: '💳',
            enabled: true,
        },
    })
    console.log('✅ Created category:', ewayCategory.name)

    const nextdocsCategory = await prisma.featureCategory.upsert({
        where: { slug: 'nextdocs-platform' },
        update: {},
        create: {
            name: 'NextDocs Platform',
            slug: 'nextdocs-platform',
            description: 'Features for the NextDocs documentation platform itself',
            color: '#FF6B00',
            icon: '📚',
            enabled: true,
        },
    })
    console.log('✅ Created category:', nextdocsCategory.name)

    // Create sample feature requests
    const feature1 = await prisma.featureRequest.create({
        data: {
            title: 'Add bulk import functionality for customer data',
            slug: 'bulk-import-customer-data',
            description: 'Allow administrators to import customer records in bulk via CSV or Excel files. This would save significant time when migrating data from legacy systems.',
            categoryId: bcCategory.id,
            createdBy: admin.id,
            createdByName: admin.name || 'Admin User',
            createdByEmail: admin.email,
            status: 'approved',
            priority: 'high',
            voteCount: 15,
            commentCount: 3,
            lastActivityAt: new Date(),
        },
    })
    console.log('✅ Created feature:', feature1.title)

    // Create votes for feature 1
    await prisma.featureVote.createMany({
        data: [
            { featureId: feature1.id, userId: admin.id, voteType: 1 },
            { featureId: feature1.id, userId: user.id, voteType: 1 },
        ],
    })

    // Create followers for feature 1
    await prisma.featureFollower.createMany({
        data: [
            { featureId: feature1.id, userId: admin.id, notifyOnComment: true, notifyOnStatus: true },
            { featureId: feature1.id, userId: user.id, notifyOnComment: true, notifyOnStatus: true },
        ],
    })

    const feature2 = await prisma.featureRequest.create({
        data: {
            title: 'Mobile app for sales team',
            slug: 'mobile-app-sales-team',
            description: 'Develop a mobile application for iOS and Android that allows the sales team to access customer information, create quotes, and track opportunities on the go.',
            categoryId: ceCategory.id,
            createdBy: user.id,
            createdByName: user.name || 'Regular User',
            createdByEmail: user.email,
            status: 'in-progress',
            priority: 'high',
            voteCount: 23,
            commentCount: 8,
            lastActivityAt: new Date(),
        },
    })
    console.log('✅ Created feature:', feature2.title)

    await prisma.featureVote.create({
        data: { featureId: feature2.id, userId: user.id, voteType: 1 },
    })

    await prisma.featureFollower.create({
        data: { featureId: feature2.id, userId: user.id, notifyOnComment: true, notifyOnStatus: true },
    })

    const feature3 = await prisma.featureRequest.create({
        data: {
            title: 'Support for Apple Pay and Google Pay',
            slug: 'support-apple-google-pay',
            description: 'Add support for Apple Pay and Google Pay to provide customers with more payment options and faster checkout experience.',
            categoryId: ewayCategory.id,
            createdBy: admin.id,
            createdByName: admin.name || 'Admin User',
            createdByEmail: admin.email,
            status: 'proposal',
            priority: 'medium',
            voteCount: 12,
            commentCount: 2,
            lastActivityAt: new Date(),
        },
    })
    console.log('✅ Created feature:', feature3.title)

    await prisma.featureVote.create({
        data: { featureId: feature3.id, userId: admin.id, voteType: 1 },
    })

    await prisma.featureFollower.create({
        data: { featureId: feature3.id, userId: admin.id, notifyOnComment: true, notifyOnStatus: true },
    })

    const feature4 = await prisma.featureRequest.create({
        data: {
            title: 'Dark mode support',
            slug: 'dark-mode-support',
            description: 'Implement a dark mode theme for the NextDocs platform to reduce eye strain during extended reading sessions.',
            categoryId: nextdocsCategory.id,
            createdBy: user.id,
            createdByName: user.name || 'Regular User',
            createdByEmail: user.email,
            status: 'completed',
            priority: 'low',
            voteCount: 45,
            commentCount: 12,
            lastActivityAt: new Date(),
        },
    })
    console.log('✅ Created feature:', feature4.title)

    await prisma.featureVote.createMany({
        data: [
            { featureId: feature4.id, userId: admin.id, voteType: 1 },
            { featureId: feature4.id, userId: user.id, voteType: 1 },
        ],
    })

    await prisma.featureFollower.createMany({
        data: [
            { featureId: feature4.id, userId: admin.id, notifyOnComment: true, notifyOnStatus: true },
            { featureId: feature4.id, userId: user.id, notifyOnComment: true, notifyOnStatus: true },
        ],
    })

    const feature5 = await prisma.featureRequest.create({
        data: {
            title: 'Advanced inventory forecasting',
            slug: 'advanced-inventory-forecasting',
            description: 'Use machine learning to predict inventory needs based on historical sales data, seasonal trends, and market conditions.',
            categoryId: bcCategory.id,
            createdBy: admin.id,
            createdByName: admin.name || 'Admin User',
            createdByEmail: admin.email,
            status: 'proposal',
            priority: 'medium',
            voteCount: 8,
            commentCount: 1,
            lastActivityAt: new Date(),
        },
    })
    console.log('✅ Created feature:', feature5.title)

    await prisma.featureVote.create({
        data: { featureId: feature5.id, userId: admin.id, voteType: 1 },
    })

    await prisma.featureFollower.create({
        data: { featureId: feature5.id, userId: admin.id, notifyOnComment: true, notifyOnStatus: true },
    })

    const feature6 = await prisma.featureRequest.create({
        data: {
            title: 'Email template builder',
            slug: 'email-template-builder',
            description: 'Create a drag-and-drop email template builder for marketing campaigns with dynamic content support.',
            categoryId: ceCategory.id,
            createdBy: user.id,
            createdByName: user.name || 'Regular User',
            createdByEmail: user.email,
            status: 'rejected',
            priority: 'low',
            voteCount: 3,
            commentCount: 5,
            lastActivityAt: new Date(),
        },
    })
    console.log('✅ Created feature:', feature6.title)

    await prisma.featureVote.create({
        data: { featureId: feature6.id, userId: user.id, voteType: 1 },
    })

    await prisma.featureFollower.create({
        data: { featureId: feature6.id, userId: user.id, notifyOnComment: true, notifyOnStatus: true },
    })

    console.log('🎉 Database seed completed successfully!')
    console.log('\n📝 Test Credentials:')
    console.log('   Admin:  admin@nextdocs.local / admin123')
    console.log('   User:   user@nextdocs.local / user123')
    console.log('\n📊 Feature Requests:')
    console.log('   Categories: 4 (D365 BC, D365 CE, eWay, NextDocs)')
    console.log('   Features: 6 (various statuses and priorities)')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
