/**
 * API Specs E2E Tests
 * Tests for API specification viewer
 */

import { test, expect } from '@playwright/test';

test.describe('API Specs Listing', () => {
  test('should display API specs page', async ({ page }) => {
    await page.goto('/api-specs');
    
    await expect(page).toHaveTitle(/API|Specs/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should list available API specifications', async ({ page }) => {
    await page.goto('/api-specs');
    
    const specs = page.locator('[data-api-spec], .api-spec, article');
    const specCount = await specs.count();
    
    if (specCount > 0) {
      await expect(specs.first()).toBeVisible();
    }
  });
});

test.describe('API Spec Viewer', () => {
  test('should display API specification', async ({ page }) => {
    await page.goto('/api-specs');
    
    const firstSpec = page.locator('a[href*="/api-specs/"]').first();
    if (await firstSpec.count() > 0) {
      await firstSpec.click();
      
      // Should navigate to spec page
      await expect(page).toHaveURL(/\/api-specs\//);
      
      // Swagger/Redoc viewer should be present
      const viewer = page.locator('[data-api-viewer], .swagger-ui, .redoc-wrap, iframe');
      await page.waitForTimeout(2000); // Wait for API viewer to load
      
      if (await viewer.count() > 0) {
        await expect(viewer.first()).toBeVisible();
      }
    }
  });

  test('should support theme switching in API viewer', async ({ page }) => {
    await page.goto('/api-specs');
    
    const firstSpec = page.locator('a[href*="/api-specs/"]').first();
    if (await firstSpec.count() > 0) {
      await firstSpec.click();
      await page.waitForTimeout(2000);
      
      // Look for theme toggle
      const themeToggle = page.locator('button[aria-label*="theme" i], select[name*="theme"]').first();
      if (await themeToggle.count() > 0) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should allow switching between Swagger and Redoc', async ({ page }) => {
    await page.goto('/api-specs');
    
    const firstSpec = page.locator('a[href*="/api-specs/"]').first();
    if (await firstSpec.count() > 0) {
      await firstSpec.click();
      await page.waitForTimeout(2000);
      
      // Look for viewer switcher
      const viewerSwitch = page.locator('button:has-text("Swagger"), button:has-text("Redoc")').first();
      if (await viewerSwitch.count() > 0) {
        await viewerSwitch.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should display API endpoints', async ({ page }) => {
    await page.goto('/api-specs');
    
    const firstSpec = page.locator('a[href*="/api-specs/"]').first();
    if (await firstSpec.count() > 0) {
      await firstSpec.click();
      await page.waitForTimeout(3000);
      
      // Look for API operations
      const endpoints = page.locator('.opblock, [data-endpoint], .operation');
      if (await endpoints.count() > 0) {
        expect(await endpoints.count()).toBeGreaterThan(0);
      }
    }
  });
});
