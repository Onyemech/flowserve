const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

// Generate regular icons with FS text
sizes.forEach(size => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#23d980;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#135c51;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad${size})"/>
  
  <!-- FS text centered -->
  <g transform="translate(${size/2}, ${size/2})">
    <text x="0" y="0" 
          font-family="Inter, Arial, sans-serif" 
          font-size="${size * 0.4}" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle" 
          dominant-baseline="central">FS</text>
  </g>
</svg>`;

  fs.writeFileSync(path.join(publicDir, `icon-${size}x${size}.svg`), svg);
  console.log(`✓ Generated icon-${size}x${size}.svg`);
});

// Generate maskable icons with safe area padding
[192, 512].forEach(size => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradMask${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#23d980;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#135c51;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background with safe area padding -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#gradMask${size})"/>
  
  <!-- FS text centered with safe area -->
  <g transform="translate(${size/2}, ${size/2})">
    <text x="0" y="0" 
          font-family="Inter, Arial, sans-serif" 
          font-size="${size * 0.35}" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle" 
          dominant-baseline="central">FS</text>
  </g>
</svg>`;

  fs.writeFileSync(path.join(publicDir, `icon-maskable-${size}x${size}.svg`), svg);
  console.log(`✓ Generated icon-maskable-${size}x${size}.svg`);
});

console.log('\n✅ All PWA icons generated successfully with FS branding!');
