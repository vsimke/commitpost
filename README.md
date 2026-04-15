# CommitPost

[![npm version](https://img.shields.io/npm/v/commitpost.svg)](https://www.npmjs.com/package/commitpost)
[![npm downloads](https://img.shields.io/npm/dm/commitpost.svg)](https://www.npmjs.com/package/commitpost)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

CLI that reads your git log, sends it to Claude, and writes a social post in your voice. Optionally generates a 1200×627 cover image with syntax-highlighted code from your actual commits as the background.

```bash
npm install -g commitpost
commitpost generate --since 7 --include-image
```

Requires an [Anthropic API key](https://console.anthropic.com) (~$0.01/post).

---

## How it works

1. `git log --author --since` → collect commits
2. Claude API + optional tone profile (your writing sample) → post text
3. `git diff-tree` → find changed files → pick a non-test code file → `git show` → extract from first class/function definition
4. `satori` (JSX→SVG) + `@resvg/resvg-js` (Rust SVG→PNG) + `sharp` (blur + composite) → cover image PNG

No browser, no Puppeteer, no Electron.

---

## Install

```bash
npm install -g commitpost
```

```bash
# Set API key
commitpost config --set-key sk-ant-...
# or
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Usage

```bash
commitpost generate [options]
```

| Option | Default | Description |
|--------|---------|-------------|
| `--author <name>` | `$GIT_AUTHOR_NAME` | Filter commits by author |
| `--since <days>` | `7` | How many days back to look |
| `--length <size>` | `medium` | Post length: `short` (~100w), `medium` (~250w), `long` (~500w) |
| `--tone <name>` | — | Built-in tone profile (see `commitpost list-tones`) |
| `--image-style <name>` | `light_code` | Cover image style (see `commitpost list-image-styles`) |
| `--include-image` | `false` | Generate cover image PNG |

**Examples:**

```bash
# Basic
commitpost generate

# With cover image, dark style, long post
commitpost generate --include-image --image-style dark_code --length long

# Specific author, last 30 days
commitpost generate --author "Jane Doe" --since 30

# Built-in tone profile
commitpost generate --tone technical_reflective --since 7
```

---

## Tone profiles

Set your own writing sample once — all posts match your style:

```bash
commitpost config --set-tone my-writing-sample.txt
```

Or use a built-in profile without any setup:

```bash
commitpost list-tones
commitpost generate --tone technical_reflective
```

Built-in profiles: `technical_reflective`, `concise_action_oriented`, `learning_focused`, `startup_rapid`, `collaboration_focused`

---

## Cover image styles

```bash
commitpost list-image-styles
```

- `light_code` — light background, blurred code texture
- `dark_code` — dark background, subtle blurred code
- `minimal` — clean light gradient, no code
- `dark_minimal` — clean dark gradient, no code

Code in the image is extracted from files you actually changed in those commits. Test files (`*.test.*`, `__tests__/`, etc.) are excluded. Rendering starts at the first class or function definition, not at the import block.

---

## Configuration

Stored in `~/.commitpost/config.json`:

```json
{
  "apiKey": "sk-ant-...",
  "model": "claude-opus-4-1",
  "toneProfile": "",
  "postLength": "medium"
}
```

```bash
commitpost config --view
commitpost config --set-key sk-ant-...
commitpost config --set-tone writing-sample.txt
```

---

## Privacy

- Commit messages are sent to the Anthropic API
- Everything else (tone profile, API key, generated images) stays on your machine
- No CommitPost servers involved — direct API call only

---

## Contributing

```bash
git clone https://github.com/vsimke/commitpost.git
cd commitpost
npm install
node src/index.js generate --help
```

Issues and PRs welcome: [github.com/vsimke/commitpost](https://github.com/vsimke/commitpost)

---

## Roadmap

- [ ] `--copy-to-clipboard` flag
- [ ] `--platform` flag (adjust length/format per platform)
- [ ] Hashtag generation
- [ ] GitHub Actions workflow template
- [ ] Direct LinkedIn/Bluesky posting via API

---

MIT License

