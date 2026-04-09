# GitPost — Dev LinkedIn Post Generator

Generate compelling LinkedIn posts from your git history in seconds. GitPost reads your recent commits, uses AI to craft a personalized post in your voice, and optionally generates a professional cover image.

## Features

✨ **AI-Powered Post Generation**

- Turns git commits into engaging LinkedIn posts
- Learns your writing style from a tone profile
- One-command workflow

🎨 **Cover Images**

- Automatically generates 1200×627px LinkedIn-optimized images
- Professional gradient design with your headline and name
- Optional flag: `--include-image`

⚙️ **Personalization**

- Set up a tone profile once with your writing sample
- All posts match your authentic voice
- Supports Anthropic Claude API

🚀 **Simple CLI**

- No complex setup — just `npm install -g gitpost` and go
- Works anywhere in your project
- Sensible defaults with tons of options

---

## Installation

### Global CLI (Recommended)

```bash
npm install -g gitpost
```

Verify installation:

```bash
gitpost --version
gitpost --help
```

### As a Project Dependency

```bash
npm install --save-dev gitpost
npx gitpost generate
```

---

## Quick Start

### 1. Set Your API Key

GitPost uses the Anthropic Claude API. Get a free API key at [console.anthropic.com](https://console.anthropic.com).

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or save it to config:

```bash
gitpost config --set-key sk-ant-...
```

### 2. (Optional) Set Up Your Tone Profile

Create a file with a writing sample (previous LinkedIn post, blog article, etc.):

```bash
cat > my-tone.txt << 'EOF'
Just shipped a massive refactor of our authentication system.
We moved from custom middleware to OAuth2, cut our auth code by 60%,
and gave security a huge boost. Learned a ton about distributed state management.
Building resilient systems is hard work, but it's worth the effort.
EOF
```

Set it:

```bash
gitpost config --set-tone my-tone.txt
```

View your config:

```bash
gitpost config --view
```

### 3. Generate Your First Post

From within a git repository:

```bash
gitpost generate --author "Your Name" --since 7 --include-image
```

This will:

- Read commits from the last 7 days
- Filter by your name
- Generate a LinkedIn post
- Create a cover image (`gitpost-cover.png`)
- Print the post to your terminal

---

## Usage

### Generate a Post

```bash
gitpost generate [options]
```

**Options:**

- `--author <name>` — Filter commits by author (default: `$GIT_AUTHOR_NAME` env var)
- `--since <days>` — Number of days back (default: `7`)
- `--tone <name>` — Use a built-in tone profile (run `gitpost list-tones` to see options)
- `--image-style <name>` — Cover image style (default: `light_code`, run `gitpost list-image-styles` to see options)
- `--include-image` — Generate a cover image (default: false)

**Examples:**

```bash
# Last 7 days, auto-detect author
gitpost generate

# Last 30 days, specific author
gitpost generate --author "Jane Doe" --since 30

# Use a built-in tone profile
gitpost generate --tone technical_reflective --since 7

# With cover image using default light_code style
gitpost generate --author "Jane Doe" --include-image

# With cover image using dark_code style
gitpost generate --author "Jane Doe" --include-image --image-style dark_code

# Combine tone and image styles
gitpost generate --tone concise_action_oriented --image-style minimal --include-image --since 7

# All commits since a specific date (no date limit)
gitpost generate --since 365
```

### List Available Tone Profiles

```bash
gitpost list-tones
```

Shows all built-in tone profiles with descriptions. Use the profile name with `--tone` flag:

```bash
gitpost generate --tone <profile-name> --since 7
```

**Built-in Tone Profiles:**

- `technical_reflective` — Deep technical work with learning insights
- `concise_action_oriented` — Direct and results-focused
- `learning_focused` — Emphasizes growth and new skills
- `startup_rapid` — Fast-paced, shipping-focused
- `collaboration_focused` — Highlights teamwork and shared vision

### Automatic Code Extraction

When you use `--include-image`, GitPost automatically finds and displays real code from your commits:

**How it works:**

1. Looks at the files you changed in your commits
2. Filters for code files (`.js`, `.ts`, `.py`, `.java`, etc.)
3. **Automatically skips test files** — excludes `test/`, `__tests__/`, `.test.`, `.spec.` patterns
4. Shows the first 8-12 lines from a random changed production file
5. Displays code in the top 60% of the image, headlines in the bottom 40%

**Result:** Your LinkedIn cover image features actual code you shipped, not generic project files!

### Cover Image Styles

```bash
gitpost list-image-styles
```

Shows all available image styles for cover image generation. Customize the visual appearance to match your personal brand.

```bash
gitpost generate --include-image --image-style <style-name> [options]
```

**Built-in Image Styles:**

- `light_code` (default) — Light background with visible code snippet, great for readability
- `dark_code` — Dark background with subtle blurred code, professional look
- `minimal` — Clean white gradient with no code, simple and elegant
- `dark_minimal` — Dark gradient with clean typography, modern aesthetic

**Examples:**

```bash
# Use light_code style (default) - includes actual code from your changes
gitpost generate --include-image --since 7

# Use dark_code style with visible code from commits
gitpost generate --include-image --image-style dark_code --since 7

# Use minimal style (no code, just clean layout)
gitpost generate --include-image --image-style minimal

# Combine tone profile and image style
gitpost generate --tone technical_reflective --image-style dark_code --include-image --since 7
```

Each style includes:

- **Colors** — Gradient backgrounds customized for readability
- **Code Visibility** — Real code snippets from files you changed (auto-skips test files)
- **Professional Layout** — Code area separate from text area, no overlap
- **Accent Elements** — Color-coded accents for visual interest

### Set Up Configuration

```bash
gitpost setup
```

Interactive setup that shows:

- Current configuration
- API key status
- How to set your tone profile

### Manage Config

```bash
gitpost config [options]
```

**Options:**

- `--view` — Display current configuration
- `--set-tone <file>` — Set tone profile from a file
- `--set-key <key>` — Set Anthropic API key

**Examples:**

```bash
# View config
gitpost config --view

# Set tone profile
gitpost config --set-tone writing-sample.txt

# Set API key
gitpost config --set-key sk-ant-...
```

---

## Configuration

GitPost stores configuration in `~/.gitpost/config.json`:

```json
{
  "toneProfile": "Your writing sample here...",
  "apiKey": "sk-ant-...",
  "model": "claude-opus-4-1",
  "imageStyle": "light_code",
  "createdAt": "2026-04-08T15:30:00.000Z"
}
```

- **toneProfile**: Your writing sample (optional but recommended)
- **apiKey**: Anthropic API key (optional; falls back to `ANTHROPIC_API_KEY` env var)
- **model**: Claude model to use (default: `claude-opus-4-1`)
- **imageStyle**: Default cover image style (default: `light_code`). Can be overridden with `--image-style` flag

---

## Environment Variables

```bash
# Required (one of these)
export ANTHROPIC_API_KEY=sk-ant-...        # Anthropic API key

# Optional
export GIT_AUTHOR_NAME="Your Name"         # Default author filter
```

---

## Examples

### Example 1: Weekly Review Post

```bash
# Monday morning ritual
gitpost generate --since 7 --include-image
# → Generates last week's wins, saves to gitpost-cover.png
```

### Example 2: Team Updates

```bash
# Generate post for a team member
gitpost generate --author "Alice" --since 14 --include-image
# → Last 2 weeks of Alice's commits, ready to share
```

### Example 3: Focus on Recent Work

```bash
# Just yesterday's commits
gitpost generate --since 1
# → Quick post about what shipped yesterday
```

---

## Tone Profiles: Best Practices

### Quick Start: Use Built-in Profiles

No custom profile yet? Try one of GitPost's built-in tone profiles:

```bash
gitpost list-tones
gitpost generate --tone technical_reflective --since 7
```

This lets you test before creating a custom profile.

### Create a Custom Tone Profile

Your custom tone profile is the key to authentic posts matching your unique voice. Here's what works:

✅ **Use 1–2 writing samples** (200–500 words total)

- Previous LinkedIn posts
- Blog articles about technical work
- Slack messages or email summaries
- Things that reflect _your_ voice

✅ **Include specifics**

- Technical details about what you shipped
- Problems you solved
- Things you learned

❌ **Avoid generic templates**

- "I'm excited to share…"
- Standard resume language
- Buzzwords without context

**Example tone profile:**

```
Just shipped a massive refactor of our auth system. We moved from custom
middleware to OAuth2, cut our auth handling code by 60%, and gave security
a huge boost. Zero downtime migration using feature flags.

The best part? Learned a ton about distributed state management and rate limiting.

Building resilient systems is hard work, but it's worth it.
```

**To use your custom profile:**

```bash
gitpost config --set-tone my-writing-sample.txt
gitpost generate --since 7
```

---

## API Key Setup

### Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up (free)
3. Create an API key in Settings
4. Set it in your environment:

```bash
# Option 1: Export as environment variable
export ANTHROPIC_API_KEY=sk-ant-...

# Option 2: Save to GitPost config
gitpost config --set-key sk-ant-...

# Option 3: Add to ~/.bashrc (persistent)
echo 'export ANTHROPIC_API_KEY=sk-ant-...' >> ~/.bashrc
source ~/.bashrc
```

### Usage Limits

- **Free tier**: $5 free credit monthly (enough for ~500 posts)
- **Paid tier**: $0.01 per post (approximately)

---

## Output

### Terminal Output

GitPost prints your generated post to the terminal:

```
🚀 Generating LinkedIn post...

📊 Found 3 commit(s):
• 08/04/2026 — "Refactor auth system to OAuth2" (Jane Doe)
• 07/04/2026 — "Add rate limiting middleware" (Jane Doe)
• 06/04/2026 — "Update dependencies" (Jane Doe)

✨ Generating post with AI...

📝 Generated Post:
---
Just shipped a massive refactor of our authentication system. We moved from
custom middleware to OAuth2, cut our auth handling code by 60%, and gave security
a huge boost in the process.

The best part? Zero downtime migration. We gradually rolled out the new system
behind a feature flag, monitored metrics obsessively, and flipped the switch
on a Tuesday afternoon. The team nailed the execution.

Learned a ton about state management in distributed systems and rate limiting
strategies. If you're tackling similar challenges, happy to chat about our approach.
---

✅ Post ready! Copy the text above to LinkedIn.
```

### Cover Image

When using `--include-image`, GitPost generates `gitpost-cover.png`:

- **Size**: 1200×627 pixels (LinkedIn optimal)
- **Design**: Professional gradient with headline overlay
- **Format**: PNG with transparency support
- Ready to upload directly to LinkedIn

---

## Troubleshooting

### "No API key found"

```bash
# Option 1: Set environment variable
export ANTHROPIC_API_KEY=sk-ant-...

# Option 2: Save to GitPost config
gitpost config --set-key sk-ant-...

# Verify
gitpost config --view
```

### "No commits found"

Adjust your filters:

```bash
# Check author name format
git log --author="Your Name" --oneline | head

# Try a wider date range
gitpost generate --since 30

# Or filter by email
gitpost generate --author "you@example.com" --since 30
```

### "Invalid API key"

- Verify your key at [console.anthropic.com](https://console.anthropic.com)
- Check for typos: `echo $ANTHROPIC_API_KEY`
- Regenerate if needed

### Image generation failed

Image generation is optional. The post will still generate successfully. Check:

```bash
# Verify sharp is installed
npm ls sharp

# Reinstall if needed
npm install --save sharp
```

---

## Advanced Usage

### Save Posts to Files

```bash
gitpost generate --since 7 > my-post.txt
gitpost generate --since 7 --include-image && open gitpost-cover.png
```

### Batch Generation (for teams)

```bash
for author in "Alice" "Bob" "Charlie"; do
  echo "=== $author ==="
  gitpost generate --author "$author" --since 7
  echo ""
done
```

### Custom Model

Edit `~/.gitpost/config.json`:

```json
{
  "model": "claude-opus-4-1"
}
```

Available models:

- `claude-opus-4-1` (default, most capable)

---

## Privacy & Security

- **Your commits**: Read locally from your git history (never sent to GitPost servers)
- **Your tone profile**: Stored in `~/.gitpost/config.json` (your machine only)
- **API key**: Stored in config or environment (your choice, treat like a password)
- **Posts**: Sent to Anthropic API (see [Anthropic Privacy Policy](https://www.anthropic.com/privacy))
- **Generated images**: Saved locally to your disk

---

## Contributing

Found a bug? Have an idea? Contributions welcome!

```bash
git clone https://github.com/USERNAME/gitpost.git
cd gitpost
npm install
npm run dev
```

Please submit:

- Bug reports with reproducible examples
- Feature requests with clear use cases
- PRs with tests and documentation

---

## License

MIT — See [LICENSE](./LICENSE) file

---

## Support

- **Issues**: [GitHub Issues](https://github.com/USERNAME/gitpost/issues)
- **Discussions**: [GitHub Discussions](https://github.com/USERNAME/gitpost/discussions)
- **Email**: hello@gitpost.dev (coming soon)

---

## Roadmap

- [ ] Interactive CLI setup wizard
- [ ] Clipboard support (`--copy-to-clipboard`)
- [ ] Schedule posts directly to LinkedIn
- [ ] Team mode (generate for multiple authors)
- [ ] Custom image templates
- [ ] HashTag auto-generation
- [ ] SaaS dashboard (analytics, scheduling)

---

**Built with ❤️ for developers. Share your work.**
