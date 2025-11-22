/**
 * Playwright Global Setup
 * Handles authentication and test data preparation
 */

import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

async function promptForCredentials(): Promise<{ email: string; password: string }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Test user email (press Enter for admin@nextdocs.local): ', (email) => {
      const userEmail = email.trim() || 'admin@nextdocs.local';
      
      rl.question('Test user password (press Enter for admin): ', (password) => {
        const userPassword = password.trim() || 'admin';
        rl.close();
        
        console.log(''); // Empty line for better formatting
        resolve({ email: userEmail, password: userPassword });
      });
    });
  });
}

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const storageState = path.join(__dirname, '..', '.auth', 'user.json');

  // Ensure .auth directory exists
  const authDir = path.dirname(storageState);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Prompt for credentials (unless in CI environment)
  let email: string;
  let password: string;

  if (process.env.CI) {
    // In CI, use environment variables
    email = process.env.TEST_USER_EMAIL || 'admin@nextdocs.local';
    password = process.env.TEST_USER_PASSWORD || 'admin';
    console.log(`CI mode: Using credentials from environment variables`);
  } else {
    // Interactive mode: prompt for credentials
    console.log('\n=== NextDocs E2E Test Authentication ===');
    console.log('Please provide test user credentials\n');
    const credentials = await promptForCredentials();
    email = credentials.email;
    password = credentials.password;
  }

  console.log(`Setting up authentication for ${email}...`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Fill in credentials
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill(email);
      await passwordInput.fill(password);

      // Submit the form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Wait for navigation after login
      await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

      console.log('✓ Authentication successful');

      // Save signed-in state
      await context.storageState({ path: storageState });
      console.log(`✓ Saved authentication state to ${storageState}`);
    } else {
      console.warn('⚠ Login form not found, tests may need manual authentication');
    }
  } catch (error) {
    console.error('✗ Authentication setup failed:', error);
    console.warn('Tests requiring authentication will likely fail');
  } finally {
    await browser.close();
  }
}

export default globalSetup;
