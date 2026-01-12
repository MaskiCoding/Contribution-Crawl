# Contribution Crawl

Turn your GitHub contribution graph into an animated dungeon crawler adventure! Your contributions become dungeon walls, and a pixel-art hero battles through ghosts lurking in the empty spaces.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/output/contribution-crawl-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/output/contribution-crawl-light.svg">
  <img alt="Contribution Crawl animation" src="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/output/contribution-crawl-light.svg">
</picture>

## Features

- Contributions form dungeon walls (darker green = stronger walls)
- Pac-Man style ghosts spawn in empty spaces
- Animated pixel-art hero traverses the entire year
- Slash animations when battling ghosts
- Wall-breaking when no path exists
- Light and dark theme variants that match GitHub's color scheme

## Installation

```bash
git clone https://github.com/MaskiCoding/Contribution-Crawl.git
cd Contribution-Crawl
npm install
npm run build
```

## Usage

### Command Line

```bash
# Generate for a GitHub user (requires GITHUB_TOKEN for private contributions)
npm run generate -- <username> [output-dir]

# Examples
npm run generate -- octocat dist
GITHUB_TOKEN=your_token npm run generate -- your-username dist

# Use mock data for testing
npm run generate -- TestUser dist --mock

# Use dense mock data (tests wall-breaking)
npm run generate -- TestUser dist --dense
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token (optional, needed for private contributions) |
| `GITHUB_USERNAME` | Default username if not provided as argument |

## GitHub Actions

Add this workflow to automatically update your profile README:

```yaml
# .github/workflows/contribution-crawl.yml
name: Generate Contribution Crawl

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:      # Manual trigger
  push:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Generate SVG
        run: npm run generate -- ${{ github.repository_owner }} dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Push to output branch
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: output
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
```

Then add to your profile README:

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YOUR_USERNAME/Contribution-Crawl/output/contribution-crawl-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YOUR_USERNAME/Contribution-Crawl/output/contribution-crawl-light.svg">
  <img alt="Contribution Crawl" src="https://raw.githubusercontent.com/YOUR_USERNAME/Contribution-Crawl/output/contribution-crawl-light.svg">
</picture>
```

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
