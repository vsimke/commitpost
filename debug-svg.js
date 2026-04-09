#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { readdirSync } from 'fs';

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

function createCoverSvg(headline, author, codeSnippet = '', style = {}) {
  const defaultStyle = {
    bgColor1: '#f8fafc',
    bgColor2: '#e2e8f0',
    codeOpacity: 0.6,
    codeBlur: 0,
    overlayColor: '#ffffff',
    overlayOpacity: 0.15,
    textColor: '#0f172a',
    accentColor: '#1e40af',
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

  const headlineLines = wrapText(headlineText, 40);

  let codeLinesXml = '';
  codeLines.forEach((line, i) => {
    codeLinesXml += `<tspan x="50" dy="${i === 0 ? '0' : '24'}">${escapeXml(line.substring(0, 100))}</tspan>`;
  });

  const overlayRect = colors.overlayOpacity > 0 
    ? `<rect width="1200" height="627" fill="${colors.overlayColor}" opacity="${colors.overlayOpacity}" />`
    : '';

  const codeGroup = colors.codeOpacity > 0
    ? `<g filter="url(#codeBlur)" opacity="${colors.codeOpacity}">
        <text x="50" y="90" font-family="Monaco, monospace" font-size="16" font-weight="500" fill="${colors.accentColor}">
          ${codeLinesXml}
        </text>
      </g>`
    : '';

  return `
    <svg width="1200" height="627" xmlns="http://www.w3.org/2000/svg">
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
      <rect width="1200" height="627" fill="url(#bg)" />
      
      <!-- Overlay for readability -->
      ${overlayRect}
      
      <!-- Code background (on top of overlay so it's visible) -->
      ${codeGroup}
      
      <!-- Left accent bar -->
      <rect x="0" y="0" width="6" height="627" fill="${colors.accentColor}" />
      
      <!-- Headline lines -->
      <text x="60" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" fill="${colors.textColor}">
        ${headlineLines.map((line, i) => `<tspan x="60" dy="${i === 0 ? '0' : '60'}">${line}</tspan>`).join('')}
      </text>
      
      <!-- Author attribution -->
      <text x="60" y="550" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${colors.textColor}" opacity="0.8">
        — ${authorText}
      </text>
      
      <!-- Badge -->
      <text x="1000" y="40" font-family="Monaco, monospace" font-size="12" fill="${colors.accentColor}" opacity="0.6">
        by gitpost
      </text>
    </svg>
  `;
}

// Test SVG generation
const projectPath = process.argv[2] || process.cwd();

console.log('🔍 Debugging SVG generation for code visibility\n');

const sourceFile = pickRandomSourceFile(projectPath);
const codeSnippet = sourceFile ? sourceFile.content : 'console.log("No code found");';

console.log('📝 Code to embed:\n');
console.log('---');
console.log(codeSnippet);
console.log('---\n');

// Generate light_code style SVG
const lightStyle = {
  bgColor1: '#f8fafc',
  bgColor2: '#e2e8f0',
  codeOpacity: 0.6,
  codeBlur: 0,
  overlayColor: '#ffffff',
  overlayOpacity: 0.15,
  textColor: '#0f172a',
  accentColor: '#1e40af',
};

const svg = createCoverSvg(
  'Testing code visibility in images',
  'Test User',
  codeSnippet,
  lightStyle
);

console.log('🔍 Generated SVG snippet (code section):\n');

// Extract and show the code group from SVG
const codeMatch = svg.match(/<g filter="url\(#codeBlur\)"[\s\S]*?<\/g>/);
if (codeMatch) {
  console.log('✅ Code group found in SVG:\n');
  console.log(codeMatch[0]);
  console.log('\n');
} else {
  console.log('❌ Code group NOT found in SVG\n');
}

// Show layer order
console.log('📋 SVG Layer Order (should be: background → overlay → code → text):\n');
const layers = [
  'Background gradient',
  'Overlay rectangle',
  'Code group (g element)',
  'Accent bar',
  'Headline text',
  'Author text',
  'Badge',
];

layers.forEach((layer, i) => {
  console.log(`  ${i + 1}. ${layer}`);
});

console.log('\n✅ Total SVG size:', svg.length, 'characters');
console.log('📊 Code opacity:', lightStyle.codeOpacity);
console.log('📊 Overlay opacity:', lightStyle.overlayOpacity);
console.log('📊 Code color:', lightStyle.accentColor);
