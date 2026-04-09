#!/usr/bin/env node

import { generateCoverImage } from './src/image.js';
import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

async function testImageGeneration() {
  const projectPath = process.argv[2] || process.cwd();
  
  console.log(`🖼️  Testing image generation (no API calls needed)\n`);
  console.log(`Project path: ${projectPath}\n`);

  // Step 1: Extract code from the project
  console.log('📂 Step 1: Extracting code from src/...\n');
  
  const srcDir = join(projectPath, 'src');
  let codeSnippet = '';
  let sourceFileName = '';

  try {
    const files = readdirSync(srcDir)
      .filter(f => ['.js', '.ts', '.jsx', '.tsx'].includes(extname(f)))
      .map(f => join(srcDir, f));
    
    if (files.length > 0) {
      const randomFile = files[Math.floor(Math.random() * files.length)];
      sourceFileName = randomFile.split('/').pop();
      const content = readFileSync(randomFile, 'utf8');
      codeSnippet = content.split('\n').slice(0, 8).join('\n');
      
      console.log(`✅ Found: ${sourceFileName}`);
      console.log(`   Size: ${content.length} characters`);
      console.log(`   Extracted: ${codeSnippet.split('\n').length} lines\n`);
      
      console.log('📝 Code to be rendered in image:\n');
      console.log('---');
      console.log(codeSnippet);
      console.log('---\n');
    } else {
      console.log('⚠️  No source files found in src/ directory');
      console.log('   Code layer will be empty\n');
    }
  } catch (error) {
    console.log(`⚠️  Could not read src/: ${error.message}\n`);
  }

  // Step 2: Generate images with different styles
  console.log('🎨 Step 2: Generating images with all styles...\n');

  const styles = ['light_code', 'dark_code', 'minimal', 'dark_minimal'];
  const results = [];

  for (const style of styles) {
    try {
      const imagePath = await generateCoverImage({
        headline: 'Improved code visibility in cover images',
        author: 'Developer',
        outputPath: `./test-no-api-${style}.png`,
        projectPath: projectPath,
        style: style,
      });

      results.push({ style, imagePath, success: true });
      console.log(`✅ ${style.padEnd(15)} → ${imagePath}`);
    } catch (error) {
      results.push({ style, error: error.message, success: false });
      console.log(`❌ ${style.padEnd(15)} → Error: ${error.message}`);
    }
  }

  // Step 3: Summary
  console.log('\n📊 Summary:\n');
  console.log(`Images created: ${results.filter(r => r.success).length}/${results.length}`);
  
  if (sourceFileName) {
    console.log(`Code extracted from: ${sourceFileName}`);
  } else {
    console.log(`Code extracted from: (none found - generic code used)`);
  }
  
  console.log('\n📋 To view images on Linux:');
  console.log('   open test-no-api-*.png');
  console.log('   # or');
  console.log('   display test-no-api-light_code.png  (if ImageMagick installed)');
}

testImageGeneration().catch(console.error);
