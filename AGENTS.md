<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project shape

- Next.js 16 App Router in `src/app`, React 19, Tailwind CSS v4, Better Auth backed by MongoDB.
- `@/*` maps to `src/*` (`tsconfig.json`). Route prop types (`PageProps`, `LayoutProps`) are global; never import them.
- The sibling `../backend_API` is a separate Express app. This frontend has no API client and currently talks to MongoDB only through Better Auth.

## Commands

Use npm (`package-lock.json`). There is no test runner or `typecheck` script; don't guess script names.

- `npm run dev` — http://localhost:3000
- `npm run lint` — ESLint flat config; no arguments needed
- `npx next typegen && npx tsc --noEmit` — generate route types, then typecheck. Run `typegen` first on a clean checkout: `next-env.d.ts` imports generated files.
- `npm run build` — production build; also validates Cache Components constraints

## Environment and auth

- Required `.env` keys: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. `src/lib/auth.ts` reads them at module load, so missing values can break dev/build before a page renders.
- Server auth config: `src/lib/auth.ts` (MongoDB adapter, database `CommonGround`, email/password + Google).
- Client auth: `src/lib/auth-client.ts`; `baseURL` is hard-coded to `http://localhost:3000`, so update it when changing ports/hosts.
- Better Auth endpoints are served by the catch-all `src/app/api/auth/[...all]/route.ts`; keep that path when adding auth config.

## Framework gotchas

- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, React Compiler, and experimental agent feedback. Read the version-matched guide under `node_modules/next/dist/docs/` before adding caching or data fetching; older App Router patterns may be wrong.
- Tailwind v4 has no `tailwind.config.*` or PostCSS file. `src/app/globals.css` uses `@import "tailwindcss"` and `@theme`; CSS is handled by the `@tailwindcss/turbopack` loader declared in `next.config.ts`. Don't add a JS Tailwind config.
- `next-env.d.ts`, `tsconfig.tsbuildinfo`, and `.next/**` are generated/ignored; don't edit them by hand.
