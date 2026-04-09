#!/usr/bin/env node

import { generateCoverImage } from './src/image.js';
import { getCommits } from './src/git.js';

async function test() {
  console.log('🎨 Testing image generation with git diff code\n');

  try {
    // Get recent commits
    const commits = await getCommits({
      author: '',
      days: 7,
    });

    if (commits.length === 0) {
      console.log('❌ No commits found in last 7 days');
      process.exit(1);
    }

    console.log(`📊 Found ${commits.length} commits\n`);
    console.log('Latest commit:');
    console.log(`  Hash: ${commits[0].hash}`);
    console.log(`  Message: ${commits[0].message}`);
    console.log(`  Author: ${commits[0].author}`);
    console.log(`  Date: ${commits[0].date}\n`);

    console.log('🖼️  Generating image with code from git diff...\n');

    const imagePath = await generateCoverImage({
      headline: 'Building better things this week',
      author: commits[0].author,
      outputPath: './test-git-diff.png',
      projectPath: process.cwd(),
      style: 'light_code',
      commits: commits,
    });

    console.log(`✅ Image saved: ${imagePath}`);
    console.log('\n📝 This image should contain:');
    console.log('   - Actual code from the git diff of the latest commit');
    console.log('   - Light gray background');
    console.log('   - Blue code text in top-left');
    console.log('   - Dark headline and author name');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
