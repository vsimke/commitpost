/**
 * Built-in image style profiles
 * Users can select and customize cover image appearance
 */

export const IMAGE_STYLES = {
  light_code: {
    name: 'Light Code Background',
    description: 'Light background with visible code snippet',
    config: {
      bgColor1: '#f8fafc',
      bgColor2: '#e2e8f0',
      codeOpacity: 0.6,
      codeBlur: 0,
      overlayColor: '#ffffff',
      overlayOpacity: 0.15,
      textColor: '#0f172a',
      accentColor: '#1e40af',
    },
  },

  dark_code: {
    name: 'Dark Code Background',
    description: 'Dark background with subtle blurred code',
    config: {
      bgColor1: '#0f172a',
      bgColor2: '#1a1f35',
      codeOpacity: 0.4,
      codeBlur: 1,
      overlayColor: '#000000',
      overlayOpacity: 0.25,
      textColor: '#ffffff',
      accentColor: '#60a5fa',
    },
  },

  minimal: {
    name: 'Minimal Clean',
    description: 'Simple gradient with no code background',
    config: {
      bgColor1: '#ffffff',
      bgColor2: '#f1f5f9',
      codeOpacity: 0,
      codeBlur: 0,
      overlayColor: 'none',
      overlayOpacity: 0,
      textColor: '#0f172a',
      accentColor: '#06b6d4',
    },
  },

  dark_minimal: {
    name: 'Dark Minimal',
    description: 'Dark gradient with clean typography',
    config: {
      bgColor1: '#1e293b',
      bgColor2: '#0f172a',
      codeOpacity: 0,
      codeBlur: 0,
      overlayColor: 'none',
      overlayOpacity: 0,
      textColor: '#f1f5f9',
      accentColor: '#ec4899',
    },
  },
};

/**
 * Get image style by name
 * @param {string} name - Style name
 * @returns {Object|null} Style config or null
 */
export function getImageStyle(name) {
  return IMAGE_STYLES[name] || null;
}

/**
 * List available image styles
 * @returns {Array} Array of style names
 */
export function listImageStyleNames() {
  return Object.keys(IMAGE_STYLES);
}

/**
 * Get style info for display
 * @returns {Array} Array of style objects
 */
export function listImageStyles() {
  return Object.entries(IMAGE_STYLES).map(([key, style]) => ({
    key,
    name: style.name,
    description: style.description,
  }));
}

/**
 * Format styles for display
 * @returns {string} Formatted list
 */
export function displayImageStyles() {
  const styles = listImageStyles();
  const lines = [
    '🎨 Available Image Styles:\n',
    ...styles.map(
      (s) =>
        `  • ${s.key}\n    ${s.name} — ${s.description}`
    ),
  ];
  return lines.join('\n');
}
