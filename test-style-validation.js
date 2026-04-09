#!/usr/bin/env node

import { generateCoverImage } from './src/image.js';
import { getImageStyle } from './src/image-styles.js';

async function test() {
  console.log('🧪 Testing image style validation...\n');

  // Test invalid style
  const invalidStyle = 'invalid_style';
  const style = getImageStyle(invalidStyle);
  
  if (style === null) {
    console.log(`✅ Correctly identified invalid style: "${invalidStyle}"`);
    console.log('   getImageStyle() returned null as expected');
  } else {
    console.log(`❌ Unexpected: getImageStyle("${invalidStyle}") returned:`, style);
  }

  // Test valid styles
  const validStyles = ['light_code', 'dark_code', 'minimal', 'dark_minimal'];
  console.log('\n✅ Valid styles:');
  validStyles.forEach(styleName => {
    const styleObj = getImageStyle(styleName);
    if (styleObj) {
      console.log(`   • ${styleName}: ${styleObj.name}`);
    }
  });
}

test();
