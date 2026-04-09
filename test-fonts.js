#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { readdirSync } from 'fs';
import sharp from 'sharp';

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
      content: content.split('\n').slice(0, 4).join('\n'), // Just 4 lines
    };
  } catch (error) {
    return null;
  }
}

async function testWithFont(fontFamily, fontFamilyName) {
  console.log(`\n🔍 Testing with font: ${fontFamilyName}\n`);

  const projectPath = process.cwd();
  const sourceFile = pickRandomSourceFile(projectPath);
  const codeSnippet = sourceFile ? sourceFile.content : 'no code found';

  const escapeXml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const codeLines = codeSnippet.split('\n');
  let codeLinesXml = '';
  codeLines.forEach((line, i) => {
    codeLinesXml += `<tspan x="50" dy="${i === 0 ? '0' : '24'}">${escapeXml(line.substring(0, 100))}</tspan>`;
  });

  const svg = `
    <svg width="1200" height="627" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="627" fill="url(#bg)" />
      <rect width="1200" height="627" fill="#ffffff" opacity="0.15" />
      
      <text x="50" y="90" font-family="${fontFamily}" font-size="16" font-weight="500" fill="#1e40af">
        ${codeLinesXml}
      </text>
      
      <text x="60" y="240" font-family="system-ui, sans-serif" font-size="48" font-weight="700" fill="#0f172a">
        <tspan x="60" dy="0">Code Visibility Test</tspan>
      </text>
    </svg>
  `;

  console.log('📝 Code being rendered:');
  console.log('---');
  console.log(codeSnippet);
  console.log('---\n');

  try {
    const buffer = await sharp(Buffer.from(svg), { density: 150 })
      .png()
      .toBuffer();

    await sharp(buffer)
      .resize(1200, 627, {
        fit: 'contain',
        background: { r: 248, g: 250, b: 252, alpha: 1 },
      })
      .png()
      .toFile(`./test-font-${fontFamilyName}.png`);

    console.log(`✅ Image saved: test-font-${fontFamilyName}.png`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

(async () => {
  console.log('🧪 Testing different fonts for code rendering\n');
  
  // Test multiple fonts
  await testWithFont('monospace', 'monospace');
  await testWithFont('DejaVu Sans Mono, monospace', 'dejavu');
  await testWithFont('Courier New, monospace', 'courier');
  await testWithFont('Monaco, "Courier New", monospace', 'monaco');
  
  console.log('\n✅ All font tests complete!');
})();
