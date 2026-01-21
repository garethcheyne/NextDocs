#!/usr/bin/env node
/**
 * System Upgrade Script
 * Handles local environment setup (VAPID keys, schema checks)
 * 
 * Note: Database migrations are automatically applied by Docker
 * This script only prepares the local environment before Docker starts
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const envPath = path.join(__dirname, '..', '..', '.env');
const schemaPath = path.join(__dirname, '..', '..', 'prisma', 'schema.prisma');

console.log('\n🚀 Starting System Upgrade...\n');

// Step 1: Check and setup VAPID keys
console.log('📋 Step 1: Checking VAPID Keys...');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY') || !envContent.includes('VAPID_PRIVATE_KEY')) {
    console.log('   ⚠️  VAPID keys not found, generating...');
    
    const vapidKeys = webpush.generateVAPIDKeys();
    const vapidConfig = `\n# PWA Push Notifications (Auto-generated)\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\nVAPID_SUBJECT=mailto:admin@harveynorman.com\n`;
    
    fs.appendFileSync(envPath, vapidConfig);
    console.log('   ✅ VAPID keys generated and added to .env');
  } else {
    console.log('   ✅ VAPID keys already configured');
  }
} else {
  console.log('   ⚠️  .env file not found, skipping VAPID setup');
}

// Step 2: Check and update Prisma schema
console.log('\n📋 Step 2: Checking Database Schema...');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  if (!schemaContent.includes('pushSubscription')) {
    console.log('   ⚠️  pushSubscription field missing, adding...');
    
    // Find the User model and add pushSubscription field
    const updatedSchema = schemaContent.replace(
      /(model User \{[\s\S]*?)(  \/\/ Email Notification Preferences)/,
      '$1  pushSubscription Json?  // Web push subscription data\n\n$2'
    );
    
    fs.writeFileSync(schemaPath, updatedSchema);
    console.log('   ✅ Added pushSubscription field to User model');
  } else {
    console.log('   ✅ pushSubscription field already exists');
  }
} else {
  console.log('   ❌ schema.prisma not found');
  process.exit(1);
}

// Step 3: Database migrations (Skipped - handled by Docker)
console.log('\n📋 Step 3: Database Migrations...');
console.log('   ℹ️  Migrations are automatically applied by Docker on startup');
console.log('   ℹ️  Docker runs: npx prisma db push --accept-data-loss');
console.log('   ✅ No action needed');

// Step 4: Prisma Client generation (Skipped - handled by Docker)
console.log('\n📋 Step 4: Prisma Client Generation...');
console.log('   ℹ️  Prisma client is generated during Docker build');
console.log('   ✅ No action needed');

// Step 5: Update Service Worker (if needed)
console.log('\n📋 Step 5: Checking Service Worker...');
const swPath = path.join(__dirname, '..', '..', 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  if (!swContent.includes('addEventListener(\'push\'')) {
    console.log('   ⚠️  Push handlers missing in service worker');
    console.log('   📝 Add push notification handlers to public/sw.js');
    console.log('   See: docs/setup/PWA-PUSH-STATUS.md for code');
  } else {
    console.log('   ✅ Service worker has push handlers');
  }
} else {
  console.log('   ⚠️  Service worker not found');
}

console.log('\n✅ System Upgrade Complete!\n');
console.log('Next steps:');
console.log('  1. Review changes in .env and prisma/schema.prisma');
console.log('  2. Add push handlers to public/sw.js (if needed)');
console.log('  3. Docker will automatically apply migrations on startup');
console.log('  4. Run: npm run update (rebuilds and restarts containers)');
console.log('  5. Test PWA installation and push notifications\n');
