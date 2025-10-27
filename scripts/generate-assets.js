const fs = require('fs');
const path = require('path');

// SVG template for app icon (1024x1024)
const iconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#grad1)" rx="180"/>
  
  <!-- N3WS Text -->
  <text x="512" y="580" font-family="Arial, sans-serif" font-size="220" font-weight="900" 
        fill="white" text-anchor="middle" letter-spacing="-5">N3WS</text>
  
  <!-- Decorative elements (3 dots representing 3 words) -->
  <circle cx="312" cy="720" r="25" fill="white" opacity="0.8"/>
  <circle cx="512" cy="720" r="25" fill="white" opacity="0.8"/>
  <circle cx="712" cy="720" r="25" fill="white" opacity="0.8"/>
</svg>`;

// SVG template for adaptive icon (foreground, 432x432)
const adaptiveIconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <!-- N3WS Text -->
  <text x="216" y="250" font-family="Arial, sans-serif" font-size="95" font-weight="900" 
        fill="white" text-anchor="middle" letter-spacing="-2">N3WS</text>
  
  <!-- Decorative elements -->
  <circle cx="131" cy="305" r="11" fill="white" opacity="0.8"/>
  <circle cx="216" cy="305" r="11" fill="white" opacity="0.8"/>
  <circle cx="301" cy="305" r="11" fill="white" opacity="0.8"/>
</svg>`;

// SVG template for splash screen (1284x2778 - iPhone 14 Pro Max)
const splashSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1284" height="2778" fill="url(#grad2)"/>
  
  <!-- N3WS Text -->
  <text x="642" y="1450" font-family="Arial, sans-serif" font-size="180" font-weight="900" 
        fill="#3b82f6" text-anchor="middle" letter-spacing="-3">N3WS</text>
  
  <!-- Subtitle -->
  <text x="642" y="1550" font-family="Arial, sans-serif" font-size="40" font-weight="400"
        fill="#94a3b8" text-anchor="middle">3-word news</text>
  
  <!-- Decorative elements -->
  <circle cx="492" cy="1620" r="15" fill="#3b82f6" opacity="0.6"/>
  <circle cx="642" cy="1620" r="15" fill="#3b82f6" opacity="0.6"/>
  <circle cx="792" cy="1620" r="15" fill="#3b82f6" opacity="0.6"/>
</svg>`;

// SVG template for favicon (48x48)
const faviconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="48" height="48" fill="url(#grad3)" rx="8"/>
  
  <!-- N3 Text (simplified for small size) -->
  <text x="24" y="32" font-family="Arial, sans-serif" font-size="18" font-weight="900" 
        fill="white" text-anchor="middle">N3</text>
</svg>`;

// Function to convert SVG to PNG using a simple approach
// Note: This requires installing sharp: npm install sharp
async function generateAssets() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  
  // Ensure assets directory exists
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  try {
    const sharp = require('sharp');
    
    // Generate icon.png (1024x1024)
    await sharp(Buffer.from(iconSVG))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✓ Generated icon.png');

    // Generate adaptive-icon.png (432x432)
    await sharp(Buffer.from(adaptiveIconSVG))
      .resize(432, 432)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✓ Generated adaptive-icon.png');

    // Generate splash-icon.png (1284x2778)
    await sharp(Buffer.from(splashSVG))
      .resize(1284, 2778)
      .png()
      .toFile(path.join(assetsDir, 'splash-icon.png'));
    console.log('✓ Generated splash-icon.png');

    // Generate favicon.png (48x48)
    await sharp(Buffer.from(faviconSVG))
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✓ Generated favicon.png');

    console.log('\n✅ All assets generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n❌ Error: sharp module not found.');
      console.log('\nPlease install sharp by running:');
      console.log('  npm install --save-dev sharp\n');
      console.log('Then run this script again:');
      console.log('  node scripts/generate-assets.js\n');
    } else {
      console.error('Error generating assets:', error);
    }
    process.exit(1);
  }
}

generateAssets();

