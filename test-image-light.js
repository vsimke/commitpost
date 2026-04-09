#!/usr/bin/env node

import { generateCoverImage } from './src/image.js';

async function test() {
  try {
    console.log('🎨 Testing light_code image style...\n');

    const imagePath = await generateCoverImage({
      headline: 'What I shipped this week: New features and improvements',
      author: 'Sarah Chen',
      outputPath: './test-light-code.png',
      projectPath: process.cwd(),
      style: 'light_code',
    });

    console.log(`✅ Image generated: ${imagePath}`);
    console.log('   Style: light_code (Light Code Background)');
    console.log('   Dimensions: 1200x627');
    console.log('   Check the file at:', imagePath);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
