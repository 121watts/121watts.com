# resume-site

Premium, editorial-quality single-page resume designed for GitHub Pages.

## Edit content (single source of truth)
All resume content lives in **one file**:
- `src/content/resume.json`

Edit that file (name, roles, projects, links, etc). The UI renders entirely from it.

## Run locally
Because the site loads `resume.json`, you should preview it via a small local static server (opening `index.html` via `file://` may block `fetch`).

Pick one:

### Option A (VS Code)
- Install **Live Server**
- Right-click `index.html` â†’ **Open with Live Server**

### Option B (Node)
```bash
npx serve .
```

### Option C (Python)
```bash
python -m http.server 5173
```

Then open the shown URL.

## Deploy (GitHub Pages)
This repo deploys via **GitHub Actions**:
- Workflow: `.github/workflows/deploy.yml`

Steps:
1. In your GitHub repo, go to **Settings â†’ Pages**
2. Set **Build and deployment** to **GitHub Actions**
3. Push to `main` (or `master`) â€” the workflow will publish automatically

The site will be available at:
- `https://121watts.github.io/<repo>/`

## Notes
- No PDF download button (per request). Use the **Print** action for â€œSave as PDFâ€.
- Print stylesheet is in `print.css`.
