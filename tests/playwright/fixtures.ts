/**
 * Playwright Test Fixtures
 * Custom fixtures for authenticated and unauthenticated tests
 */

import { test as base } from '@playwright/test';

// Extend base test with custom fixtures
export const test = base.extend({
  // No custom fixtures yet, but can add later
});

// Unauthenticated test (ignores global auth state)
export const unauthenticatedTest = base.extend({
  storageState: { cookies: [], origins: [] },
});

export { expect } from '@playwright/test';
