import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, extname } from 'path';
import { getImageStyle } from './image-styles.js';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import hljs from 'highlight.js';
import sharp from 'sharp';

// LinkedIn optimal cover image size
const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 627;

/**
 * Find a meaningful start line in code — class/function definition rather than imports/header
 */
function findMeaningfulStartLine(lines, ext) {
  const patterns = {
    '.php': /^(class|interface|trait|abstract\s+class)\s/,
    '.js':  /^(export\s+)?(async\s+)?function\s+\w|^(export\s+)?(default\s+)?class\s+\w/,
    '.ts':  /^(export\s+)?(async\s+)?function\s+\w|^(export\s+)?(default\s+)?(abstract\s+)?class\s+\w|^(export\s+)?interface\s+\w/,
    '.jsx': /^(export\s+)?(async\s+)?function\s+\w|^(export\s+)?(default\s+)?class\s+\w/,
    '.tsx': /^(export\s+)?(async\s+)?function\s+\w|^(export\s+)?(default\s+)?(abstract\s+)?class\s+\w|^(export\s+)?interface\s+\w/,
    '.py':  /^(class|def)\s/,
    '.java':/^(public|private|protected)?\s*(class|interface|enum|record)\s/,
    '.cs':  /^(public|private|protected|internal)?\s*(class|interface|struct|enum|record)\s/,
    '.rb':  /^(class|def|module)\s/,
    '.go':  /^func\s/,
    '.rs':  /^(pub\s+)?(fn|struct|impl|enum|trait)\s/,
  };

  const pattern = patterns[ext];
  if (!pattern) return 0;

  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      return Math.max(0, i - 1);
    }
  }

  return 0;
}

/**
 * Extract code from files changed in commit
 * Gets the list of changed file paths from git diff, then reads code from those files
 * @param {Array} commits - Commit objects with hash property
 * @returns {string} Code snippet from changed files
 */
