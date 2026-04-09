import { homedir } from 'os';
import { join } from 'path';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const CONFIG_DIR = join(homedir(), '.commitpost');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/**
 * Get the default config structure
 */
function getDefaultConfig() {
  return {
    toneProfile: '',
    apiKey: '',
    model: 'claude-opus-4-1',
    postLength: 'medium',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Load configuration from ~/.commitpost/config.json
 * @returns {Object} Configuration object
 */
export function loadConfig() {
  try {
    const content = readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    // Return default config if file doesn't exist
    return getDefaultConfig();
  }
}

/**
 * Save configuration to ~/.commitpost/config.json
 * @param {Object} config - Configuration object to save
 */
export function saveConfig(config) {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to save config: ${error.message}`);
  }
}

/**
 * Update a single config value
 * @param {string} key - Config key
 * @param {any} value - Config value
 */
export function updateConfig(key, value) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
}

/**
 * Get a config value by key
 * @param {string} key - Config key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Config value
 */
export function getConfigValue(key, defaultValue = null) {
  const config = loadConfig();
  return config[key] ?? defaultValue;
}

/**
 * Check if tone profile is set up
 * @returns {boolean}
 */
export function hasToneProfile() {
  const toneProfile = getConfigValue('toneProfile', '');
  return toneProfile.length > 0;
}

/**
 * Display config information (safe to show)
 * @returns {string}
 */
export function displayConfig() {
  const config = loadConfig();
  const lines = [
    '📋 CommitPost Configuration:',
    '',
    `Model: ${config.model || 'Not set'}`,
    `Tone Profile: ${config.toneProfile ? '✅ Configured' : '❌ Not configured'}`,
    `API Key: ${config.apiKey ? '✅ Set' : '❌ Not set (falls back to ANTHROPIC_API_KEY env var)'}`,
    '',
    `Config file: ${CONFIG_FILE}`,
  ];

  return lines.join('\n');
}
