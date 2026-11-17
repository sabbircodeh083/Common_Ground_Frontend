<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project shape

- Next.js 16.4.6 App Router in `src/app`, React 19, Tailwind v4, Better Auth + MongoDB. Use npm (`package-lock.json`); there is no test runner or formatter config.
- `@/*` maps to `src/*`. `PageProps`/`LayoutProps` route types are global; never import them.
- `src/app/layout.tsx` wraps every page in `<SessionProvider>` plus `<Navbar>`, `<main>`, `<Footer>` and `<ToastProvider>`; most UI is client components.
- Existing routes: `/`, `/log-in`, `/sign-up`, `/events`, `/events/[EventId]`, `/events/create`, and the auth catch-all. `Navbar` also links to `/events/manage` and `/events/joined`, which are not implemented yet.

## Commands

- `npm run dev` — http://localhost:3000
- `npm run lint` — `eslint` flat config; no arguments needed (was clean as of this writing)
- `npx next typegen && npx tsc --noEmit` — typecheck. `typegen` must come first on a clean checkout because `next-env.d.ts` imports generated files under `.next/types`.
- `npm run build` — production build; validates Cache Components constraints and runs TypeScript.

## Environment and auth

- Required `.env` keys: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, plus `NEXT_PUBLIC_API_URL` (backend, e.g. `http://localhost:8000`). `.env*` is gitignored.
- `src/lib/auth.ts` creates the `MongoClient` and reads env at module load, so missing values break dev/build before a page renders. It uses database `CommonGround` and enables email/password (min 6 chars) + Google.
- Better Auth is served by `src/app/api/auth/[...all]/route.ts`; keep that path when changing auth options.
- `src/lib/auth-client.ts` hard-codes `baseURL: "http://localhost:3000"` — update it when changing host/port. `NEXT_PUBLIC_*` values are inlined at build/start, so restart `next dev` after editing `.env`.
- In client components read the session via `useSessionContext()` from `src/components/SessionProvider.tsx` instead of calling `authClient.useSession()` again; the provider owns the single shared session fetch and `signOut`. `log-in`/`sign-up` call `authClient.signIn.*` / `signUp.email` directly.

## Backend API

- Backend calls are plain `fetch` from client components: `POST ${NEXT_PUBLIC_API_URL}/events` in `CreateEventForm` (payload `{ title, type, date, description, thumbnailUrl, location, organizerId }`, organizerId = Better Auth user id), `GET /events-recent6` in `RecentEvents` (homepage carousel), `GET /events` in `UpcomingEvents`, `GET /events/:id` in `EventDetails`, and `POST /joinedEvent` from the details page's Join button (event payload plus `participantId`/`participantName`/`participantEmail` from `useSessionContext()`). No auth token is sent; the API does not check one.
- `POST /joinedEvent` stores a row in `joinedEvent`, rejects duplicates/full events, and increments the event's `volunteerCount`; the Join button is disabled once `volunteerCount >= numberOfVolunteers`.
- `GET /events` and `/events-recent6` filter to upcoming dates server-side (Asia/Dhaka) and sort ascending; the client components still re-filter/sort defensively. Event documents carry `organizerName`/`organizerEmail`/`organizerImage`, which the details page reads directly.
- The API is the sibling `../backend_API` (Express, `index.js`, default port 8000). Its `package.json` `dev`/`start` scripts point at a missing `src/server.js`; run `node index.js` there instead.
- There is no fetch wrapper, query library, or env validation. Call `fetch` directly and handle a missing `NEXT_PUBLIC_API_URL` as the form does.
- `Gallery`, `Stats`, `Banner`, `Newsletter` render hard-coded data; do not assume they are server-driven.

## Styling

- Tailwind v4: no `tailwind.config.*` or PostCSS file. Theme tokens (`cream`, `forest`, `sand`, `clay`, `font-serif` = Fraunces) live in the `@theme` block of `src/app/globals.css`; custom hex classes are also common in components.
- Icons are Font Awesome 7 loaded via a CDN `<link>` in `layout.tsx`. Use `fa-solid`/`fa-regular`/`fa-brands` classes; don't add an icon package.
- `next.config.ts` allows remote images from any host; use `next/image`. Local assets are in `public/` (gallery images under `public/Gallery_section_Image`).
- Form pages use `noValidate` + manual per-field `errors` state and `react-toastify`; there is no validation library.

## Framework gotchas

- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, React Compiler, `experimental.agentFeedback`, a `**` image allowlist, and the `@tailwindcss/turbopack` CSS loader. Read the version-matched guide under `node_modules/next/dist/docs/` before adding caching or data fetching; older App Router patterns may be wrong.
- Under `cacheComponents`, reading route params with `useParams()` in a client component fails the build unless the component sits inside a `<Suspense>` boundary (see `src/app/events/[EventId]/page.tsx`).
- `CreateEventForm`'s description editor is a raw `contentEditable` + `document.execCommand`; it submits the editor's HTML.
- Generated/ignored: `next-env.d.ts`, `tsconfig.tsbuildinfo`, `.next/**` — never edit by hand.