function extractCodeFromChangedFiles(commits) {
  try {
    if (!commits || commits.length === 0) {
      return '';
    }

    // Get the most recent commit
    const latestCommit = commits[0];
    
    // Get list of changed files in this commit
    const filesChanged = execSync(
      `git diff-tree --no-commit-id --name-only -r ${latestCommit.hash} 2>/dev/null || echo ""`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim().split('\n').filter(f => f.length > 0);

    if (filesChanged.length === 0) {
      return '';
    }

    // Filter for code files and exclude test/spec files
    const codeFiles = filesChanged.filter(f => {
      // Must be a code file
      const isCodeFile = /\.(js|ts|jsx|tsx|py|java|rb|go|rs|c|cpp|h|cs|php)$/.test(f);
      
      // Exclude test/spec files (test.js, spec.ts, .test.js, .spec.ts, tests/, __tests__/, etc)
      const isTestFile = /(test|spec|__tests__|\.test\.|\.spec\.)/.test(f);
      
      return isCodeFile && !isTestFile;
    });

    // If no non-test files, try test files as fallback
    const filesToUse = codeFiles.length > 0 ? codeFiles : filesChanged.filter(f =>
      /\.(js|ts|jsx|tsx|py|java|rb|go|rs|c|cpp|h|cs|php)$/.test(f)
    );

    if (filesToUse.length === 0) {
      return '';
    }

    // Pick a random code file
    const randomFile = filesToUse[Math.floor(Math.random() * filesToUse.length)];
    
    // Read the file content
    const content = execSync(
      `git show ${latestCommit.hash}:${randomFile} 2>/dev/null || echo ""`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    if (content && content.length > 0) {
      const lines = content.split('\n');
      const start = findMeaningfulStartLine(lines, extname(randomFile));
      return lines.slice(start, start + 20).join('\n');
    }

    return '';
  } catch (error) {
    return '';
  }
}

/**
 * Pick a random source file from the project
 * @param {string} projectPath - Root directory of the project
 * @returns {Object} { filename, content }
 */
export function pickRandomSourceFile(projectPath) {
  const CODE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.php', '.py', '.rb', '.java', '.go', '.rs', '.cs', '.vue', '.swift', '.kt'];
  const SEARCH_DIRS = ['src', 'app', 'lib', 'core', 'modules', 'components', 'controllers', 'models', 'services'];
  const EXCLUDE_DIRS = /node_modules|vendor|\.git|dist|build|storage|cache|__pycache__|\.pytest_cache/;

  const allFiles = [];

  for (const dir of SEARCH_DIRS) {
    try {
      const dirPath = join(projectPath, dir);
      const walk = (d) => {
        for (const entry of readdirSync(d, { withFileTypes: true })) {
          const full = join(d, entry.name);
          if (entry.isDirectory() && !EXCLUDE_DIRS.test(full)) {
            walk(full);
          } else if (entry.isFile() && CODE_EXTENSIONS.includes(extname(entry.name))) {
            allFiles.push(full);
          }
        }
      };
      walk(dirPath);
    } catch {
      // dir doesn't exist, skip
    }
  }

  if (allFiles.length === 0) return null;

  const randomFile = allFiles[Math.floor(Math.random() * allFiles.length)];

  try {
    const content = readFileSync(randomFile, 'utf8');
    const lines = content.split('\n');
    const start = findMeaningfulStartLine(lines, extname(randomFile));
    return {
      filename: randomFile.split('/').pop(),
      content: lines.slice(start, start + 30).join('\n'),
    };
  } catch {
    return null;
  }
}

/**
 * Parse highlight.js HTML output into colored token spans for satori
 */
function parseHighlightedTokens(html) {
  const tokens = [];
  // Split on <span class="hljs-..."> and </span>
  const parts = html.split(/(<span class="[^"]+">|<\/span>)/);
  let currentColor = null;
  const colorMap = {
    'hljs-keyword': '#c792ea',
    'hljs-built_in': '#82aaff',
    'hljs-string': '#c3e88d',
    'hljs-number': '#f78c6c',
    'hljs-comment': '#546e7a',
    'hljs-function': '#82aaff',
    'hljs-title': '#82aaff',
    'hljs-params': '#d6deeb',
    'hljs-attr': '#ffcb6b',
    'hljs-variable': '#f07178',
    'hljs-operator': '#89ddff',
    'hljs-punctuation': '#89ddff',
    'hljs-property': '#ffcb6b',
  };
  const stack = [];
  for (const part of parts) {
    if (!part) continue;
    const openMatch = part.match(/^<span class="([^"]+)">$/);
    if (openMatch) {
      const cls = openMatch[1].split(' ')[0];
      stack.push(colorMap[cls] || null);
      currentColor = colorMap[cls] || currentColor;
    } else if (part === '</span>') {
      stack.pop();
      currentColor = stack.length > 0 ? stack[stack.length - 1] : null;
    } else {
      // decode HTML entities
      const text = part.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
      if (text) tokens.push({ text, color: currentColor });
    }
  }
  return tokens;
}

/**
 * Inject a Gaussian blur filter into a raw SVG string
 */
function addBlurToSvg(svgStr, sigma) {
  const svgOpenEnd = svgStr.indexOf('>') + 1;
  const before = svgStr.substring(0, svgOpenEnd);
  const content = svgStr.substring(svgOpenEnd, svgStr.lastIndexOf('</svg>'));
  return `${before}<defs><filter id="cf"><feGaussianBlur stdDeviation="${sigma}"/></filter></defs><g filter="url(#cf)">${content}</g></svg>`;
}

/**
 * Build satori tree for code layer only (no background)
 */
function buildCodeTree(codeLineNodes) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: 1200,
        height: 627,
        position: 'relative',
      },
      children: [{
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            inset: 0,
            paddingTop: 24,
            paddingLeft: 40,
            paddingRight: 40,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'monospace',
            fontSize: 16,
            lineHeight: 1.5,
            opacity: 0.95,
          },
          children: codeLineNodes,
        },
      }],
    },
  };
}

/**
 * Build satori tree for background layer only (gradient + accent bar)
 */
function buildBgTree(s) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: 1200,
        height: 627,
        background: `linear-gradient(135deg, ${s.bgColor1} 0%, ${s.bgColor2} 100%)`,
        position: 'relative',
      },
      children: [
        { type: 'div', props: { style: { position: 'absolute', left: 0, top: 0, width: 6, height: 627, background: s.accentColor } } },
      ],
    },
  };
}

/**
 * Build satori tree for UI layer — full-image overlay + centered headline + author + badge
 */
