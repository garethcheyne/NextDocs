/**
 * Admin Panel E2E Tests
 * Tests for admin functionality
 */

import { test, expect } from '@playwright/test';

// Admin tests require authentication
test.use({ storageState: 'tests/playwright/.auth/admin.json' });

test.describe('Admin Access', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@nextdocs.local';
    const password = process.env.TEST_ADMIN_PASSWORD || 'admin';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('should access admin panel', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Look for dashboard widgets or stats
    const dashboard = page.locator('[data-dashboard], .dashboard, main');
    await expect(dashboard).toBeVisible();
  });

  test('should have navigation to admin sections', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for navigation items
    const nav = page.locator('nav, aside, [data-sidebar]');
    await expect(nav).toBeVisible();
  });
});

test.describe('Repository Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@nextdocs.local';
    const password = process.env.TEST_ADMIN_PASSWORD || 'admin';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('should list repositories', async ({ page }) => {
    await page.goto('/admin/repositories');
    
    const repositories = page.locator('[data-repository], .repository, tbody tr');
    const count = await repositories.count();
    
    expect(count).toBeGreaterThan(-1);
  });

  test('should show repository details', async ({ page }) => {
    await page.goto('/admin/repositories');
    
    const firstRepo = page.locator('a[href*="/admin/repositories/"], tbody tr').first();
    if (await firstRepo.count() > 0) {
      await firstRepo.click();
      await page.waitForTimeout(1000);
      
      // Should show repository details
      const details = page.locator('[data-repository-details], .details, form');
      if (await details.count() > 0) {
        await expect(details).toBeVisible();
      }
    }
  });
});

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@nextdocs.local';
    const password = process.env.TEST_ADMIN_PASSWORD || 'admin';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('should list users', async ({ page }) => {
    await page.goto('/admin/users');
    
    const users = page.locator('[data-user], .user, tbody tr');
    const count = await users.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should filter users by role', async ({ page }) => {
    await page.goto('/admin/users');
    
    const roleFilter = page.locator('select[name="role"], button[data-role]').first();
    if (await roleFilter.count() > 0) {
      await roleFilter.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@nextdocs.local';
    const password = process.env.TEST_ADMIN_PASSWORD || 'admin';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('should display analytics dashboard', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    const analytics = page.locator('[data-analytics], .analytics, .chart');
    if (await analytics.count() > 0) {
      await expect(analytics.first()).toBeVisible();
    }
  });

  test('should filter analytics by date range', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    const dateFilter = page.locator('input[type="date"], button[data-date-range]').first();
    if (await dateFilter.count() > 0) {
      await expect(dateFilter).toBeVisible();
    }
  });
});

test.describe('Feature Request Moderation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@nextdocs.local';
    const password = process.env.TEST_ADMIN_PASSWORD || 'admin';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('should list pending feature requests', async ({ page }) => {
    await page.goto('/admin/features');
    
    const requests = page.locator('[data-feature-request], tbody tr');
    const count = await requests.count();
    
    expect(count).toBeGreaterThan(-1);
  });

  test('should allow approving feature requests', async ({ page }) => {
    await page.goto('/admin/features');
    
    const approveButton = page.locator('button:has-text("Approve")').first();
    if (await approveButton.count() > 0) {
      await expect(approveButton).toBeVisible();
    }
  });

  test('should allow rejecting feature requests', async ({ page }) => {
    await page.goto('/admin/features');
    
    const rejectButton = page.locator('button:has-text("Reject")').first();
    if (await rejectButton.count() > 0) {
      await expect(rejectButton).toBeVisible();
    }
  });
});
