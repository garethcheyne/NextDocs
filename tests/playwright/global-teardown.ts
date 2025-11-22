/**
 * Playwright Global Teardown
 * Cleanup after all tests complete
 */

import * as path from 'path';
import * as fs from 'fs';

async function globalTeardown() {
  const storageState = path.join(__dirname, '..', '.auth', 'user.json');

  // Optionally clean up auth state
  if (process.env.CLEANUP_AUTH_STATE !== 'false') {
    if (fs.existsSync(storageState)) {
      fs.unlinkSync(storageState);
      console.log('✓ Cleaned up authentication state');
    }
  }
}

export default globalTeardown;
