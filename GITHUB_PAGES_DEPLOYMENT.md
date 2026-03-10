# GitHub Pages deployment guide (Vite + React)

This project includes a GitHub Actions workflow at:

- `.github/workflows/deploy-gh-pages.yml`

## Why `npm install` is used (not `npm ci`)

Your previous setup failed with `npm ERR! code EUSAGE` because `npm ci` requires a valid lockfile (`package-lock.json`), and the repository lockfile was malformed.

To make deployment reliable immediately, the workflow now uses:

- `npm install`

This removes the lockfile requirement and allows Pages builds to proceed.

## One-time setup in GitHub

1. Push this branch to GitHub.
2. Open **Repository Settings → Pages**.
3. In **Build and deployment**, set **Source** to **GitHub Actions**.
4. Ensure your deployment branch is `main` (workflow triggers on push to `main`).

## Build and deploy flow

On each push to `main`, GitHub Actions will:

1. checkout the repo,
2. install dependencies with `npm install`,
3. build with `npm run build`,
4. deploy `dist/` to Pages.

You can also run manually from **Actions → Deploy to GitHub Pages → Run workflow**.

## Local commands

```bash
npm install
npm run build
npm run preview
```

## Optional improvement later

If you want strict reproducible installs, regenerate and commit a valid `package-lock.json`, then switch workflow back to `npm ci`.
