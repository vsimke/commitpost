#!/usr/bin/env node

import { generateCoverImage } from './src/image.js';

async function test() {
  try {
    console.log('🎨 Testing all image styles...\n');

    const styles = ['light_code', 'dark_code', 'minimal', 'dark_minimal'];
    
    for (const style of styles) {
      const imagePath = await generateCoverImage({
        headline: 'Shipping great features this week',
        author: 'Developer Name',
        outputPath: `./test-${style}.png`,
        projectPath: process.cwd(),
        style: style,
      });

      console.log(`✅ ${style}: ${imagePath}`);
    }

    console.log('\n📊 All styles generated successfully!');
    console.log('Files created:');
    console.log('  - test-light_code.png');
    console.log('  - test-dark_code.png');
    console.log('  - test-minimal.png');
    console.log('  - test-dark_minimal.png');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
