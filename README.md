# Knowledge Base — Confluence-like Wrapper for Google Workspace

A web app built with Google Apps Script that provides a Confluence-like navigation experience on top of Google Drive and Docs.

## Features

- **Spaces** — organize Google Drive folders as knowledge base spaces
- **Page Tree** — browse hierarchical folder/doc structures with lazy loading
- **Search** — full-text search across all spaces powered by Drive API
- **Tags** — label pages with tags (backed by Google Sheets)
- **Favorites** — star pages for quick access
- **Activity Feed** — see recently modified documents
- **Click-through** — all editing happens in Google Docs/Sheets/Slides

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Google Clasp](https://github.com/google/clasp) CLI
- A Google Workspace account

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Login to Clasp:**
   ```bash
   npx clasp login
   ```

3. **Create the Apps Script project:**
   ```bash
   npx clasp create --type webapp --title "Knowledge Base" --rootDir src
   ```
   This creates `.clasp.json` with your script ID.

4. **Enable the Drive Advanced Service:**
   - Open the script in the Apps Script editor: `npx clasp open`
   - Go to **Services** (+ icon) and enable **Google Drive API v3**

5. **Push the code:**
   ```bash
   npm run push
   ```

6. **Deploy as web app:**
   - In the Apps Script editor, click **Deploy > New deployment**
   - Select **Web app**
   - Set **Execute as**: "User accessing the web app"
   - Set **Who has access**: "Anyone within your organization" (or as needed)
   - Click **Deploy**

7. **Create sample data:**
   - Open the deployed web app
   - Click "Create Sample Space" on the dashboard to generate a sample folder structure

## Development

```bash
# Watch for changes and auto-push
npm run watch

# View logs
npm run logs

# Open the web app
npm run open

# Deploy a new version
npm run deploy
```

## Project Structure

```
src/
├── appsscript.json          # GAS manifest
├── main.ts                  # Entry point (doGet, include)
├── server/
│   ├── config.ts            # Space registry, setup
│   ├── spaces.ts            # Space listing
│   ├── pages.ts             # Page tree traversal
│   ├── search.ts            # Drive search
│   ├── activity.ts          # Recent activity
│   ├── tags.ts              # Sheet-backed tags
│   └── favorites.ts         # User favorites
├── ui/
│   ├── index.html           # App shell
│   ├── css/styles.html      # All CSS
│   └── js/
│       ├── app.html         # Router + app init
│       ├── api.html         # Server API wrapper
│       ├── components.html  # UI components
│       └── utils.html       # Helpers
└── shared/
    └── types.ts             # TypeScript interfaces
```

## Architecture

- **Routing**: Hash-based client-side routing (`#dashboard`, `#space/{id}`, `#search?q=...`)
- **Auth**: Runs as the accessing user — inherits Google Drive permissions
- **Tags**: Stored in a Google Sheet for queryability
- **Favorites**: Stored in user-scoped Properties Service
- **Page tree**: Lazy-loaded one level at a time to stay under GAS execution limits
