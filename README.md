# resume-site

Clean, static resume site built with Astro and Tailwind CSS.

## Edit content (single source of truth)
All resume content lives in:
- `src/content/resume.json`

## Run locally
```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)
This repo deploys automatically using **GitHub Actions**.

### One-time setup (required)
In your GitHub repo:
- Go to **Settings → Pages**
- Set **Source** to **Deploy from a branch**
- Set **Branch** to `gh-pages` and **Folder** to `/ (root)`

Custom domain:
- `CNAME` is committed and will be published automatically.

### Day-to-day workflow
1. Make changes on a branch
2. Open a PR and merge into `main`
3. GitHub Actions runs on `main`, builds the site, and publishes the generated `dist/` output to the `gh-pages` branch
4. GitHub Pages serves the site from `gh-pages`

### Why `gh-pages` instead of serving directly from `main`?
- `main` contains the **source** (Astro/Tailwind). GitHub Pages needs the **built static output**.
- The workflow builds on `main` and publishes the static output to `gh-pages` so Pages can serve it.
