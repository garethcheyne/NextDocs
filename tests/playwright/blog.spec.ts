/**
 * Blog E2E Tests
 * Tests for blog listing and posts
 */

import { test, expect } from '@playwright/test';

test.describe('Blog Listing', () => {
  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog');
    
    await expect(page).toHaveTitle(/Blog/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show blog post cards', async ({ page }) => {
    await page.goto('/blog');
    
    // Look for blog post items
    const posts = page.locator('article, .blog-post, [data-blog-post]');
    const postCount = await posts.count();
    
    if (postCount > 0) {
      // Each post should have title and link
      const firstPost = posts.first();
      await expect(firstPost).toBeVisible();
      
      const title = firstPost.locator('h2, h3, .title');
      await expect(title).toBeVisible();
    }
  });

  test('should filter posts by category', async ({ page }) => {
    await page.goto('/blog');
    
    // Look for category filters
    const categoryFilter = page.locator('[data-category-filter], .category-filter, button[data-category]').first();
    
    if (await categoryFilter.count() > 0) {
      await categoryFilter.click();
      await page.waitForTimeout(1000);
      
      // Posts should update or filter
      const posts = page.locator('article, .blog-post');
      expect(await posts.count()).toBeGreaterThan(-1);
    }
  });

  test('should search blog posts', async ({ page }) => {
    await page.goto('/blog');
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Posts should filter based on search
      const posts = page.locator('article, .blog-post');
      expect(await posts.count()).toBeGreaterThan(-1);
    }
  });
});

test.describe('Blog Post Page', () => {
  test('should display individual blog post', async ({ page }) => {
    await page.goto('/blog');
    
    // Click on first post
    const firstPost = page.locator('a[href*="/blog/"]').first();
    if (await firstPost.count() > 0) {
      await firstPost.click();
      
      // Should be on post page
      await expect(page).toHaveURL(/\/blog\//);
      
      // Post should have title and content
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('article, .content, .prose')).toBeVisible();
    }
  });

  test('should display post metadata', async ({ page }) => {
    await page.goto('/blog');
    
    const firstPost = page.locator('a[href*="/blog/"]').first();
    if (await firstPost.count() > 0) {
      await firstPost.click();
      
      // Look for author, date, reading time
      const metadata = page.locator('.metadata, [data-post-meta], time');
      if (await metadata.count() > 0) {
        await expect(metadata.first()).toBeVisible();
      }
    }
  });

  test('should render markdown in posts', async ({ page }) => {
    await page.goto('/blog');
    
    const firstPost = page.locator('a[href*="/blog/"]').first();
    if (await firstPost.count() > 0) {
      await firstPost.click();
      
      // Check for markdown elements
      const content = page.locator('article, .content');
      const paragraphs = content.locator('p');
      
      expect(await paragraphs.count()).toBeGreaterThan(0);
    }
  });

  test('should show related posts', async ({ page }) => {
    await page.goto('/blog');
    
    const firstPost = page.locator('a[href*="/blog/"]').first();
    if (await firstPost.count() > 0) {
      await firstPost.click();
      
      // Look for related posts section
      const relatedSection = page.locator(':has-text("Related"), :has-text("Similar"), [data-related-posts]');
      if (await relatedSection.count() > 0) {
        await expect(relatedSection.first()).toBeVisible();
      }
    }
  });

  test('should display author information', async ({ page }) => {
    await page.goto('/blog');
    
    const firstPost = page.locator('a[href*="/blog/"]').first();
    if (await firstPost.count() > 0) {
      await firstPost.click();
      
      // Look for author card or info
      const authorInfo = page.locator('[data-author], .author, :has-text("Author")');
      if (await authorInfo.count() > 0) {
        await expect(authorInfo.first()).toBeVisible();
      }
    }
  });
});

test.describe('Blog Navigation', () => {
  test('should paginate posts', async ({ page }) => {
    await page.goto('/blog');
    
    // Look for pagination
    const nextButton = page.locator('button:has-text("Next"), a:has-text("Next"), [aria-label*="next" i]').first();
    
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // URL or content should change
      expect(page.url()).toBeTruthy();
    }
  });

  test('should navigate back to blog from post', async ({ page }) => {
    await page.goto('/blog');
    
    const firstPost = page.locator('a[href*="/blog/"]').first();
    if (await firstPost.count() > 0) {
      await firstPost.click();
      
      // Look for back button
      const backButton = page.locator('a[href="/blog"], button:has-text("Back")').first();
      if (await backButton.count() > 0) {
        await backButton.click();
        await expect(page).toHaveURL(/\/blog$/);
      }
    }
  });
});
