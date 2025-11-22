/**
 * Authentication & Authorization Tests
 * Tests for user management and permissions
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

describe('User Authentication', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should have properly hashed passwords', async () => {
    const users = await prisma.user.findMany({
      take: 5
    });
    
    users.forEach(user => {
      if (user.password) {
        // Bcrypt hashes start with $2a$, $2b$, or $2y$
        expect(user.password).toMatch(/^\$2[aby]\$/);
      }
    });
  });

  test('should have valid user roles', async () => {
    const users = await prisma.user.findMany();
    
    const validRoles = ['ADMIN', 'USER', 'VIEWER'];
    
    users.forEach(user => {
      expect(validRoles).toContain(user.role);
    });
  });

  test('should have unique email addresses', async () => {
    const users = await prisma.user.findMany({
      select: { email: true }
    });
    
    const emails = users.map(u => u.email);
    const uniqueEmails = new Set(emails);
    
    expect(emails.length).toBe(uniqueEmails.size);
  });

  test('should validate email format', async () => {
    const users = await prisma.user.findMany({
      select: { email: true }
    });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    users.forEach(user => {
      expect(user.email).toMatch(emailRegex);
    });
  });
});

describe('User Permissions', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should have at least one admin user', async () => {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    
    expect(adminCount).toBeGreaterThan(0);
  });

  test('should track user sessions', async () => {
    const sessions = await prisma.session.findMany({
      take: 5
    });
    
    sessions.forEach(session => {
      expect(session.sessionToken).toBeDefined();
      expect(session.userId).toBeDefined();
      expect(session.expires).toBeDefined();
    });
  });
});
