# Contribution Crawl

Turn your GitHub contributions into an animated dungeon crawler!

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/main/dist/contribution-crawl-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/main/dist/contribution-crawl-light.svg">
  <img alt="Contribution Crawl" src="https://raw.githubusercontent.com/MaskiCoding/Contribution-Crawl/main/dist/contribution-crawl-light.svg">
</picture>

## Setup (2 steps)

### 1. Add the workflow file

Create `.github/workflows/contribution-crawl.yml` in your profile repo (`USERNAME/USERNAME`):

```yaml
name: Contribution Crawl
on:
  schedule: [cron: "0 0 * * *"]
  workflow_dispatch:
permissions:
  contents: write
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: |
          git clone https://github.com/MaskiCoding/Contribution-Crawl.git crawl
          cd crawl && npm ci && npm run build
          node dist/index.js ${{ github.repository_owner }} ..
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add contribution-crawl-*.svg
          git diff --staged --quiet || git commit -m "Update Contribution Crawl"
          git push
```

### 2. Add to your README

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./contribution-crawl-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./contribution-crawl-light.svg">
  <img alt="Contribution Crawl" src="./contribution-crawl-light.svg">
</picture>
```

Then go to **Actions → Contribution Crawl → Run workflow** to generate!

---

<details>
<summary>Local Development</summary>

```bash
git clone https://github.com/MaskiCoding/Contribution-Crawl.git
cd Contribution-Crawl
npm install && npm run build
node dist/index.js USERNAME dist
```

Use `--mock` for test data or set `GITHUB_TOKEN` for real contributions.

</details>

## License

MIT
