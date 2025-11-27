// Simple PWA Icon Generator using Canvas (Node.js)
// Run: node frontend/scripts/generate-pwa-icons.js

const fs = require('fs');
const path = require('path');

// Create SVG icons that can be used directly
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '../public');

function generateSVGIcon(size, isMaskable = false) {
  const padding = isMaskable ? size * 0.1 : 0;
  const iconSize = size - (padding * 2);
  const iconX = padding;
  const iconY = padding;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#20C997;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  
  <!-- Lightning bolt icon -->
  <g transform="translate(${iconX + iconSize * 0.2}, ${iconY + iconSize * 0.15})">
    <path d="M ${iconSize * 0.35} 0 L ${iconSize * 0.15} ${iconSize * 0.45} L ${iconSize * 0.3} ${iconSize * 0.45} L 0 ${iconSize * 0.85} L ${iconSize * 0.25} ${iconSize * 0.55} L ${iconSize * 0.1} ${iconSize * 0.55} Z" 
          fill="white" 
          stroke="white" 
          stroke-width="${iconSize * 0.02}" 
          stroke-linejoin="round"/>
  </g>
</svg>`;
}

// Generate all icon sizes
console.log('Generating PWA icons...\n');

sizes.forEach(size => {
  const svg = generateSVGIcon(size, false);
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  
  // Save as SVG (browsers can use SVG as PNG fallback)
  fs.writeFileSync(path.join(publicDir, svgFilename), svg);
  console.log(`✓ Created ${svgFilename}`);
});

// Generate maskable icons
[192, 512].forEach(size => {
  const svg = generateSVGIcon(size, true);
  const svgFilename = `icon-maskable-${size}x${size}.svg`;
  
  fs.writeFileSync(path.join(publicDir, svgFilename), svg);
  console.log(`✓ Created ${svgFilename} (maskable)`);
});

// Generate favicon
const faviconSVG = generateSVGIcon(32, false);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
console.log(`✓ Created favicon.svg`);

// Create a simple favicon.ico placeholder
const faviconICO = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#20C997;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#grad)"/>
  <path d="M 17 6 L 11 16 L 14 16 L 9 26 L 18 17 L 15 17 Z" fill="white"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconICO);
console.log(`✓ Created favicon.ico\n`);

console.log('✅ All icons generated successfully!');
console.log('\nNote: SVG files are being used. For production, convert to PNG using:');
console.log('- Online tool: https://svgtopng.com');
console.log('- Or install sharp: npm install sharp');
console.log('- Or use the HTML generator: open frontend/scripts/generate-icons.html\n');
