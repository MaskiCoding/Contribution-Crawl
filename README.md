# Contribution Crawl

Turn your GitHub contribution graph into an animated dungeon crawler adventure! Your contributions become dungeon walls, and a pixel-art hero battles through ghosts lurking in the empty spaces.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/main/dist/contribution-crawl-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/main/dist/contribution-crawl-light.svg">
  <img alt="Contribution Crawl animation" src="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/main/dist/contribution-crawl-light.svg">
</picture>

## Features

- Contributions form dungeon walls (darker green = stronger walls)
- Pac-Man style ghosts spawn in empty spaces
- Animated pixel-art hero traverses the entire year
- Slash animations when battling ghosts
- Wall-breaking when no path exists
- Light and dark theme variants that match GitHub's color scheme

## Quick Setup for Your Profile

### 1. Create a workflow in your profile repo

In your `USERNAME/USERNAME` repository, create `.github/workflows/contribution-crawl.yml`:

```yaml
name: Generate Contribution Crawl

on:
  schedule:
    - cron: "0 0 * * *"  # Daily at midnight UTC
  workflow_dispatch:      # Manual trigger
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - name: Checkout profile repo
        uses: actions/checkout@v4
      
      - name: Clone Contribution Crawl
        run: git clone https://github.com/MaskiCoding/Contribution-Crawl.git crawl
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: crawl
        run: npm ci
      
      - name: Build
        working-directory: crawl
        run: npm run build
      
      - name: Generate SVGs
        working-directory: crawl
        run: node dist/index.js ${{ github.repository_owner }} ../output
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Move SVGs to repo root
        run: |
          mv output/contribution-crawl-light.svg .
          mv output/contribution-crawl-dark.svg .
          rm -rf crawl output
      
      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add contribution-crawl-*.svg
          git diff --staged --quiet || git commit -m "Update Contribution Crawl animation"
          git push
```

### 2. Add to your README

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./contribution-crawl-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./contribution-crawl-light.svg">
  <img alt="Contribution Crawl" src="./contribution-crawl-light.svg">
</picture>
```

### 3. Trigger the workflow

Go to **Actions** → **Generate Contribution Crawl** → **Run workflow**

---

## Local Development

```bash
git clone https://github.com/MaskiCoding/Contribution-Crawl.git
cd Contribution-Crawl
npm install
npm run build

# Generate with mock data
npm run generate -- TestUser dist --mock

# Generate for a real user (needs GITHUB_TOKEN for private contributions)
GITHUB_TOKEN=your_token npm run generate -- your-username dist
```

### CLI Options

| Option | Description |
|--------|-------------|
| `--mock` | Use randomly generated mock contribution data |
| `--dense` | Use dense mock data (tests wall-breaking feature) |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token (optional, needed for private contributions) |
| `GITHUB_USERNAME` | Default username if not provided as argument |

## How It Works

1. **Fetch Contributions**: Pulls your GitHub contribution data via GraphQL API
2. **Build Dungeon**: Maps contributions to walls (green squares) and empty spaces to floors
3. **Spawn Monsters**: Places 25 ghosts spread across the year in empty cells
4. **Pathfinding**: Hero uses BFS to find paths to each ghost, with Dijkstra-like wall-breaking as a last resort
5. **Render SVG**: Generates animated SVG with CSS/SMIL animations for movement, battles, and effects

## Project Structure

```
src/
├── index.ts         # Entry point and CLI
├── types.ts         # TypeScript interfaces and theme definitions
├── github-api.ts    # GitHub GraphQL API integration
├── game-engine.ts   # Dungeon generation, pathfinding, game logic
└── svg-renderer.ts  # SVG generation with embedded sprites
```

## License

MIT
