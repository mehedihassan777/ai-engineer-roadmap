# AI Engineer Roadmap

A personal, 24-week roadmap tracker for becoming an AI engineer who ships production-grade AI-integrated and agent-driven systems — built on a .NET / distributed-systems background.

- Next.js (App Router) · TypeScript (strict) · Tailwind CSS · no backend
- Progress is saved in `localStorage`; Export/Import JSON keeps it safe
- All roadmap content is typed data under `src/data/`, separate from the UI

> Work in progress — see `CLAUDE.md` for the structure, conventions and build status. This README is completed in the final stage.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm start`.

Always open the app from the same address (e.g. `http://localhost:3000`): `localStorage` is per-origin, so a different port or host starts with empty progress. Use Settings → Export regularly.