function buildUiTree(headline, author, s) {
  const isDark = s.textColor === '#f1f5f9' || s.textColor?.startsWith('#f');
  const overlayBg = isDark ? 'rgba(15,23,42,0.88)' : 'rgba(248,250,252,0.82)';

  return {
    type: 'div',
    props: {
      // The whole div IS the overlay — flex centering works naturally in satori
      style: {
        display: 'flex',
        width: 1200,
        height: 627,
        flexDirection: 'column',
        justifyContent: 'center',
        background: overlayBg,
        paddingLeft: 60,
        paddingRight: 60,
        position: 'relative',
      },
      children: [
        // Left accent bar
        {
          type: 'div',
          props: { style: { position: 'absolute', left: 0, top: 0, width: 6, height: 627, background: s.accentColor } },
        },
        // Headline — centered by parent flex
        {
          type: 'div',
          props: {
            style: {
              fontSize: 58, fontWeight: 800,
              color: s.textColor, lineHeight: 1.2,
              letterSpacing: '-1px',
              display: 'flex', flexWrap: 'wrap',
            },
            children: headline,
          },
        },
        // Author — absolute bottom left
        {
          type: 'div',
          props: {
            style: { position: 'absolute', left: 60, bottom: 40, fontSize: 18, color: s.textColor, opacity: 0.75 },
            children: `— ${author}`,
          },
        },
        // Badge — absolute top right
        {
          type: 'div',
          props: {
            style: { position: 'absolute', right: 40, top: 24, fontFamily: 'monospace', fontSize: 12, color: s.accentColor, opacity: 0.7 },
            children: 'by commitpost',
          },
        },
      ],
    },
  };
}

