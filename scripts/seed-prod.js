#!/usr/bin/env node
/**
 * Production Seed Script - Non-interactive
 * Creates default users with standard passwords
 * Run: docker-compose -f docker-compose.prod.yml exec app node scripts/seed-prod.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Default passwords (change these after first login!)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const USER_PASSWORD = process.env.USER_PASSWORD || 'user123';

async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

async function main() {
    console.log('🌱 Starting production database seed...');
    console.log('⚠️  Using default passwords - CHANGE THESE AFTER FIRST LOGIN!\n');

    try {
        // Create default admin user
        const adminPassword = await hashPassword(ADMIN_PASSWORD);
        const admin = await prisma.user.upsert({
            where: { email: 'root@nextdocs.local' },
            update: {},
            create: {
                email: 'root@nextdocs.local',
                name: 'Root',
                password: adminPassword,
                role: 'admin',
                provider: 'credentials',
                emailVerified: new Date(),
            },
        });
        console.log('✅ Created admin user:', admin.email);
        console.log('   Password:', ADMIN_PASSWORD);

        // Create a regular user
        const userPassword = await hashPassword(USER_PASSWORD);
        const user = await prisma.user.upsert({
            where: { email: 'user@nextdocs.local' },
            update: {},
            create: {
                email: 'user@nextdocs.local',
                name: 'User',
                password: userPassword,
                role: 'user',
                provider: 'credentials',
                emailVerified: new Date(),
            },
        });
        console.log('✅ Created regular user:', user.email);
        console.log('   Password:', USER_PASSWORD);

        console.log('\n✨ Seed completed successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Admin: root@nextdocs.local / ' + ADMIN_PASSWORD);
        console.log('   User:  user@nextdocs.local / ' + USER_PASSWORD);
        console.log('\n⚠️  IMPORTANT: Change these passwords immediately after first login!');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
        process.exit(0);
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
