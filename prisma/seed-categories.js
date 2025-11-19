const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create feature categories
    const categories = [
        {
            name: 'Dynamics 365 CE (NZL)',
            slug: 'dynamics-365-ce-nzl',
            description: 'Customer Engagement platform for New Zealand operations including Sales, Service, and Marketing modules',
            color: '#3B82F6',
        },
        {
            name: 'Dynamics 365 CE (AUS)',
            slug: 'dynamics-365-ce-aus',
            description: 'Customer Engagement platform for Australian operations including Sales, Service, and Marketing modules',
            color: '#10B981',
        },
        {
            name: 'Deliver Ezy (NZL)',
            slug: 'deliver-ezy-nzl',
            description: 'Delivery management system for New Zealand logistics and route optimization',
            color: '#EF4444',
        },
        {
            name: 'Dynamics 365 BC (AUS)',
            slug: 'dynamics-365-bc-aus',
            description: 'Business Central ERP solution for Australian financial and operations management',
            color: '#8B5CF6',
        },
        {
            name: 'Dynamics 365 BC (Arisit)',
            slug: 'dynamics-365-bc-arisit',
            description: 'Business Central implementation for Arisit operations and business process management',
            color: '#F59E0B',
        },
    ];

    for (const category of categories) {
        const created = await prisma.featureCategory.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
        console.log('✅ Created category:', created.name);
    }

    console.log('🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
