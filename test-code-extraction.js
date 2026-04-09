#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { readdirSync } from 'fs';

function pickRandomSourceFile(projectPath) {
  const srcDir = join(projectPath, 'src');
  
  try {
    const files = readdirSync(srcDir)
      .filter(f => ['.js', '.ts', '.jsx', '.tsx'].includes(extname(f)))
      .map(f => join(srcDir, f));
    
    if (files.length === 0) {
      return null;
    }

    const randomFile = files[Math.floor(Math.random() * files.length)];
    const content = readFileSync(randomFile, 'utf8');
    
    return {
      filename: randomFile.split('/').pop(),
      content: content.split('\n').slice(0, 8).join('\n'),
    };
  } catch (error) {
    return null;
  }
}

console.log('🔍 Testing code extraction from src/\n');
const sourceFile = pickRandomSourceFile(process.cwd());

if (sourceFile) {
  console.log(`✅ Found code file: ${sourceFile.filename}`);
  console.log(`\n📝 Extracted code (first 8 lines):\n`);
  console.log('---');
  console.log(sourceFile.content);
  console.log('---');
  console.log(`\n✓ Code length: ${sourceFile.content.length} characters`);
} else {
  console.log('❌ No source files found in src/');
}
