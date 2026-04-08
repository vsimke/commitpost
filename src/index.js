#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getCommits, getDiffStats, formatCommitSummary } from './git.js';

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

      // Get diff stats if requested
      if (options.includeImage) {
        const stats = await getDiffStats({
          author: options.author,
          days: parseInt(options.since, 10),
        });
        if (stats) {
          console.log('📈 Changes:\n', stats);
        }
      }

      console.log('✅ Ready for Phase 3 — AI post generation');
      // TODO: Implement AI post generation
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Set up tone profile from writing sample')
  .action(async () => {
    console.log('📝 Setting up tone profile...');
    // TODO: Implement tone profile setup
  });

program
  .command('config')
  .description('Manage GitPost configuration')
  .option('--view', 'View current config', false)
  .action((options) => {
    if (options.view) {
      console.log('📋 Current configuration:');
      // TODO: Show config
    }
  });

program.parse();
