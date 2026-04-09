#!/usr/bin/env node

import { writeFileSync } from 'fs';
import sharp from 'sharp';

// Create a test SVG with visible colored code
const testSvg = `
<svg width="1200" height="627" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Light gray-white background -->
  <rect width="1200" height="627" fill="url(#bg)" />
  
  <!-- Semi-transparent white overlay -->
  <rect width="1200" height="627" fill="#ffffff" opacity="0.15" />
  
  <!-- BLUE CODE TEXT - should be clearly visible -->
  <text x="50" y="90" font-family="Monaco, monospace" font-size="16" font-weight="bold" fill="#1e40af">
    <tspan x="50" dy="0">import sharp from 'sharp';</tspan>
    <tspan x="50" dy="24">import FS from 'fs';</tspan>
    <tspan x="50" dy="24">const WIDTH = 1200;</tspan>
    <tspan x="50" dy="24">const HEIGHT = 627;</tspan>
  </text>
  
  <!-- Dark title -->
  <text x="60" y="240" font-family="system-ui, sans-serif" font-size="48" font-weight="700" fill="#0f172a">
    <tspan x="60" dy="0">Test Code Visibility</tspan>
  </text>
  
  <!-- Accent bar -->
  <rect x="0" y="0" width="6" height="627" fill="#1e40af" />
</svg>
`;

console.log('🧪 Testing SVG to PNG conversion\n');
console.log('Creating test SVG with visible blue code...\n');

// Save SVG for inspection
writeFileSync('./test-svg-debug.svg', testSvg);
console.log('✅ Saved: test-svg-debug.svg');

// Convert to PNG
(async () => {
  try {
    const buffer = await sharp(Buffer.from(testSvg), { density: 150 })
      .png()
      .toBuffer();

    console.log(`✅ SVG converted to PNG (${buffer.length} bytes)`);

    // Save PNG
    await sharp(buffer)
      .resize(1200, 627, {
        fit: 'contain',
        background: { r: 248, g: 250, b: 252, alpha: 1 },
      })
      .png()
      .toFile('./test-svg-debug.png');

    console.log('✅ Saved: test-svg-debug.png\n');

    console.log('📊 Expected in PNG:');
    console.log('   - Light gray background');
    console.log('   - 4 lines of BLUE code visible at top');
    console.log('   - Dark title text');
    console.log('   - Blue accent bar on left\n');

    console.log('📋 SVG features tested:');
    console.log('   ✓ Gradient background');
    console.log('   ✓ Semi-transparent overlay (opacity: 0.15)');
    console.log('   ✓ Blue code text (#1e40af)');
    console.log('   ✓ Multiple tspan elements');
    console.log('   ✓ Font styling (Monaco, bold)');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
