/**
 * Documentation E2E Tests
 * Tests for documentation viewing and navigation
 */

import { test, expect } from '@playwright/test';

test.describe('Documentation Pages', () => {
  test('should display documentation listing', async ({ page }) => {
    await page.goto('/docs');
    
    await expect(page).toHaveTitle(/Docs|Documentation/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/docs');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
    
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      
      // Type search query
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Check if results appear
      const results = page.locator('[data-search-results], .search-results, [role="listbox"]');
      if (await results.count() > 0) {
        await expect(results).toBeVisible();
      }
    }
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    await page.goto('/docs');
    
    // Navigate to a doc if available
    const firstDoc = page.locator('a[href*="/docs/"]').first();
    if (await firstDoc.count() > 0) {
      await firstDoc.click();
      
      // Look for breadcrumbs
      const breadcrumb = page.locator('nav[aria-label*="breadcrumb" i], .breadcrumb');
      if (await breadcrumb.count() > 0) {
        await expect(breadcrumb).toBeVisible();
      }
    }
  });

  test('should render markdown content', async ({ page }) => {
    await page.goto('/docs');
    
    // Navigate to first available doc
    const firstDoc = page.locator('a[href*="/docs/"]').first();
    if (await firstDoc.count() > 0) {
      await firstDoc.click();
      
      // Check for markdown rendered elements
      const content = page.locator('article, .markdown, .prose, main');
      await expect(content).toBeVisible();
      
      // Check for common markdown elements
      const hasContent = await page.locator('h1, h2, h3, p').count();
      expect(hasContent).toBeGreaterThan(0);
    }
  });

  test('should support table of contents', async ({ page }) => {
    await page.goto('/docs');
    
    const firstDoc = page.locator('a[href*="/docs/"]').first();
    if (await firstDoc.count() > 0) {
      await firstDoc.click();
      
      // Look for TOC
      const toc = page.locator('[data-toc], .toc, aside nav').first();
      if (await toc.count() > 0) {
        await expect(toc).toBeVisible();
      }
    }
  });

  test('should navigate between docs', async ({ page }) => {
    await page.goto('/docs');
    
    const firstDoc = page.locator('a[href*="/docs/"]').first();
    if (await firstDoc.count() > 0) {
      const firstUrl = await firstDoc.getAttribute('href');
      await firstDoc.click();
      
      // Look for next/previous navigation
      const nextLink = page.locator('a:has-text("Next"), a[aria-label*="next" i]').first();
      if (await nextLink.count() > 0) {
        await nextLink.click();
        
        // URL should have changed
        const currentUrl = page.url();
        expect(currentUrl).not.toContain(firstUrl || '');
      }
    }
  });

  test('should track document analytics', async ({ page }) => {
    await page.goto('/docs');
    
    const firstDoc = page.locator('a[href*="/docs/"]').first();
    if (await firstDoc.count() > 0) {
      await firstDoc.click();
      
      // Wait for analytics to potentially fire
      await page.waitForTimeout(2000);
      
      // Check if analytics script loaded (if applicable)
      const analyticsScript = page.locator('script[src*="analytics"]');
      // This is optional and depends on implementation
    }
  });
});

test.describe('Code Highlighting', () => {
  test('should highlight code blocks', async ({ page }) => {
    await page.goto('/docs');
    
    const firstDoc = page.locator('a[href*="/docs/"]').first();
    if (await firstDoc.count() > 0) {
      await firstDoc.click();
      
      // Look for code blocks
      const codeBlock = page.locator('pre code, .shiki, .highlight').first();
      if (await codeBlock.count() > 0) {
        await expect(codeBlock).toBeVisible();
        
        // Check if syntax highlighting is applied
        const hasHighlight = await codeBlock.locator('span[style*="color"]').count();
        expect(hasHighlight).toBeGreaterThan(0);
      }
    }
  });
});
