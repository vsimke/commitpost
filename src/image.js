import sharp from 'sharp';
import { readdirSync, readFileSync } from 'fs';
import { join, extname } from 'path';

// LinkedIn optimal cover image size
const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 627;

/**
 * Pick a random source file from the project
 * @param {string} projectPath - Root directory of the project
 * @returns {Object} { filename, content }
 */
export function pickRandomSourceFile(projectPath) {
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
      content: content.split('\n').slice(0, 10).join('\n'), // First 10 lines
    };
  } catch (error) {
    return null;
  }
}

/**
 * Generate SVG background with code-like aesthetic
 * @param {string} headline - Headline text
 * @param {string} author - Author name
 * @returns {string} SVG markup
 */
function createBackgroundSvg(headline, author) {
  // Create an SVG with gradient background and text overlay
  const escapeXml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const headlineText = escapeXml(headline);
  const authorText = escapeXml(author);

  return `
    <svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background with gradient -->
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1e293b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f4c75;stop-opacity:1" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>
      
      <!-- Base gradient -->
      <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="url(#bg)" />
      
      <!-- Accent line -->
      <rect x="0" y="0" width="8" height="${IMAGE_HEIGHT}" fill="#10b981" />
      
      <!-- Code-like decoration -->
      <text x="60" y="80" font-family="Monaco, monospace" font-size="14" fill="#10b98166">
        &lt; /&gt; gitpost
      </text>
      
      <!-- Main headline -->
      <text x="60" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700" fill="#ffffff" text-anchor="start">
        <tspan x="60">${headlineText}</tspan>
      </text>
      
      <!-- Author info -->
      <text x="60" y="520" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#cbd5e1">
        by ${authorText}
      </text>
      
      <!-- Subtle decoration circles -->
      <circle cx="${IMAGE_WIDTH - 100}" cy="100" r="40" fill="#10b981" opacity="0.1" />
      <circle cx="${IMAGE_WIDTH - 150}" cy="500" r="60" fill="#3b82f6" opacity="0.1" />
    </svg>
  `;
}

/**
 * Generate a cover image for the LinkedIn post
 * @param {Object} options
 * @param {string} options.headline - Post headline
 * @param {string} options.author - Author name
 * @param {string} options.outputPath - Where to save the image
 * @param {string} options.projectPath - Project root (for picking source file)
 * @returns {Promise<string>} Path to the generated image
 */
export async function generateCoverImage({
  headline = 'What I shipped this week',
  author = 'Developer',
  outputPath = './gitpost-cover.png',
  projectPath = process.cwd(),
} = {}) {
  try {
    // Create the SVG background
    const svgString = createBackgroundSvg(headline, author);

    // Convert SVG to PNG using sharp
    const buffer = await sharp(Buffer.from(svgString), {
      density: 150, // Higher density for better quality
    })
      .png()
      .toBuffer();

    // Save the image
    await sharp(buffer)
      .resize(IMAGE_WIDTH, IMAGE_HEIGHT, {
        fit: 'contain',
        background: { r: 15, g: 23, b: 42, alpha: 1 },
      })
      .png()
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    throw new Error(`Failed to generate cover image: ${error.message}`);
  }
}

/**
 * Format headline for image (limit length for readability)
 * @param {string} headline - Raw headline
 * @returns {string} Formatted headline
 */
export function formatHeadlineForImage(headline) {
  // Limit to ~50 chars, break into multiple lines
  if (headline.length > 50) {
    return headline.substring(0, 47) + '...';
  }
  return headline;
}
