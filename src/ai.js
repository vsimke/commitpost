import Anthropic from '@anthropic-ai/sdk';
import { getConfigValue } from './config.js';

/**
 * Generate a LinkedIn post from commits
 * @param {Array} commits - Array of commit objects
 * @param {Object} options - Options
 * @param {string} options.apiKey - Anthropic API key (optional, falls back to env var)
 * @returns {Promise<string>} Generated post text
 */
export async function generatePost(commits, options = {}) {
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY || getConfigValue('apiKey', '');

  if (!apiKey) {
  }

  const client = new Anthropic({ apiKey });

  // Get tone profile and model from config, but allow override from options
  const toneProfile = options.toneProfile || getConfigValue('toneProfile', '');
  const model = getConfigValue('model', 'claude-3-sonnet-20240229');
  const postLength = options.postLength || getConfigValue('postLength', 'medium');

  const lengthInstructions = {
    short:  'Write a short post under 100 words — punchy, one idea, no "see more" cut-off. Works as a quick update or announcement.',
    medium: 'Write a medium post of 200–280 words — enough to need a "see more" click, but tight and scannable. This is the LinkedIn sweet spot for developer posts.',
    long:   'Write a long post of 400–500 words — a mini-story or technical deep-dive with a clear arc: problem → what you built → what you learned → takeaway.',
  };

  // Format commits into a readable list
  const commitList = commits
    .map(
      (c) =>
        `- ${c.date.toLocaleDateString()}: "${c.message}"${c.body ? `\n  ${c.body}` : ''}`
    )
    .join('\n');

  // Build the system prompt
  let systemPrompt = `You are an expert at writing engaging LinkedIn posts for developers. 
Your posts are authentic, conversational, and highlight real work and learning.
${lengthInstructions[postLength] || lengthInstructions.medium}
Use casual language and include 1-2 relevant emojis.
Focus on the value and learning from the work, not just listing technical details.`;

  if (toneProfile) {
    systemPrompt += `\n\nWrite in this tone and style based on this writing sample:\n\n${toneProfile}`;
  }

  // Build the user prompt
  const userPrompt = `Here are my recent git commits from the last week:

${commitList}

Write a compelling LinkedIn post about what I've accomplished and learned. 
The post should feel genuine and highlight the interesting aspects of the work.
Do not include hashtags or @ mentions unless absolutely necessary.`;

  try {
    const message = await client.messages.create({
      model: model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract the text content
    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from API');
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Invalid API key. Check ANTHROPIC_API_KEY or run `commitpost setup`');
    }
    throw new Error(`Failed to generate post: ${error.message}`);
  }
}

/**
 * Generate a short headline from commits (for image overlay)
 * @param {Array} commits - Array of commit objects
 * @param {Object} options - Options
 * @returns {Promise<string>} Generated headline
 */
export async function generateHeadline(commits, options = {}) {
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY || getConfigValue('apiKey', '');

  if (!apiKey) {
    throw new Error('No API key found');
  }

  const client = new Anthropic({ apiKey });

  const model = getConfigValue('model', 'claude-3-sonnet-20240229');

  const commitList = commits
    .map((c) => c.message)
    .join('; ');

  const userPrompt = `Generate a short, catchy headline (5-7 words max) for a LinkedIn post about this week's work:
${commitList}

Return ONLY the headline text, nothing else.`;

  try {
    const message = await client.messages.create({
      model: model,
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    throw new Error(`Failed to generate headline: ${error.message}`);
  }
}
