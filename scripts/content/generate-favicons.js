const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Input logo from assets folder
const inputFile = path.join(__dirname, '..', '..', 'assets', 'hive-logo.png');
const appDir = path.join(__dirname, '..', '..', 'src', 'app');
const publicDir = path.join(__dirname, '..', '..', 'public');
const publicIconsDir = path.join(publicDir, 'icons');

// Icon sizes to generate
const iconSizes = [
  // PWA manifest icons
  { size: 72, name: 'icon-72x72.png', dest: publicIconsDir },
  { size: 96, name: 'icon-96x96.png', dest: publicIconsDir },
  { size: 128, name: 'icon-128x128.png', dest: publicIconsDir },
  { size: 144, name: 'icon-144x144.png', dest: publicIconsDir },
  { size: 152, name: 'icon-152x152.png', dest: publicIconsDir },
  { size: 192, name: 'icon-192x192.png', dest: publicIconsDir },
  { size: 384, name: 'icon-384x384.png', dest: publicIconsDir },
  { size: 512, name: 'icon-512x512.png', dest: publicIconsDir },
  
  // Apple touch icons
  { size: 180, name: 'apple-icon.png', dest: appDir },
  { size: 120, name: 'apple-icon-120x120.png', dest: publicIconsDir },
  { size: 152, name: 'apple-icon-152x152.png', dest: publicIconsDir },
  { size: 180, name: 'apple-icon-180x180.png', dest: publicIconsDir },
  
  // Favicons
  { size: 16, name: 'favicon-16x16.png', dest: publicIconsDir },
  { size: 32, name: 'favicon-32x32.png', dest: publicIconsDir },
  { size: 32, name: 'favicon.ico', dest: appDir },
  
  // Standard icon for Next.js
  { size: 192, name: 'icon.png', dest: appDir },
  
  // Logo variations
  { size: 256, name: 'logo-256.png', dest: publicIconsDir },
  { size: 512, name: 'logo-512.png', dest: publicIconsDir },
];

async function generateFavicons() {
  try {
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ Input logo not found: ${inputFile}`);
      console.log('Please place your logo at: assets/hive-logo.png');
      process.exit(1);
    }

    // Create directories if they don't exist
    if (!fs.existsSync(publicIconsDir)) {
      fs.mkdirSync(publicIconsDir, { recursive: true });
      console.log('✓ Created public/icons directory');
    }

    console.log(`\n🎨 Generating icons from: ${path.basename(inputFile)}\n`);

    // Generate all icon sizes
    for (const { size, name, dest } of iconSizes) {
      const outputPath = path.join(dest, name);
      
      // Apple icons need padding (80% content, 20% padding)
      const isAppleIcon = name.includes('apple-icon');
      
      if (isAppleIcon) {
        const contentSize = Math.floor(size * 0.8);
        const padding = Math.floor((size - contentSize) / 2);
        
        await sharp(inputFile)
          .resize(contentSize, contentSize, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .toFile(outputPath);
      } else {
        await sharp(inputFile)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .toFile(outputPath);
      }
      
      console.log(`✓ Generated ${name} (${size}x${size})${isAppleIcon ? ' with padding' : ''}`);
    }

    // Generate maskable icon (PWA with padding)
    const maskableSize = 512;
    const contentSize = Math.floor(maskableSize * 0.8);
    const padding = Math.floor((maskableSize - contentSize) / 2);
    const maskablePath = path.join(publicIconsDir, 'icon-512x512-maskable.png');
    await sharp(inputFile)
      .resize(contentSize, contentSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(maskablePath);
    console.log(`✓ Generated icon-512x512-maskable.png (with padding for PWA)`);

    console.log('\n✅ All icons generated successfully!');
    console.log(`\nGenerated files:`);
    console.log(`  - ${appDir}/favicon.ico`);
    console.log(`  - ${appDir}/icon.png`);
    console.log(`  - ${appDir}/apple-icon.png`);
    console.log(`  - ${publicIconsDir}/* (${iconSizes.length} files)`);
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
