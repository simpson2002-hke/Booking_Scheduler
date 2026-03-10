# GitHub Pages deployment guide (Vite + React)

<<<<<<< codex/fix-website-element-display-issue-01aari
This project includes a GitHub Actions workflow at:

- `.github/workflows/deploy-gh-pages.yml`

## Why `npm install` is used (not `npm ci`)

Your previous setup failed with `npm ERR! code EUSAGE` because `npm ci` requires a valid lockfile (`package-lock.json`), and the repository lockfile was malformed.

To make deployment reliable immediately, the workflow now uses:

- `npm install`

This removes the lockfile requirement and allows Pages builds to proceed.

=======
This project now includes a GitHub Actions workflow at:

- `.github/workflows/deploy-gh-pages.yml`

>>>>>>> main
## One-time setup in GitHub

1. Push this branch to GitHub.
2. Open **Repository Settings → Pages**.
3. In **Build and deployment**, set **Source** to **GitHub Actions**.
<<<<<<< codex/fix-website-element-display-issue-01aari
4. Ensure your deployment branch is `main` (workflow triggers on push to `main`).

## Build and deploy flow

On each push to `main`, GitHub Actions will:

1. checkout the repo,
2. install dependencies with `npm install`,
3. build with `npm run build`,
4. deploy `dist/` to Pages.

You can also run manually from **Actions → Deploy to GitHub Pages → Run workflow**.

## Local commands
=======
4. Ensure your default branch is `main` (the workflow deploys on pushes to `main`).

## How deployment works

- On each push to `main`, GitHub Actions will:
  - run `npm ci`
  - run `npm run build`
  - publish the built `dist/` folder to Pages
- You can also run it manually from **Actions → Deploy to GitHub Pages → Run workflow**.

## Important for Vite base path

The Vite config automatically sets the correct base path for project Pages during CI by using:

- `GITHUB_PAGES=true`
- `GITHUB_REPOSITORY` (provided by GitHub Actions)

So URLs become `/<repo-name>/...` on Pages, while local dev still works normally.

## Local build check

Run locally before pushing:
>>>>>>> main

```bash
npm install
npm run build
npm run preview
```

<<<<<<< codex/fix-website-element-display-issue-01aari
## Optional improvement later

If you want strict reproducible installs, regenerate and commit a valid `package-lock.json`, then switch workflow back to `npm ci`.
=======
Then open the preview URL shown in your terminal.
>>>>>>> main
