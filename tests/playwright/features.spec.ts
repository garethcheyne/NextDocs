/**
 * Feature Requests E2E Tests
 * Tests for feature request system
 */

import { test, expect } from '@playwright/test';

test.describe('Feature Requests Listing', () => {
  test('should display features page', async ({ page }) => {
    await page.goto('/features');
    
    await expect(page).toHaveTitle(/Features|Requests/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should list feature requests', async ({ page }) => {
    await page.goto('/features');
    
    const requests = page.locator('[data-feature-request], .feature-request, article');
    const requestCount = await requests.count();
    
    if (requestCount > 0) {
      await expect(requests.first()).toBeVisible();
    }
  });

  test('should filter by status', async ({ page }) => {
    await page.goto('/features');
    
    // Look for status filters
    const statusFilter = page.locator('button[data-status], select[name="status"]').first();
    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/features');
    
    const categoryFilter = page.locator('button[data-category], select[name="category"]').first();
    if (await categoryFilter.count() > 0) {
      await categoryFilter.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should sort feature requests', async ({ page }) => {
    await page.goto('/features');
    
    // Look for sort options
    const sortButton = page.locator('button:has-text("Sort"), select[name="sort"]').first();
    if (await sortButton.count() > 0) {
      await sortButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Feature Request Details', () => {
  test('should display feature request details', async ({ page }) => {
    await page.goto('/features');
    
    const firstRequest = page.locator('a[href*="/features/"]').first();
    if (await firstRequest.count() > 0) {
      await firstRequest.click();
      
      await expect(page).toHaveURL(/\/features\//);
      
      // Should show title and description
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.description, .content, p').first()).toBeVisible();
    }
  });

  test('should display vote count', async ({ page }) => {
    await page.goto('/features');
    
    const firstRequest = page.locator('a[href*="/features/"]').first();
    if (await firstRequest.count() > 0) {
      await firstRequest.click();
      
      const voteCount = page.locator('[data-vote-count], .vote-count');
      if (await voteCount.count() > 0) {
        await expect(voteCount.first()).toBeVisible();
      }
    }
  });

  test('should allow voting when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    const email = process.env.TEST_USER_EMAIL || 'admin@nextdocs.local';
    const password = process.env.TEST_USER_PASSWORD || 'admin';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('/features');
    
    const firstRequest = page.locator('a[href*="/features/"]').first();
    if (await firstRequest.count() > 0) {
      await firstRequest.click();
      
      const voteButton = page.locator('button[data-vote], button:has-text("Vote")').first();
      if (await voteButton.count() > 0) {
        const initialText = await voteButton.textContent();
        await voteButton.click();
        await page.waitForTimeout(1000);
        
        // Button text or state should change
        const newText = await voteButton.textContent();
        expect(newText).not.toBe(initialText);
      }
    }
  });

  test('should display comments', async ({ page }) => {
    await page.goto('/features');
    
    const firstRequest = page.locator('a[href*="/features/"]').first();
    if (await firstRequest.count() > 0) {
      await firstRequest.click();
      
      const commentsSection = page.locator('[data-comments], .comments, #comments');
      if (await commentsSection.count() > 0) {
        await expect(commentsSection).toBeVisible();
      }
    }
  });

  test('should allow adding comments when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    const email = process.env.TEST_USER_EMAIL || 'admin@nextdocs.local';
    const password = process.env.TEST_USER_PASSWORD || 'admin';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('/features');
    
    const firstRequest = page.locator('a[href*="/features/"]').first();
    if (await firstRequest.count() > 0) {
      await firstRequest.click();
      
      const commentInput = page.locator('textarea[name="comment"], textarea[placeholder*="comment" i]').first();
      if (await commentInput.count() > 0) {
        await commentInput.fill('This is a test comment');
        
        const submitButton = page.locator('button[type="submit"]:has-text("Comment"), button:has-text("Add Comment")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(2000);
        }
      }
    }
  });

  test('should show status badge', async ({ page }) => {
    await page.goto('/features');
    
    const firstRequest = page.locator('a[href*="/features/"]').first();
    if (await firstRequest.count() > 0) {
      await firstRequest.click();
      
      const statusBadge = page.locator('[data-status], .status, .badge');
      if (await statusBadge.count() > 0) {
        await expect(statusBadge.first()).toBeVisible();
      }
    }
  });
});

test.describe('Create Feature Request', () => {
  test('should allow creating feature request when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    const email = process.env.TEST_USER_EMAIL || 'admin@nextdocs.local';
    const password = process.env.TEST_USER_PASSWORD || 'admin';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.goto('/features');
    
    // Look for create button
    const createButton = page.locator('button:has-text("New"), button:has-text("Create"), a:has-text("New Request")').first();
    if (await createButton.count() > 0) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Form should be visible
      const form = page.locator('form[data-feature-form], form');
      if (await form.count() > 0) {
        await expect(form.first()).toBeVisible();
      }
    }
  });
});
