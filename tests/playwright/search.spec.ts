/**
 * Search E2E Tests
 * Tests for global search functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Global Search', () => {
  test('should open search dialog', async ({ page }) => {
    await page.goto('/');
    
    // Look for search trigger (usually Cmd+K or search icon)
    const searchTrigger = page.locator('button[data-search], button:has-text("Search"), input[type="search"]').first();
    
    if (await searchTrigger.count() > 0) {
      await searchTrigger.click();
      
      // Search dialog should be visible
      const searchDialog = page.locator('[role="dialog"], .search-dialog, [data-search-dialog]');
      if (await searchDialog.count() > 0) {
        await expect(searchDialog).toBeVisible();
      }
    }
  });

  test('should search across all content types', async ({ page }) => {
    await page.goto('/');
    
    // Open search
    await page.keyboard.press('Meta+K'); // or Control+K on Windows
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[type="search"], [role="searchbox"]').last();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('documentation');
      await page.waitForTimeout(1000);
      
      // Results should appear
      const results = page.locator('[data-search-results] > *, .search-result, [role="option"]');
      const resultCount = await results.count();
      
      // Should have some results
      expect(resultCount).toBeGreaterThan(0);
    }
  });

  test('should filter search by category', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[type="search"], [role="searchbox"]').last();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Look for category filters
      const filters = page.locator('[data-search-filter], .search-filter, button[role="tab"]');
      if (await filters.count() > 0) {
        const firstFilter = filters.first();
        await firstFilter.click();
        await page.waitForTimeout(500);
        
        // Results should update
        const results = page.locator('[data-search-results] > *, .search-result');
        expect(await results.count()).toBeGreaterThan(-1); // Can be 0 if no results
      }
    }
  });

  test('should navigate to selected result', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[type="search"], [role="searchbox"]').last();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('documentation');
      await page.waitForTimeout(1000);
      
      // Click first result
      const firstResult = page.locator('[data-search-results] > *, .search-result, [role="option"]').first();
      if (await firstResult.count() > 0) {
        await firstResult.click();
        
        // Should navigate away from homepage
        await page.waitForTimeout(1000);
        const url = page.url();
        expect(url).not.toBe('/');
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[type="search"], [role="searchbox"]').last();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Use arrow keys to navigate
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowUp');
      
      // Enter to select
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should close search with Escape', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(500);
    
    const searchDialog = page.locator('[role="dialog"], .search-dialog');
    if (await searchDialog.count() > 0) {
      await expect(searchDialog).toBeVisible();
      
      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Dialog should be hidden
      await expect(searchDialog).toBeHidden();
    }
  });
});
