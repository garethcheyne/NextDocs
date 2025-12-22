#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setUserAsAdmin(email) {
    if (!email) {
        console.error('❌ Error: Email address is required');
        console.log('Usage: npm run setadmin <email@example.com>');
        process.exit(1);
    }

    try {
        console.log(`🔍 Looking for user with email: ${email}`);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true, email: true, name: true, role: true }
        });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            process.exit(1);
        }

        console.log(`📧 Found user: ${user.name || 'No name'} (${user.email})`);
        console.log(`🔐 Current role: ${user.role || 'USER'}`);

        if (user.role === 'admin') {
            console.log('✅ User is already an admin!');
            process.exit(0);
        }

        // Update user role to admin
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' },
            select: { id: true, email: true, name: true, role: true }
        });

        console.log('✅ Successfully updated user role!');
        console.log(`👤 User: ${updatedUser.name || 'No name'} (${updatedUser.email})`);
        console.log(`🔐 New role: ${updatedUser.role}`);

    } catch (error) {
        console.error('❌ Database error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Get email from command line arguments
const email = process.argv[2];
setUserAsAdmin(email);