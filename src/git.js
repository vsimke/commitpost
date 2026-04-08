import { simpleGit } from 'simple-git';
import { execSync } from 'child_process';

/**
 * Get commits from git log filtered by author and date range
 * @param {Object} options
 * @param {string} options.author - Git author name/email pattern to filter
 * @param {number} options.days - Number of days back to look
 * @param {string} options.cwd - Working directory (default: current)
 * @returns {Promise<Array>} Array of commit objects
 */
export async function getCommits({ author = '', days = 7, cwd = process.cwd() }) {
  const git = simpleGit(cwd);

  // Build the git log command
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  const sinceDateStr = sinceDate.toISOString().split('T')[0];

  // Format for git log
  const logFormat = '%H|%an|%ae|%ad|%s|%b';
  const logOptions = [
    `--since=${sinceDateStr}`,
    `--format=${logFormat}`,
    '--abbrev-commit',
  ];

  // Add author filter if provided
  if (author && author.trim()) {
    logOptions.push(`--author=${author}`);
  }

  try {
    const log = await git.log(logOptions);

    // Parse commits from log output
    const commits = log.all.map((commit) => ({
      hash: commit.hash,
      author: commit.author_name,
      email: commit.author_email,
      date: new Date(commit.date),
      message: commit.message,
      body: commit.body || '',
    }));

    return commits;
  } catch (error) {
    throw new Error(`Failed to read git log: ${error.message}`);
  }
}

/**
 * Get diff stats for a commit range
 * @param {Object} options
 * @param {string} options.author - Git author name/email pattern
 * @param {number} options.days - Number of days back
 * @param {string} options.cwd - Working directory
 * @returns {Promise<string>} Diff stats summary
 */
export async function getDiffStats({ author = '', days = 7, cwd = process.cwd() }) {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  const sinceDateStr = sinceDate.toISOString().split('T')[0];

  try {
    let cmd = `git log --since=${sinceDateStr} --diff-stat=.01 --stat`;
    if (author && author.trim()) {
      cmd += ` --author="${author}"`;
    }

    const stats = execSync(cmd, { cwd, encoding: 'utf8' });
    return stats;
  } catch (error) {
    return ''; // Return empty if no diffs found
  }
}

/**
 * Format commits into a readable summary
 * @param {Array} commits - Array of commit objects
 * @returns {string} Formatted summary
 */
export function formatCommitSummary(commits) {
  if (commits.length === 0) {
    return 'No commits found in the specified period.';
  }

  const lines = [
    `📊 Found ${commits.length} commit(s):`,
    '',
    ...commits.map(
      (c) =>
        `• ${c.date.toLocaleDateString()} — "${c.message}" (${c.author})`
    ),
  ];

  return lines.join('\n');
}
