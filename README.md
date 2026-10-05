# AI Engineer Roadmap

A personal, 24-week roadmap tracker for becoming an AI engineer who ships production-grade AI-integrated and agent-driven systems — built on a .NET / distributed-systems background.

- Next.js (App Router) · TypeScript (strict) · Tailwind CSS
- Progress is saved in the browser and can be exported/imported as JSON
- **Optional cloud sync (Neon Postgres)** so the same progress shows up at home and at the office
- All roadmap content is typed data under `src/data/`, separate from the UI

> Work in progress — see `CLAUDE.md` for the structure, conventions and build status.

## Quick start (local only)

```bash
npm install
npm run dev      # http://localhost:3000
```

Without any configuration the app keeps progress in this browser only. Always open it from the same address: `localStorage` is per-origin, so a different port or host starts empty. Use **Settings → Backup → Export JSON** regularly.

## Cloud sync with Neon (home ⇄ office)

Sync keeps one copy of your progress (tasks, stack topics, definition-of-done items, DSA log, weekly notes, start date) in a Neon database. Every device that has your **sync token** sees the same progress. Edits always save on the device first and upload in the background, so it also works offline; when two devices changed the same item, the one that syncs last wins, except notes, where both versions are kept.

### 1. Create the database
1. Create a free project at [neon.com](https://neon.com).
2. In the Neon console open **Connect** and copy the connection string. The pooled one (host contains `-pooler`) is best for the app; copy the direct one too if you like (used for migrations).

### 2. Configure the app
Create `.env.local` in the project folder (never commit it — `.env*` is git-ignored):

```bash
npm run sync:token        # prints a random 43-character token
```

```
DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://.../neondb?sslmode=require   # optional, for migrations
SYNC_TOKEN=<the value printed by sync:token>
```

### 3. Create the table and check everything

```bash
npm run db:migrate        # creates the sync_state table (safe to run again)
npm run sync:doctor       # checks the env vars, the connection, the table and a write/read round trip
```

### 4. Make the app reachable from both places
Pick one:
- **Deploy (recommended)** — e.g. on Vercel: import the project, and under *Settings → Environment Variables* add `DATABASE_URL` and `SYNC_TOKEN` (same values as above; Vercel's Neon integration can fill in `DATABASE_URL` for you). Redeploy after changing variables. Open the same URL at home and at the office.
- **Run it on both machines** — copy the project (e.g. via a private Git repo) and use the same `.env.local` on each. Each machine's browser syncs through the shared Neon database.

### 5. Connect each device
Open **Settings → Cloud sync**, paste the token, click **Connect this device**. The first time, progress already on that device is merged with the cloud (nothing is deleted; you can undo the merge under **Backup → Restore data from before…**). The sidebar shows the status (`Cloud: Synced`, `Waiting to sync`, `Offline`, …).

### Security notes
- The database URL never reaches the browser; only the server (the `/api/sync` route) talks to Neon.
- Every request must carry the token (`Authorization: Bearer …`); wrong tokens are refused. Use a long random token (`npm run sync:token`) and keep it out of chats and screenshots. **Disconnect this device** removes it from a browser.
- To revoke all devices, change `SYNC_TOKEN` on the server and reconnect the devices you still use.
- Your progress and notes are stored as JSON in your own Neon project.

### Troubleshooting
| Symptom | Fix |
|---|---|
| Settings says "Cloud sync is not set up on this server" | `DATABASE_URL` or `SYNC_TOKEN` is missing on the server, or the token is shorter than 32 characters. On Vercel, redeploy after setting variables. |
| "The database schema is missing" | Run `npm run db:migrate` with the same `DATABASE_URL`. |
| "That token was rejected by the server" | The token differs from the server's `SYNC_TOKEN` (check for spaces). |
| Build fails with `Unexpected token '﻿' … package.json` | `package.json` was saved with a UTF-8 BOM (Windows PowerShell 5.1 `Set-Content -Encoding utf8` does this). Re-save it as UTF-8 **without** BOM. |
| First request after a quiet period is slow | Neon's free tier suspends compute after ~5 minutes idle and wakes in a few hundred milliseconds; sync retries automatically. |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `npm run build` / `npm start` | Develop / build / serve |
| `npm run lint` · `npm run typecheck` · `npm test` | Quality checks (tests include the real sync SQL running on PGlite, an in-process Postgres) |
| `npm run validate:content` | Validate the roadmap content after editing `src/data` |
| `npm run check:links` | Verify every URL in the content |
| `npm run db:migrate` · `npm run sync:doctor` · `npm run sync:token` | Cloud-sync setup helpers |
