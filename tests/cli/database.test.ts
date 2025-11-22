/**
 * Database Connection Tests
 * Tests for Prisma database connectivity and schema validation
 */

import { PrismaClient } from '@prisma/client';

describe('Database Connection', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should connect to database successfully', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    expect(result).toBeDefined();
  });

  test('should have all required tables', async () => {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tableNames = (tables as any[]).map(t => t.table_name);
    
    // Check for core tables
    expect(tableNames).toContain('User');
    expect(tableNames).toContain('Repository');
    expect(tableNames).toContain('FeatureRequest');
    expect(tableNames).toContain('FeatureCategory');
    expect(tableNames).toContain('ApiSpec');
    expect(tableNames).toContain('BlogPost');
  });

  test('should have search vector columns', async () => {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Repository' AND column_name = 'search_vector'
    `;
    
    expect(columns).toBeDefined();
    expect((columns as any[]).length).toBeGreaterThan(0);
  });
});

describe('Database Integrity', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should have admin user', async () => {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    expect(adminUser).toBeDefined();
    expect(adminUser?.email).toBeDefined();
  });

  test('should validate foreign key relationships', async () => {
    // This test ensures referential integrity is maintained
    const repositoryWithCategory = await prisma.repository.findFirst({
      include: {
        category: true
      }
    });
    
    // If repository exists with category, it should be valid
    if (repositoryWithCategory?.categoryId) {
      expect(repositoryWithCategory.category).toBeDefined();
    }
  });

  test('should have valid feature request statuses', async () => {
    const featureRequests = await prisma.featureRequest.findMany({
      take: 10
    });
    
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'IN_PROGRESS'];
    
    featureRequests.forEach(request => {
      expect(validStatuses).toContain(request.status);
    });
  });
});
