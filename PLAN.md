# FGHPC Web Directory — Project Plan

**Goal:** A searchable web directory of FGHPC local phone extensions (individuals and offices/areas), using a Google Sheet as the database, Google Apps Script (GAS) as the backend API, and a React frontend styled with Tailwind CSS + shadcn/ui.

**Status (28 Aug 2026):** Phases 1–3 complete — Sheet seeded and validated,
GAS API deployed with anonymous access, frontend built and verified against the
live API. Phase 4 (GitHub Pages deploy) in progress.

**Data source:** `Local_Directoryy _20Aug2026.csv` — ~70 records, two categories:
- **Individual** — First Name, Middle Initial, Last Name, Suffix, Full Name, Local No.
- **Office/Area** — Section (Housing Compound, CHEP, MHEP, PHEP), Full Name (location label), Local No.

---

## 1. Architecture Overview

```
┌──────────────────┐     read      ┌─────────────────────┐    fetch JSON    ┌──────────────────────┐
│   Google Sheet   │ ───────────►  │  Google Apps Script │ ───────────────► │  React + Tailwind +  │
│  (the database)  │               │  Web App (JSON API) │                  │  shadcn/ui frontend  │
│  edited by admin │               │  + CacheService     │                  │  (static hosting)    │
└──────────────────┘               └─────────────────────┘                  └──────────────────────┘
```

**How it works, in plain language:**

1. The Google Sheet **is** the database. Whoever maintains the directory just edits the Sheet — no admin panel needed.
2. A small Apps Script project is deployed as a **Web App**. When the frontend calls its URL, the script reads the Sheet and returns the rows as JSON.
3. The frontend is a normal React site (built with Vite), hosted for free on GitHub Pages, Vercel, or Netlify. It fetches the JSON once on load, then does all searching/filtering **in the browser** — with only ~70 rows, that's instant and avoids repeated API calls.

### Why this shape (key decisions)

| Decision | Choice | Why |
|---|---|---|
| Who talks to the Sheet | GAS only (frontend never touches Sheets API directly) | Calling Sheets API v4 straight from the browser requires either exposing an API key + making the Sheet public, or full OAuth. GAS hides the Sheet entirely — it stays private. |
| Read the Sheet inside GAS | `SpreadsheetApp` (built-in), with Sheets API v4 Advanced Service as an option | For a bound script reading one tab, `SpreadsheetApp.getDataRange().getValues()` is simpler and needs no extra setup. Enable the Sheets API v4 advanced service only if we later need things it does better (batch reads of many ranges, cell metadata). |
| Write access | None from the web — the Sheet itself is the admin UI | A public write endpoint needs real authentication, which GAS web apps do poorly. Editing the Sheet directly is safer and simpler. (A doPost with a shared secret can be added later if truly needed.) |
| Search/filter | Client-side, on the full dataset | 70 rows is tiny. Fetch once, filter instantly as the user types. No per-keystroke API calls, no GAS quota worries. |
| Caching | `CacheService` in GAS (e.g. 5-minute cache) | GAS cold starts are slow (1–3 s). Caching the JSON payload makes repeat loads fast and cuts Sheet reads. |
| Frontend hosting | GitHub Pages (or Vercel/Netlify) | shadcn/ui needs a React build step, which GAS's HTML Service can't do well. A static host is free and deploys from the repo. |

---

## 2. Google Sheet Setup (the database)

Create a spreadsheet **FGHPC Directory** with one data tab:

**Tab: `Directory`** — same columns as the CSV:

| ID | Category | Section | First Name | Middle Initial | Last Name | Suffix | Full Name | Local No. |
|----|----------|---------|------------|----------------|-----------|--------|-----------|-----------|

