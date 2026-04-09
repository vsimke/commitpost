#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🧪 Testing CLI with image generation\n');

try {
  // This will fail at AI step (no API key), but that's OK
  // We just want to see if the code extraction from git works
  const output = execSync(
    'gitpost generate --author "Test User" --since 7 --include-image --image-style light_code 2>&1',
    { encoding: 'utf8', stdio: 'pipe' }
  );
  
  console.log(output);
  console.log('\n✅ Image generation completed!');
} catch (error) {
  const output = error.stdout || error.toString();
  
  // Check if image was created despite API error
  try {
    execSync('ls -lh gitpost-cover.png', { encoding: 'utf8' });
    console.log(output);
    console.log('\n✅ Image generated even though AI failed (expected)');
  } catch (e) {
    console.log(output);
  }
}