function buildCoverTree(headline, author, codeSnippet, style) {
  const s = {
    bgColor1: '#f8fafc',
    bgColor2: '#e2e8f0',
    overlayColor: '#ffffff',
    overlayOpacity: 0.82,
    textColor: '#0f172a',
    accentColor: '#1e40af',
    codeBg: '#0d1117',
    ...style,
  };

  // Syntax-highlight the code with highlight.js
  const codeLines = codeSnippet.split('\n').slice(0, 28);
  const highlighted = hljs.highlightAuto(codeLines.join('\n')).value;
  const tokens = parseHighlightedTokens(highlighted);

  // Split tokens back per line so we can render line by line
  const lineTokens = [[]];
  for (const token of tokens) {
    const parts = token.text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lineTokens.push([]);
      if (part) lineTokens[lineTokens.length - 1].push({ text: part, color: token.color });
    });
  }

  const codeLineNodes = lineTokens.map((line, i) => ({
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'row', height: 20, overflow: 'hidden' },
      children: line.length === 0
        ? [{ type: 'span', props: { style: { color: 'transparent' }, children: ' ' } }]
        : line.map(tok => ({
            type: 'span',
            props: {
              style: { color: tok.color || '#adbac7', whiteSpace: 'pre' },
              children: tok.text,
            },
          })),
    },
  }));

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: 1200,
        height: 627,
        background: `linear-gradient(135deg, ${s.bgColor1} 0%, ${s.bgColor2} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Left accent bar
        { type: 'div', props: { style: { position: 'absolute', left: 0, top: 0, width: 6, height: 627, background: s.accentColor } } },

        // Code block — full height, dark background
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: 0,
              paddingTop: 24,
              paddingLeft: 40,
              paddingRight: 40,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'monospace',
              fontSize: 16,
              lineHeight: 1.5,
              opacity: 0.95,
            },
            children: codeLineNodes,
          },
        },

        // Frosted overlay behind headline only (skip if opacity=0)
        ...(s.overlayOpacity > 0 ? [{
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 0,
              right: 0,
              top: 150,
              height: 260,
              background: s.overlayColor && s.overlayColor !== 'none' ? s.overlayColor : '#ffffff',
              opacity: s.overlayOpacity,
            },
          },
        }] : []),

        // Headline
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 60,
              right: 60,
              top: 165,
              fontSize: 56,
              fontWeight: 800,
              color: s.textColor,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              display: 'flex',
              flexWrap: 'wrap',
            },
            children: headline,
          },
        },

        // Author
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 60,
              bottom: 40,
              fontSize: 18,
              color: s.textColor,
              opacity: 0.85,
            },
            children: `— ${author}`,
          },
        },

        // Badge
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 40,
              top: 24,
              fontFamily: 'monospace',
              fontSize: 12,
              color: s.accentColor,
              opacity: 0.6,
            },
            children: 'by commitpost',
          },
        },
      ],
    },
  };
}

/**
 * Generate a cover image for the LinkedIn post
 * @param {Object} options
 * @param {string} options.headline - Post headline
 * @param {string} options.author - Author name
 * @param {string} options.outputPath - Where to save the image
 * @param {string} options.projectPath - Project root
 * @param {string} options.style - Image style name or config object
 * @param {Array} options.commits - (Optional) Commit objects to extract code from
 * @returns {Promise<string>} Path to the generated image
 */
export async function generateCoverImage({
  headline = 'What I shipped this week',
  author = 'Developer',
  outputPath = './commitpost-cover.png',
  projectPath = process.cwd(),
  style = 'light_code',
  commits = [],
} = {}) {
  // Get style config
  let styleConfig = {};
  if (typeof style === 'string') {
    const styleObj = getImageStyle(style);
    if (styleObj) styleConfig = styleObj.config;
  } else if (typeof style === 'object') {
    styleConfig = style;
  }

  // Get code snippet
  let codeSnippet = '';
  if (commits && commits.length > 0) {
    codeSnippet = extractCodeFromChangedFiles(commits);
  }
  if (!codeSnippet) {
    const sourceFile = pickRandomSourceFile(projectPath);
    if (sourceFile) codeSnippet = sourceFile.content;
  }

  const s = {
    bgColor1: '#f8fafc', bgColor2: '#e2e8f0',
    overlayColor: '#ffffff', overlayOpacity: 0.82,
    textColor: '#0f172a', accentColor: '#1e40af',
    codeBlur: 20,
    ...styleConfig,
  };

  // Load font
  const interFontPath = new URL('../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff', import.meta.url);
  let fontData;
  try {
    fontData = readFileSync(interFontPath);
  } catch {
    fontData = readFileSync('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf');
  }
  const fonts = [
    { name: 'sans-serif', data: fontData, weight: 800, style: 'normal' },
    { name: 'monospace', data: fontData, weight: 400, style: 'normal' },
  ];

  // Build highlighted code line nodes
  const codeLines = codeSnippet.split('\n').slice(0, 28);
  const highlighted = hljs.highlightAuto(codeLines.join('\n')).value;
  const tokens = parseHighlightedTokens(highlighted);
  const lineTokens = [[]];
  for (const token of tokens) {
    const parts = token.text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lineTokens.push([]);
      if (part) lineTokens[lineTokens.length - 1].push({ text: part, color: token.color });
    });
  }
  const codeLineNodes = lineTokens.map((line) => ({
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'row', height: 20, overflow: 'hidden' },
      children: line.length === 0
        ? [{ type: 'span', props: { style: { color: 'transparent' }, children: ' ' } }]
        : line.map(tok => ({ type: 'span', props: { style: { color: tok.color || '#adbac7', whiteSpace: 'pre' }, children: tok.text } })),
    },
  }));

  // Build satori tree for background + code combined (solid, no transparency)
  function buildBgCodeTree(codeLineNodes) {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: 1200,
          height: 627,
          background: `linear-gradient(135deg, ${s.bgColor1} 0%, ${s.bgColor2} 100%)`,
          position: 'relative',
        },
        children: [
          { type: 'div', props: { style: { position: 'absolute', left: 0, top: 0, width: 6, height: 627, background: s.accentColor } } },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                inset: 0,
                paddingTop: 24,
                paddingLeft: 40,
                paddingRight: 40,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'monospace',
                fontSize: 16,
                lineHeight: 1.5,
                opacity: 0.9,
              },
              children: codeLineNodes,
            },
          },
        ],
      },
    };
  }

  // Pass 1: render bg+code as solid image → blur with sharp
  const bgCodeSvg = await satori(buildBgCodeTree(codeLineNodes), { width: 1200, height: 627, fonts });
  const bgCodeRendered = new Resvg(bgCodeSvg).render().asPng();
  const bgCodePng = s.codeBlur > 0
    ? await sharp(bgCodeRendered).blur(s.codeBlur).png().toBuffer()
    : bgCodeRendered;

  // Pass 2: UI layer (overlay + headline + author, transparent bg)
  const uiSvg = await satori(buildUiTree(headline, author, s), { width: 1200, height: 627, fonts });
  const uiPng = new Resvg(uiSvg).render().asPng();

  // Composite: blurred(bg+code) → UI on top
  await sharp(bgCodePng)
    .composite([{ input: uiPng, blend: 'over' }])
    .png()
    .toFile(outputPath);

  return outputPath;
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
