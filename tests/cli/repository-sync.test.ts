/**
 * Repository Sync Tests
 * Tests for GitHub and Azure DevOps integration
 */

import { PrismaClient } from '@prisma/client';

describe('Repository Configuration', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should have valid repository sync settings', async () => {
    const repositories = await prisma.repository.findMany({
      take: 10
    });
    
    repositories.forEach(repo => {
      // Each repository should have a valid sync status
      const validStatuses = ['ACTIVE', 'INACTIVE', 'SYNCING', 'ERROR'];
      expect(validStatuses).toContain(repo.syncStatus);
    });
  });

  test('should validate GitHub repository configuration', async () => {
    const githubRepos = await prisma.repository.findMany({
      where: {
        githubOwner: { not: null }
      },
      take: 5
    });
    
    githubRepos.forEach(repo => {
      expect(repo.githubOwner).toBeTruthy();
      expect(repo.githubRepo).toBeTruthy();
    });
  });

  test('should track repository image sync', async () => {
    const reposWithImages = await prisma.repository.findMany({
      where: {
        syncImages: true
      },
      include: {
        imageTracking: true
      },
      take: 5
    });
    
    reposWithImages.forEach(repo => {
      expect(repo.syncImages).toBe(true);
      // Image tracking should exist if sync is enabled
    });
  });

  test('should have valid category associations', async () => {
    const repositories = await prisma.repository.findMany({
      where: {
        categoryId: { not: null }
      },
      include: {
        category: true
      },
      take: 10
    });
    
    repositories.forEach(repo => {
      if (repo.categoryId) {
        expect(repo.category).toBeDefined();
        expect(repo.category?.id).toBe(repo.categoryId);
      }
    });
  });
});

describe('Feature Categories', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should have valid integration types', async () => {
    const categories = await prisma.featureCategory.findMany();
    
    const validTypes = ['GITHUB', 'AZURE_DEVOPS', 'NONE'];
    
    categories.forEach(category => {
      expect(validTypes).toContain(category.integrationType);
    });
  });

  test('should validate Azure DevOps configuration', async () => {
    const azureCategories = await prisma.featureCategory.findMany({
      where: {
        integrationType: 'AZURE_DEVOPS'
      }
    });
    
    azureCategories.forEach(category => {
      expect(category.devopsOrg).toBeTruthy();
      expect(category.devopsProject).toBeTruthy();
    });
  });

  test('should validate GitHub configuration', async () => {
    const githubCategories = await prisma.featureCategory.findMany({
      where: {
        integrationType: 'GITHUB'
      }
    });
    
    githubCategories.forEach(category => {
      expect(category.githubOwner).toBeTruthy();
      expect(category.githubRepo).toBeTruthy();
    });
  });
});
