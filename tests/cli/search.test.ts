/**
 * Search Functionality Tests
 * Tests for search vector and full-text search capabilities
 */

import { PrismaClient } from '@prisma/client';

describe('Search Functionality', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should search repositories by content', async () => {
    const searchTerm = 'documentation';
    
    const results = await prisma.$queryRaw`
      SELECT id, name, description
      FROM "Repository"
      WHERE search_vector @@ to_tsquery('english', ${searchTerm})
      LIMIT 10
    `;
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  test('should search API specs', async () => {
    const searchTerm = 'api';
    
    const results = await prisma.$queryRaw`
      SELECT id, title, description
      FROM "ApiSpec"
      WHERE search_vector @@ to_tsquery('english', ${searchTerm})
      LIMIT 10
    `;
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  test('should search feature requests', async () => {
    const searchTerm = 'feature';
    
    const results = await prisma.$queryRaw`
      SELECT id, title, description
      FROM "FeatureRequest"
      WHERE search_vector @@ to_tsquery('english', ${searchTerm})
      LIMIT 10
    `;
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  test('should rank search results by relevance', async () => {
    const searchTerm = 'test';
    
    const results = await prisma.$queryRaw`
      SELECT id, name, 
             ts_rank(search_vector, to_tsquery('english', ${searchTerm})) as rank
      FROM "Repository"
      WHERE search_vector @@ to_tsquery('english', ${searchTerm})
      ORDER BY rank DESC
      LIMIT 5
    `;
    
    const rankedResults = results as any[];
    
    if (rankedResults.length > 1) {
      // Verify results are sorted by rank
      for (let i = 0; i < rankedResults.length - 1; i++) {
        expect(rankedResults[i].rank).toBeGreaterThanOrEqual(rankedResults[i + 1].rank);
      }
    }
  });
});
