# GitPost — Quick Reference

## Installation

```bash
npm install -g gitpost
```

## First-Time Setup

```bash
# 1. Set your API key
export ANTHROPIC_API_KEY=sk-ant-...

# 2. (Optional) Set tone profile
gitpost config --set-tone my-tone.txt

# 3. Verify config
gitpost config --view
```

## Common Commands

```bash
# Generate post from last week
gitpost generate --author "Your Name" --since 7

# Generate with cover image
gitpost generate --author "Your Name" --since 7 --include-image

# View configuration
gitpost config --view

# Update tone profile
gitpost config --set-tone new-sample.txt

# Help
gitpost --help
gitpost generate --help
```

## Config Location

All configuration is stored in: `~/.gitpost/config.json`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No API key found" | `export ANTHROPIC_API_KEY=sk-ant-...` or `gitpost config --set-key sk-ant-...` |
| "No commits found" | Try `--since 30` or check author name with `git log --author "Your Name"` |
| "Invalid API key" | Check your key at console.anthropic.com |

## Environment Variables

- `ANTHROPIC_API_KEY` — API key (required)
- `GIT_AUTHOR_NAME` — Default author filter (optional)

## Example Workflow

```bash
# Set up once
export ANTHROPIC_API_KEY=sk-ant-...
gitpost config --set-tone writing-sample.txt

# Every week
gitpost generate --since 7 --include-image
# → Copy post text to LinkedIn
# → Upload gitpost-cover.png as cover image
```

---

**For more details, see [README.md](./README.md)** or run `gitpost --help`
