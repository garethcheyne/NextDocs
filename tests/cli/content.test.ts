/**
 * Content Management Tests
 * Tests for blog posts, API specs, and documentation
 */

import { PrismaClient } from '@prisma/client';

describe('Blog Posts', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should have valid blog post structure', async () => {
    const posts = await prisma.blogPost.findMany({
      take: 5
    });
    
    posts.forEach(post => {
      expect(post.title).toBeTruthy();
      expect(post.slug).toBeTruthy();
      expect(post.content).toBeTruthy();
      expect(post.authorId).toBeTruthy();
    });
  });

  test('should have unique slugs', async () => {
    const posts = await prisma.blogPost.findMany({
      select: { slug: true }
    });
    
    const slugs = posts.map(p => p.slug);
    const uniqueSlugs = new Set(slugs);
    
    expect(slugs.length).toBe(uniqueSlugs.size);
  });

  test('should associate posts with authors', async () => {
    const posts = await prisma.blogPost.findMany({
      include: { author: true },
      take: 5
    });
    
    posts.forEach(post => {
      expect(post.author).toBeDefined();
      expect(post.author.id).toBe(post.authorId);
    });
  });

  test('should track publication status', async () => {
    const posts = await prisma.blogPost.findMany({
      take: 10
    });
    
    posts.forEach(post => {
      expect(typeof post.published).toBe('boolean');
      if (post.published) {
        expect(post.publishedAt).toBeDefined();
      }
    });
  });
});

describe('API Specifications', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should have valid API spec structure', async () => {
    const specs = await prisma.apiSpec.findMany({
      take: 5
    });
    
    specs.forEach(spec => {
      expect(spec.title).toBeTruthy();
      expect(spec.slug).toBeTruthy();
      expect(spec.content).toBeTruthy();
    });
  });

  test('should have unique API spec slugs', async () => {
    const specs = await prisma.apiSpec.findMany({
      select: { slug: true }
    });
    
    const slugs = specs.map(s => s.slug);
    const uniqueSlugs = new Set(slugs);
    
    expect(slugs.length).toBe(uniqueSlugs.size);
  });

  test('should support versioning', async () => {
    const specs = await prisma.apiSpec.findMany({
      where: {
        version: { not: null }
      },
      take: 5
    });
    
    specs.forEach(spec => {
      if (spec.version) {
        // Version should follow semantic versioning or similar pattern
        expect(spec.version).toMatch(/\d+(\.\d+)?(\.\d+)?/);
      }
    });
  });
});

describe('Feature Requests', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should have valid feature request structure', async () => {
    const requests = await prisma.featureRequest.findMany({
      take: 5
    });
    
    requests.forEach(request => {
      expect(request.title).toBeTruthy();
      expect(request.description).toBeTruthy();
      expect(request.status).toBeTruthy();
    });
  });

  test('should track votes and comments', async () => {
    const requests = await prisma.featureRequest.findMany({
      include: {
        votes: true,
        comments: true
      },
      take: 5
    });
    
    requests.forEach(request => {
      expect(request.voteCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(request.votes)).toBe(true);
      expect(Array.isArray(request.comments)).toBe(true);
    });
  });

  test('should link to external work items', async () => {
    const linkedRequests = await prisma.featureRequest.findMany({
      where: {
        externalWorkItemId: { not: null }
      },
      take: 5
    });
    
    linkedRequests.forEach(request => {
      expect(request.externalWorkItemId).toBeTruthy();
      expect(['GITHUB', 'AZURE_DEVOPS']).toContain(request.externalSystem);
    });
  });
});
