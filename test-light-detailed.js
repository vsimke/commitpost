#!/usr/bin/env node

import { generateCoverImage } from './src/image.js';

async function test() {
  console.log('🎨 Detailed test of light_code style with code visibility\n');

  try {
    const imagePath = await generateCoverImage({
      headline: 'Added new features and improved code quality this week',
      author: 'Test Developer',
      outputPath: './test-light-detailed.png',
      projectPath: process.cwd(),
      style: 'light_code',
    });

    console.log(`✅ Image generated: ${imagePath}`);
    console.log('\n📊 Image specifications:');
    console.log('   Size: 1200×627 px (LinkedIn optimal)');
    console.log('   Style: light_code');
    console.log('   Format: PNG');
    console.log('   Code visibility: Should see 4 lines of code');
    console.log('   Text: Dark text on light background');
    console.log('   Overlay: 20% white (minimal) to preserve code visibility');
    console.log('\n📝 Expected to see in image:');
    console.log('   - Light gray-white gradient background');
    console.log('   - 4 lines of JavaScript code visible in top-left');
    console.log('   - Green accent bar on the left');
    console.log('   - Dark headline text (up to 2 lines)');
    console.log('   - Author name and "by gitpost" badge');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
