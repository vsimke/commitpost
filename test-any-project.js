#!/usr/bin/env node

/**
 * Test image generation from ANY project
 * No API key required - tests image generation only
 * 
 * Usage:
 *   node test-image-no-api.js                  (current directory)
 *   node test-image-no-api.js /path/to/project (custom project)
 */

import { generateCoverImage } from './src/image.js';
import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

async function main() {
  const projectPath = process.argv[2] || process.cwd();
  
  console.log('\n🖼️  GitPost Image Generation Test\n');
  console.log(`📁 Project: ${projectPath}\n`);

  // Extract code
  const srcDir = join(projectPath, 'src');
  let codeInfo = 'No code found';
  
  try {
    const files = readdirSync(srcDir)
      .filter(f => ['.js', '.ts', '.jsx', '.tsx'].includes(extname(f)))
      .map(f => join(srcDir, f));
    
    if (files.length > 0) {
      const randomFile = files[Math.floor(Math.random() * files.length)];
      const fileName = randomFile.split('/').pop();
      const content = readFileSync(randomFile, 'utf8');
      codeInfo = `${fileName} (${content.length} chars)`;
    }
  } catch (e) {
    // Silently skip
  }

  console.log(`💻 Source code: ${codeInfo}\n`);

  // Generate images
  console.log('🎨 Generating images...\n');

  const styles = [
    { name: 'light_code', headline: 'Powerful new features shipping today' },
    { name: 'dark_code', headline: 'Shipped: Performance improvements' },
    { name: 'minimal', headline: 'What I learned this week' },
    { name: 'dark_minimal', headline: 'Building with intention' },
  ];

  let successCount = 0;
  const images = [];

  for (const {name, headline} of styles) {
    try {
      const outputPath = `./test-${name}.png`;
      await generateCoverImage({
        headline: headline,
        author: 'Test Developer',
        outputPath: outputPath,
        projectPath: projectPath,
        style: name,
      });
      
      console.log(`  ✅ ${name.padEnd(15)} → ${outputPath}`);
      images.push(outputPath);
      successCount++;
    } catch (error) {
      console.log(`  ❌ ${name.padEnd(15)} → Error: ${error.message}`);
    }
  }

  console.log(`\n✅ Generated ${successCount}/4 images\n`);

  console.log('📋 Next steps:\n');
  console.log('1. Open the PNG files:');
  images.forEach(img => {
    console.log(`   open ${img}         # macOS`);
    console.log(`   xdg-open ${img}     # Linux`);
  });
  console.log('\n2. Check if code is visible in the top-left corner\n');
  console.log('3. If code is NOT visible:');
  console.log('   - light_code: Should see real code in BLUE, on light background');
  console.log('   - dark_code: Should see subtle code in light blue, on dark background');
  console.log('   - minimal: No code (by design)');
  console.log('   - dark_minimal: No code (by design)\n');
  
  console.log('💡 Troubleshooting:\n');
  console.log('   If code is still not visible:');
  console.log('   - The src/ folder might be empty');
  console.log('   - Font rendering on your system might have issues');
  console.log('   - Try: node debug-svg.js (shows what should be in the SVG)\n');
}

main().catch(console.error);
