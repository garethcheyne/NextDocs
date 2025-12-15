const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'hnc_cat_logo_blk.png');
const appDir = path.join(__dirname, '..', 'src', 'app');

async function generateFavicons() {
  try {
    // Generate favicon.ico (32x32)
    await sharp(inputFile)
      .resize(32, 32)
      .toFile(path.join(appDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico (32x32)');

    // Generate icon.png (192x192 for PWA)
    await sharp(inputFile)
      .resize(192, 192)
      .toFile(path.join(appDir, 'icon.png'));
    console.log('✓ Generated icon.png (192x192)');

    // Generate apple-icon.png (180x180)
    await sharp(inputFile)
      .resize(180, 180)
      .toFile(path.join(appDir, 'apple-icon.png'));
    console.log('✓ Generated apple-icon.png (180x180)');

    console.log('\n✅ All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
