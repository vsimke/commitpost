import sharp from 'sharp';
import { readdirSync, readFileSync } from 'fs';
import { join, extname } from 'path';
import { getImageStyle } from './image-styles.js';

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
      content: content.split('\n').slice(0, 8).join('\n'),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Wrap text to fit within width
 * @param {string} text - Text to wrap
 * @param {number} maxCharsPerLine - Characters per line
 * @returns {Array} Array of text chunks
 */
function wrapText(text, maxCharsPerLine = 40) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * Generate SVG cover image with configurable style
 * @param {string} headline - Headline text
 * @param {string} author - Author name
 * @param {string} codeSnippet - Code snippet for background
 * @param {Object} style - Image style config
 * @returns {string} SVG markup
 */
function createCoverSvg(headline, author, codeSnippet = '', style = {}) {
  // Default light style
  const defaultStyle = {
    bgColor1: '#f8fafc',
    bgColor2: '#e2e8f0',
    codeOpacity: 0.25,
    codeBlur: 2,
    overlayColor: '#ffffff',
    overlayOpacity: 0.6,
    textColor: '#0f172a',
    accentColor: '#10b981',
  };

  const colors = { ...defaultStyle, ...style };

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
  const codeLines = codeSnippet.substring(0, 200).split('\n').slice(0, 4);

  // Wrap headline to 2 lines max
  const headlineLines = wrapText(headlineText, 40);

  let codeLinesXml = '';
  codeLines.forEach((line, i) => {
    codeLinesXml += `<tspan x="50" dy="${i === 0 ? '0' : '24'}">${escapeXml(line.substring(0, 100))}</tspan>`;
  });

  const overlayRect = colors.overlayOpacity > 0 
    ? `<rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="${colors.overlayColor}" opacity="${colors.overlayOpacity}" />`
    : '';

  const codeGroup = colors.codeOpacity > 0
    ? `<g filter="url(#codeBlur)" opacity="${colors.codeOpacity}">
        <text x="50" y="90" font-family="Monaco, monospace" font-size="16" font-weight="500" fill="${colors.accentColor}">
          ${codeLinesXml}
        </text>
      </g>`
    : '';

  return `
    <svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bgColor1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.bgColor2};stop-opacity:1" />
        </linearGradient>
        <filter id="codeBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${colors.codeBlur}" />
        </filter>
      </defs>
      
      <!-- Background gradient -->
      <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="url(#bg)" />
      
      <!-- Overlay for readability -->
      ${overlayRect}
      
      <!-- Code background (on top of overlay so it's visible) -->
      ${codeGroup}
      
      <!-- Left accent bar -->
      <rect x="0" y="0" width="6" height="${IMAGE_HEIGHT}" fill="${colors.accentColor}" />
      
      <!-- Headline lines -->
      <text x="60" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" fill="${colors.textColor}">
        ${headlineLines.map((line, i) => `<tspan x="60" dy="${i === 0 ? '0' : '60'}">${line}</tspan>`).join('')}
      </text>
      
      <!-- Author attribution -->
      <text x="60" y="550" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${colors.textColor}" opacity="0.8">
        — ${authorText}
      </text>
      
      <!-- Badge -->
      <text x="${IMAGE_WIDTH - 200}" y="40" font-family="Monaco, monospace" font-size="12" fill="${colors.accentColor}" opacity="0.6">
        by gitpost
      </text>
    </svg>
  `;
}

/**
 * Generate a cover image for the LinkedIn post
 * @param {Object} options
 * @param {string} options.headline - Post headline
 * @param {string} options.author - Author name
 * @param {string} options.outputPath - Where to save the image
 * @param {string} options.projectPath - Project root
 * @param {string} options.style - Image style name or config object
 * @returns {Promise<string>} Path to the generated image
 */
export async function generateCoverImage({
  headline = 'What I shipped this week',
  author = 'Developer',
  outputPath = './gitpost-cover.png',
  projectPath = process.cwd(),
  style = 'light_code',
} = {}) {
  try {
    // Get style config
    let styleConfig = {};
    if (typeof style === 'string') {
      const styleObj = getImageStyle(style);
      if (styleObj) {
        styleConfig = styleObj.config;
      }
    } else if (typeof style === 'object') {
      styleConfig = style;
    }

    // Get code snippet
    let codeSnippet = '';
    const sourceFile = pickRandomSourceFile(projectPath);
    if (sourceFile) {
      codeSnippet = sourceFile.content;
    }

    // Create SVG
    const svgString = createCoverSvg(headline, author, codeSnippet, styleConfig);

    // Convert to PNG
    const buffer = await sharp(Buffer.from(svgString), {
      density: 150,
    })
      .png()
      .toBuffer();

    // Save
    await sharp(buffer)
      .resize(IMAGE_WIDTH, IMAGE_HEIGHT, {
        fit: 'contain',
        background: { r: 248, g: 250, b: 252, alpha: 1 },
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
  // Limit to ~80 chars (can wrap to 2 lines in new layout)
  if (headline.length > 80) {
    return headline.substring(0, 77) + '...';
  }
  return headline;
}
