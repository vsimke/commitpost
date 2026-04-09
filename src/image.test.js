import { test } from 'vitest';
import { generateCoverImage } from '../src/image.js';

test('should generate cover image', async () => {
  const result = await generateCoverImage({
    headline: 'Test',
    author: 'Test',
  });
  console.log('Generated:', result);
});
