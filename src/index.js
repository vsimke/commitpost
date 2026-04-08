#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getCommits, getDiffStats, formatCommitSummary } from './git.js';
import { generatePost, generateHeadline } from './ai.js';
import { loadConfig, saveConfig, updateConfig, displayConfig, hasToneProfile } from './config.js';
import { generateCoverImage, formatHeadlineForImage } from './image.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const program = new Command();

program
  .name('gitpost')
  .description('Generate LinkedIn posts from your git history')
  .version(packageJson.version);

program
  .command('generate')
  .description('Generate a LinkedIn post from recent git commits')
  .option('--author <name>', 'Git author name to filter commits', process.env.GIT_AUTHOR_NAME || '')
  .option('--since <days>', 'Number of days back to look at commits', '7')
  .option('--include-image', 'Generate a cover image', false)
  .action(async (options) => {
    try {
      console.log('🚀 Generating LinkedIn post...\n');
      
      // Get commits
      const commits = await getCommits({
        author: options.author,
        days: parseInt(options.since, 10),
      });

      // Display commit summary
      console.log(formatCommitSummary(commits));
      console.log('');

      if (commits.length === 0) {
        console.log('❌ No commits found. Try adjusting --author or --since options.');
        process.exit(1);
      }

      // Generate post
      console.log('✨ Generating post with AI...\n');
      const post = await generatePost(commits);
      
      console.log('📝 Generated Post:\n');
      console.log('---');
      console.log(post);
      console.log('---\n');

      // Generate image if requested
      if (options.includeImage) {
        try {
          console.log('🎨 Generating cover image...');
          
          // Try to generate headline, fallback to first commit message if AI fails
          let headline = commits[0]?.message || 'What I shipped this week';
          try {
            const aiHeadline = await generateHeadline(commits);
            headline = aiHeadline;
          } catch (headlineError) {
            console.log('  (Using commit message as headline)\n');
          }
          
          const formattedHeadline = formatHeadlineForImage(headline);
          
          // Get author name from commits or use default
          const author = commits[0]?.author || 'Developer';
          
          // Generate image
          const imagePath = await generateCoverImage({
            headline: formattedHeadline,
            author: author,
            outputPath: './gitpost-cover.png',
            projectPath: process.cwd(),
          });

          console.log(`✅ Cover image saved: ${imagePath}\n`);
        } catch (imageError) {
          console.warn(`⚠️  Could not generate image: ${imageError.message}\n`);
        }
      }

      console.log('✅ Post ready! Copy the text above to LinkedIn.');
      // TODO: Save to file or clipboard
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Set up tone profile from writing sample')
  .action(async () => {
    try {
      console.log('📝 Setting up GitPost...\n');
      
      // Check for API key
      const existingApiKey = process.env.ANTHROPIC_API_KEY;
      if (!existingApiKey) {
        console.log('⚠️  No ANTHROPIC_API_KEY environment variable found.');
        console.log('Set it with: export ANTHROPIC_API_KEY=sk-ant-...\n');
      } else {
        console.log('✅ ANTHROPIC_API_KEY is set\n');
      }

      // For now, show instructions for manual setup
      console.log('To set up your tone profile:');
      console.log('1. Write or paste a sample of your writing (a previous LinkedIn post, blog post, etc.)');
      console.log('2. Save it to a file');
      console.log('3. Run: gitpost setup <file-path>\n');
      
      // TODO: Implement interactive tone profile capture
      console.log('📋 Current config:');
      console.log(displayConfig());
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Manage GitPost configuration')
  .option('--view', 'View current config', false)
  .option('--set-tone <file>', 'Set tone profile from a file')
  .option('--set-key <key>', 'Set Anthropic API key')
  .action((options) => {
    try {
      if (options.setTone) {
        // Set tone profile from file
        const content = readFileSync(options.setTone, 'utf8');
        updateConfig('toneProfile', content);
        console.log('✅ Tone profile updated from', options.setTone);
        console.log('');
      }

      if (options.setKey) {
        // Set API key
        updateConfig('apiKey', options.setKey);
        console.log('✅ API key saved to config');
        console.log('');
      }

      // Always show config at the end
      console.log(displayConfig());
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
