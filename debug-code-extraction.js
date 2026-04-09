#!/usr/bin/env node

import { execSync } from 'child_process';
import { getCommits } from './src/git.js';

async function debugCodeExtraction() {
  console.log('🔍 Debugging code extraction from changed files\n');

  try {
    // Get recent commits
    const commits = await getCommits({
      author: '',
      days: 7,
    });

    if (commits.length === 0) {
      console.log('❌ No commits found');
      return;
    }

    console.log(`📊 Latest commit:\n`);
    const commit = commits[0];
    console.log(`  Hash: ${commit.hash}`);
    console.log(`  Message: ${commit.message}`);
    console.log(`  Author: ${commit.author}\n`);

    console.log('📝 Changed files in this commit:\n');
    
    // Get list of changed files
    const filesChanged = execSync(
      `git diff-tree --no-commit-id --name-only -r ${commit.hash}`,
      { encoding: 'utf8' }
    ).trim().split('\n');

    filesChanged.forEach(f => console.log(`  - ${f}`));
    console.log('');

    // Filter for code files
    const codeFiles = filesChanged.filter(f => 
      /\.(js|ts|jsx|tsx|py|java|rb|go|rs|c|cpp|h|cs|php)$/.test(f)
    );

    console.log(`💻 Code files that changed: ${codeFiles.length}\n`);
    codeFiles.forEach(f => console.log(`  - ${f}`));
    console.log('');

    if (codeFiles.length > 0) {
      // Show content of first code file
      const firstFile = codeFiles[0];
      console.log(`📄 First file to be used: ${firstFile}\n`);
      
      const content = execSync(
        `git show ${commit.hash}:${firstFile}`,
        { encoding: 'utf8' }
      );

      const lines = content.split('\n').slice(0, 8);
      console.log('Code from that file (first 8 lines):\n');
      console.log('---');
      lines.forEach(line => console.log(line));
      console.log('---\n');
      
      console.log(`✅ ${lines.length} lines of code ready to be used in image`);
    } else {
      console.log('⚠️  No code files found in this commit');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugCodeExtraction();
