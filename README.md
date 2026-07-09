# Prompt Docs — Next.js 16 App Router

Premium documentation-style website for browsing prompts.
All content is **dummy data** in `data/prompts.js` — replace it with your own later.

## Stack
- Next.js 16.3 (App Router)
- JavaScript (no TypeScript)
- Tailwind CSS v4
- Lucide React
- Framer Motion
- Fuse.js (fuzzy search)

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Where to edit content
- `data/prompts.js` — all prompts + categories (dummy).
- `data/site.js` — site title, description, stats.

## Structure
```
app/            # App Router routes + layout
components/     # UI components (Navbar, Sidebar, PromptCard, ...)
data/           # Dummy prompts + site config
hooks/          # useTheme, useCopy, useActiveSection
lib/            # search.js (fuse), utils
styles/         # globals.css (Tailwind v4)
```
