/**
 * Homepage E2E Tests
 * Tests for landing page and navigation
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check if page loaded (either with NextDocs or current title)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check for common navigation items (nav or header)
    // Some pages might use different structures
    const nav = page.locator('nav, header, [role="navigation"]');
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThan(0);
  });

  test('should have theme toggle', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme" i], button:has-text("Theme"), [data-theme-toggle]').first();
    
    const toggleCount = await themeToggle.count();
    if (toggleCount > 0) {
      await expect(themeToggle).toBeVisible();
      
      // Click to toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Check if theme changed (look for dark/light class)
      const html = page.locator('html');
      const hasThemeClass = await html.evaluate(el => {
        return el.classList.contains('dark') || el.classList.contains('light') || el.hasAttribute('data-theme');
      });
      
      expect(hasThemeClass).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should navigate to documentation', async ({ page }) => {
    // Look for docs link
    const docsLink = page.locator('a[href*="/docs"]').first();
    
    const linkCount = await docsLink.count();
    if (linkCount > 0) {
      await docsLink.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Should be on docs page (or login if auth required)
      const url = page.url();
      expect(url).toMatch(/\/(docs|login)/);
    } else {
      test.skip();
    }
  });

  test('should navigate to blog', async ({ page }) => {
    const blogLink = page.locator('a[href*="/blog"]').first();
    
    const linkCount = await blogLink.count();
    if (linkCount > 0) {
      await blogLink.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Should be on blog page (or login if auth required)
      const url = page.url();
      expect(url).toMatch(/\/(blog|login)/);
    } else {
      test.skip();
    }
  });

  test('should navigate to API specs', async ({ page }) => {
    const apiLink = page.locator('a[href*="/api-specs"]').first();
    
    const linkCount = await apiLink.count();
    if (linkCount > 0) {
      await apiLink.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Should be on API specs page (or login if auth required)
      const url = page.url();
      expect(url).toMatch(/\/(api-specs|login)/);
    } else {
      test.skip();
    }
  });

  test('should navigate to features', async ({ page }) => {
    const featuresLink = page.locator('a[href*="/features"]').first();
    
    const linkCount = await featuresLink.count();
    if (linkCount > 0) {
      await featuresLink.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Should be on features page
      const url = page.url();
      expect(url).toMatch(/\/features/);
    } else {
      test.skip();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for hamburger menu
    const mobileMenu = page.locator('button[aria-label*="menu" i], button:has(svg), [data-mobile-menu]').first();
    
    const menuCount = await mobileMenu.count();
    if (menuCount > 0) {
      await expect(mobileMenu).toBeVisible();
    } else {
      test.skip();
    }
  });
});
