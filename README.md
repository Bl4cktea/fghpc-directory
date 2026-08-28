# FGHPC Local Directory

A searchable web directory of FGHPC local phone extensions (individuals and
offices/areas), backed by a Google Sheet.

## How it works

```
Google Sheet (database, edited by admin)
        │
        ▼
Google Apps Script Web App  →  serves the sheet as JSON (cached ~5 min)
        │
        ▼
React + Tailwind + shadcn/ui frontend (this repo, /web)
```

- The **Google Sheet** is the database. Editing the sheet updates the site
  within about 5 minutes — no code changes or redeploys needed.
- The **Apps Script** backend (source in [`apps-script/`](apps-script)) reads
  the sheet and serves it as JSON. `Code.gs` is the live API; `setup.gs` was a
  one-time seeding script.
- The **frontend** ([`web/`](web)) fetches the JSON once per visit and does all
  search/filtering in the browser. It falls back to the last saved copy
  (localStorage) when offline.

## Development

```bash
cd web
npm install
npm run dev
```

The API URL is set in `web/.env` (`VITE_API_URL`).

## Deployment

Pushing to `main` triggers the GitHub Actions workflow
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), which builds
the Vite app and publishes it to GitHub Pages at
https://bl4cktea.github.io/fghpc-directory/.

## Updating the directory

1. Edit the **Directory** tab of the FGHPC Directory Google Sheet.
2. Optionally update the date in the **Meta** tab (shown in the site footer).
3. Wait up to 5 minutes (API cache), or run `clearCache()` in the Apps Script
   editor for an immediate refresh.
