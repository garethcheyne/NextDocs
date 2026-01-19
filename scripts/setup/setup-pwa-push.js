#!/usr/bin/env node
/**
 * Setup script for PWA Push Notifications
 * Generates VAPID keys and provides setup instructions
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('\n🔧 PWA Push Notification Setup\n');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Generated VAPID Keys:\n');
console.log('Add these to your .env file:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:your-email@example.com\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '..', '.env');
const envLocalPath = path.join(__dirname, '..', '..', '.env.local');

console.log('\n📝 Next Steps:\n');
console.log('1. Copy the VAPID keys above to your .env file');
console.log('2. Update VAPID_SUBJECT with your email');
console.log('3. Run: npm run db:migrate (to add pushSubscription field)');
console.log('4. Restart your development server');
console.log('5. The push notification button will appear in your UI\n');

// Save to a temporary file for easy copying
const tempKeysPath = path.join(__dirname, 'vapid-keys.txt');
fs.writeFileSync(
  tempKeysPath,
  `# Add these to your .env file:\n\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\nVAPID_SUBJECT=mailto:your-email@example.com\n`
);

console.log(`💾 Keys also saved to: ${tempKeysPath}\n`);
