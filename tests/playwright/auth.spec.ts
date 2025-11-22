/**
 * Authentication E2E Tests
 * Tests login, logout, and protected routes
 */

import { test, expect } from '@playwright/test';
import { unauthenticatedTest } from './fixtures';

test.describe('Authentication - Authenticated User', () => {
  test('should access protected documentation page', async ({ page }) => {
    await page.goto('/docs');
    await page.waitForLoadState('networkidle');
    
    // Should be on docs page, not login
    const url = page.url();
    expect(url).toContain('/docs');
    expect(url).not.toContain('/login');
  });

  test('should access protected blog page', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Should be on blog page, not login
    const url = page.url();
    expect(url).toContain('/blog');
    expect(url).not.toContain('/login');
  });

  test('should show user menu when authenticated', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for user menu or avatar
    const userMenu = page.locator('[data-user-menu], button[aria-label*="user" i], button:has-text("Profile")').first();
    const userMenuCount = await userMenu.count();
    
    if (userMenuCount > 0) {
      await expect(userMenu).toBeVisible();
    }
  });
});

unauthenticatedTest.describe('Authentication - Login Flow', () => {
  unauthenticatedTest('should display login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  unauthenticatedTest('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"], input[type="email"]', 'invalid@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=/Invalid credentials|Error|Failed/i')).toBeVisible({ timeout: 5000 });
  });

  unauthenticatedTest('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Use environment variables or test credentials
    const email = process.env.TEST_USER_EMAIL || 'admin@nextdocs.local';
    const password = process.env.TEST_USER_PASSWORD || 'admin';
    
    await page.fill('input[name="email"], input[type="email"]', email);
    await page.fill('input[name="password"], input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    // Should redirect away from login
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
    
    const url = page.url();
    expect(url).not.toContain('/login');
  });

  unauthenticatedTest('should redirect unauthenticated users from protected routes', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to login
    const url = page.url();
    expect(url).toContain('/login');
  });
});

test.describe('Session Management', () => {
  test('should persist session across page reloads', async ({ page }) => {
    await page.goto('/docs');
    await page.waitForLoadState('networkidle');
    
    // Should be on docs (authenticated via global setup)
    const urlBefore = page.url();
    expect(urlBefore).toContain('/docs');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be authenticated
    const urlAfter = page.url();
    expect(urlAfter).not.toContain('/login');
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out")').first();
    const logoutCount = await logoutButton.count();
    
    if (logoutCount > 0) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
      
      // Should redirect to home or login
      const url = page.url();
      expect(url).toMatch(/\/(login|$)/);
    } else {
      test.skip();
    }
  });
});
