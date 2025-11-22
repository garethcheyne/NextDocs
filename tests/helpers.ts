/**
 * Test Helpers and Utilities
 * Shared functions for both CLI and E2E tests
 */

import { PrismaClient } from '@prisma/client';
import { Page } from '@playwright/test';

/**
 * Database helpers
 */
export class DatabaseHelper {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect() {
    await this.prisma.$connect();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  async clearTestData() {
    // Clear test data in the correct order to respect foreign keys
    await this.prisma.featureComment.deleteMany({});
    await this.prisma.featureVote.deleteMany({});
    await this.prisma.featureRequest.deleteMany({});
    await this.prisma.blogPost.deleteMany({});
    await this.prisma.aPISpec.deleteMany({});
  }

  async createTestUser(email: string, password: string, role: 'ADMIN' | 'USER' | 'VIEWER' = 'USER') {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        name: `Test User ${email}`,
      }
    });
  }

  async createTestRepository(name: string, description: string) {
    return this.prisma.repository.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        source: 'github',
        organization: 'test-org',
        repositoryId: 'test-repo',
        branch: 'main',
        createdBy: 'test',
      }
    });
  }
}

/**
 * Authentication helpers for E2E tests
 */
export class AuthHelper {
  static async login(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  }

  static async logout(page: Page) {
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
    }
  }

  static async isAuthenticated(page: Page): Promise<boolean> {
    const url = page.url();
    return !url.includes('/login');
  }
}

/**
 * Navigation helpers for E2E tests
 */
export class NavigationHelper {
  static async openSearch(page: Page) {
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(500);
  }

  static async toggleTheme(page: Page) {
    const themeToggle = page.locator('button[aria-label*="theme" i]').first();
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
  }

  static async waitForPageLoad(page: Page) {
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Form helpers for E2E tests
 */
export class FormHelper {
  static async fillForm(page: Page, formData: Record<string, string>) {
    for (const [name, value] of Object.entries(formData)) {
      const input = page.locator(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`);
      if (await input.count() > 0) {
        await input.fill(value);
      }
    }
  }

  static async submitForm(page: Page, formSelector?: string) {
    const submitButton = formSelector 
      ? page.locator(`${formSelector} button[type="submit"]`)
      : page.locator('button[type="submit"]').first();
    
    await submitButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Wait helpers
 */
export class WaitHelper {
  static async waitForElement(page: Page, selector: string, timeout = 5000) {
    await page.waitForSelector(selector, { timeout });
  }

  static async waitForNavigation(page: Page, urlPattern: RegExp) {
    await page.waitForURL(urlPattern, { timeout: 5000 });
  }
}

/**
 * Search helpers
 */
export class SearchHelper {
  static async searchGlobal(page: Page, query: string) {
    await NavigationHelper.openSearch(page);
    const searchInput = page.locator('input[type="search"]').last();
    await searchInput.fill(query);
    await page.waitForTimeout(1000);
  }

  static async getSearchResults(page: Page) {
    const results = page.locator('[data-search-results] > *, .search-result, [role="option"]');
    return results.count();
  }
}

/**
 * Screenshot helpers
 */
export class ScreenshotHelper {
  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  static async takeElementScreenshot(page: Page, selector: string, name: string) {
    const element = page.locator(selector);
    await element.screenshot({ path: `test-results/screenshots/${name}.png` });
  }
}

/**
 * Test data generators
 */
export class TestDataGenerator {
  static generateEmail() {
    return `test-${Date.now()}@example.com`;
  }

  static generatePassword() {
    return `Test@${Math.random().toString(36).slice(-8)}`;
  }

  static generateTitle() {
    return `Test Title ${Date.now()}`;
  }

  static generateContent() {
    return `This is test content generated at ${new Date().toISOString()}`;
  }

  static generateSlug(title: string) {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}

export default {
  DatabaseHelper,
  AuthHelper,
  NavigationHelper,
  FormHelper,
  WaitHelper,
  SearchHelper,
  ScreenshotHelper,
  TestDataGenerator,
};