Conventions to keep the data clean:
- `Category` is either `Individual` or `Office/Area` (use Data Validation dropdown).
- `Section` is filled only for Office/Area rows (Housing Compound, CHEP, MHEP, PHEP — dropdown too).
- `Local No.` stays **text-formatted** (some values are ranges like `7500-7502`, and we don't want Sheets mangling them into numbers/dates).
- `Full Name` can be a formula for individuals (`=TRIM(First & " " & MI & " " & Last & " " & Suffix)`) or typed manually — either is fine since the API just reads the final value.
- Optional second tab `Meta` with a "Last Updated" date to show on the site.

Import the existing CSV via **File → Import** to seed it.

---

## 3. Backend — Google Apps Script Web App

A container-bound script on the Sheet (Extensions → Apps Script), ~60 lines total.

**Endpoint design (single `doGet`):**

- `GET <webapp-url>` → all entries:

```json
{
  "updatedAt": "2026-08-20",
  "entries": [
    { "id": 1, "category": "Individual", "section": "", "fullName": "Abegael Santos", "localNo": "7553" },
    { "id": 61, "category": "Office/Area", "section": "PHEP", "fullName": "Guard Lobby (PHEP Phone Operator)", "localNo": "7500-7502" }
  ]
}
```

**Implementation notes:**

- Read with `SpreadsheetApp.openById(...).getSheetByName('Directory').getDataRange().getValues()`, map header row → object keys.
- Wrap the JSON string in `ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON)`. GAS web apps allow cross-origin GET requests for anonymous access, so the frontend can `fetch()` it directly.
- **Cache:** store the serialized JSON in `CacheService.getScriptCache()` for ~300 s; serve from cache when present. An `onEdit` trigger (or just cache expiry) keeps it reasonably fresh.
- **Deploy:** Deploy → New deployment → Web app → Execute as **Me**, access **Anyone**. This gives a stable `https://script.google.com/macros/s/<id>/exec` URL. (Only the JSON output is public — the Sheet itself stays private.)
- Keep the script source in the repo under `apps-script/` and push with **clasp** so it's version-controlled alongside the frontend.

---

## 4. Frontend — React + Vite + Tailwind + shadcn/ui

**Stack:** Vite + React + TypeScript, Tailwind CSS v4, shadcn/ui components.

**Proposed structure:**

```
fghpc-directory/
├── apps-script/            # GAS backend source (clasp)
│   ├── Code.gs
│   └── appsscript.json
├── web/                    # Vite React app
│   ├── src/
│   │   ├── components/     # shadcn components + directory UI
│   │   ├── lib/api.ts      # fetch + parse the GAS endpoint
│   │   ├── lib/types.ts    # DirectoryEntry type
│   │   └── App.tsx
│   └── ...
├── Local_Directoryy _20Aug2026.csv   # seed data
└── PLAN.md
```

**UI plan (shadcn components in parentheses):**

- **Header** — FGHPC branding, title "Local Directory", last-updated date.
- **Search bar** (`Input` + `Command`-style filtering) — matches name, section, or extension number as you type.
- **Category tabs** (`Tabs`): *All* / *Individuals* / *Offices & Areas*.
- **Section filter** (`Select` or `Badge` chips) — Housing Compound, CHEP, MHEP, PHEP; shown when viewing Offices & Areas.
- **Results** (`Table` on desktop, `Card` list on mobile) — Name, Section badge, and the extension displayed prominently as a click-to-dial `tel:` link (useful on phones/softphones).
- **States**: loading `Skeleton`, "no results" empty state, and an error state with retry if the GAS endpoint is unreachable.
- **Extras (cheap wins):** alphabetical grouping for individuals, copy-extension button, dark mode (shadcn supports it out of the box).

**Data flow:** on load, fetch the GAS URL → store entries in state → all search/filter/sort happens client-side. Optionally cache the last payload in `localStorage` so returning visitors see data instantly while a fresh fetch happens in the background.

---

## 5. Deployment

1. **Sheet** — lives in the admin's Google Drive; share edit access only with maintainers.
2. **GAS** — deployed as web app (URL is the API). Re-deploys only needed when the script changes, not when data changes.
3. **Frontend** — GitHub repo with GitHub Actions building the Vite app to GitHub Pages (or connect the repo to Vercel/Netlify for zero-config deploys). The GAS URL goes in an env var (`VITE_API_URL`).

**Updating the directory day-to-day:** edit the Sheet → within the cache window (~5 min) the site shows the new data. No code, no redeploys.

---

## 6. Build Phases

**Phase 1 — Database (½ day)**
- Create the Sheet, import the CSV, add validation dropdowns, format Local No. as text.

**Phase 2 — API (½ day)**
- Write `doGet` + caching, deploy as web app, verify the JSON in a browser.

**Phase 3 — Frontend core (1–2 days)**
- Scaffold Vite + Tailwind + shadcn, build fetch layer, search, tabs, section filters, table/card views, loading & error states.

**Phase 4 — Polish & deploy (½–1 day)**
- Mobile layout, `tel:` links, dark mode, empty states; deploy to GitHub Pages/Vercel; test on a phone on the office network.

**Phase 5 — Nice-to-haves (later, optional)**
- Print-friendly view (paper directory export), PWA/offline support so the directory works without signal, department/photo columns, QR code poster linking to the site.

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| GAS cold start makes first load slow (1–3 s) | CacheService on the backend + localStorage cache on the frontend + skeleton UI. |
| GAS daily quotas (URL Fetch/exec limits on free accounts) | Client-side filtering means ~1 API call per visitor per session — quotas are a non-issue at this scale. |
| Sheet edited into a bad state (wrong category text, blank extension) | Data validation dropdowns + the API skips rows with no Full Name or Local No. |
| GAS web app URL changes | Only changes if you create a *new* deployment instead of updating the existing one — always use "Manage deployments → Edit" to keep the URL stable. |
| Directory data is internal (names + extensions are technically public via the API URL) | The URL is unguessable but not authenticated. If that's a concern, options later: obscure URL only (accepted risk), or move hosting behind Google Sites/Workspace-restricted access. Decide before launch. |
