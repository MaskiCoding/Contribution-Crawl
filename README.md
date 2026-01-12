# ⚔️ Contribution Crawl

[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Contributors][contributors-shield]][contributors-url]

Transform your GitHub contribution graph into an animated dungeon crawler adventure! A pixel-art hero battles through Pac-Man style ghosts lurking in the empty spaces of your contribution history.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/main/dist/contribution-crawl-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/main/dist/contribution-crawl-light.svg">
  <img alt="Contribution Crawl animation" src="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/main/dist/contribution-crawl-light.svg">
</picture>

## 🎮 Features

- **Dungeon Visualization**: Your contributions become dungeon walls (darker green = stronger walls)
- **Pac-Man Style Ghosts**: Classic colorful ghosts spawn in empty spaces
- **Animated Hero**: Pixel-art adventurer traverses your entire contribution year
- **Battle Animations**: Slash effects when the hero encounters ghosts
- **Wall Breaking**: Hero can break through walls when no path exists
- **Theme Support**: Light and dark variants that match GitHub's color scheme

## 👻 The Ghosts

Each ghost features the classic Pac-Man colors:

| Ghost | Color | Description |
|:-----:|:-----:|:------------|
| **Blinky** | 🔴 Red | The aggressive leader |
| **Pinky** | 🩷 Pink | The ambusher |
| **Inky** | 🩵 Cyan | The unpredictable one |
| **Clyde** | 🟠 Orange | The shy wanderer |

## 🔧 Integrate into Your GitHub Profile

To showcase Contribution Crawl on your GitHub profile, follow these steps:

### 1. Create a Special Repository

- Create a new repository named exactly as your GitHub username (e.g., `username/username`)
- This repository powers your GitHub profile page

### 2. Set Up GitHub Actions

In your repository, create `.github/workflows/contribution-crawl.yml`:

```yaml
name: Generate Contribution Crawl

on:
  schedule:
    - cron: "0 0 * * *"  # Run daily at midnight UTC
  workflow_dispatch:      # Allow manual trigger
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

      - name: Install and build
        working-directory: crawl
        run: |
          npm ci
          npm run build

      - name: Generate SVGs
        working-directory: crawl
        run: node dist/index.js ${{ github.repository_owner }} ..
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add contribution-crawl-*.svg
          git diff --staged --quiet || git commit -m "Update Contribution Crawl"
          git push
```

### 3. Add to Your README

In your profile repository, add this to your `README.md`:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./contribution-crawl-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./contribution-crawl-light.svg">
  <img alt="Contribution Crawl" src="./contribution-crawl-light.svg">
</picture>
```

### 4. Run the Workflow

1. Go to the **Actions** tab in your repository
2. Click **Generate Contribution Crawl**
3. Click **Run workflow** → **Run workflow**

The SVG will be generated and committed to your repository. Your profile will now display the animated dungeon crawl!

## 🎯 How It Works

The application uses your GitHub contribution data to:

1. **Fetch Contributions**: Pulls your contribution data via GitHub's GraphQL API
2. **Build the Dungeon**: Maps contribution levels to dungeon walls:
   - `NONE`: Empty floor tiles (where ghosts spawn)
   - `FIRST_QUARTILE`: Light walls
   - `SECOND_QUARTILE`: Medium walls
   - `THIRD_QUARTILE`: Strong walls
   - `FOURTH_QUARTILE`: Strongest walls
3. **Spawn Monsters**: Places 25 ghosts spread across the year in empty cells
4. **Pathfinding**: Hero uses BFS to navigate, with wall-breaking as a last resort
5. **Render Animation**: Generates SVG with SMIL animations for movement, battles, and effects

## 💻 Local Development

```bash
git clone https://github.com/MaskiCoding/Contribution-Crawl.git
cd Contribution-Crawl
npm install
npm run build

# Generate with mock data
node dist/index.js TestUser dist --mock

# Generate for a real user
GITHUB_TOKEN=your_token node dist/index.js your-username dist
```

### CLI Options

| Option | Description |
|--------|-------------|
| `--mock` | Use randomly generated mock contribution data |
| `--dense` | Use dense mock data (tests wall-breaking feature) |

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 🙏 Acknowledgements

This project was inspired by these amazing contribution graph animations:

- **[snk](https://github.com/Platane/snk)** by [@Platane](https://github.com/Platane) - The original snake game that eats your contributions. This project's workflow structure and approach were heavily influenced by snk.
- **[pacman-contribution-graph](https://github.com/abozanona/pacman-contribution-graph)** by [@abozanona](https://github.com/abozanona) - A Pac-Man themed contribution visualization that inspired the ghost designs.

Special thanks to the open-source community for making creative profile customizations possible!

## 📄 License

MIT

---

<p align="center">
  <i>Watch your hero conquer your contribution history!</i> ⚔️👻
</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/MaskiCoding/Contribution-Crawl.svg?style=for-the-badge
[contributors-url]: https://github.com/MaskiCoding/Contribution-Crawl/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/MaskiCoding/Contribution-Crawl.svg?style=for-the-badge
[forks-url]: https://github.com/MaskiCoding/Contribution-Crawl/network/members
[stars-shield]: https://img.shields.io/github/stars/MaskiCoding/Contribution-Crawl.svg?style=for-the-badge
[stars-url]: https://github.com/MaskiCoding/Contribution-Crawl/stargazers
