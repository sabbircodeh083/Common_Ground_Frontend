# CommonGround — Frontend

A community volunteering platform where organizers can create and manage volunteer events, and participants can discover upcoming events, join them, and track the events they have joined.

> **Live demo:** [https://common-ground-frontend.vercel.app](https://common-ground-frontend.vercel.app)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Backend API](#backend-api)
- [Authentication](#authentication)
- [Styling & Theming](#styling--theming)
- [Deployment](#deployment)

---

## Features

- **Landing page** with a hero banner, stats, recently added events carousel, gallery and newsletter section.
- **Browse upcoming events** — server-filtered to future dates (Asia/Dhaka timezone).
- **Event details** — full event information, organizer info, volunteer capacity, and a Join button that disables when the event is full.
- **Create events** — rich-text description editor, image thumbnail, date/location/category fields with client-side validation and toast feedback.
- **Manage events** — organizers see the events they created and can edit or delete them.
- **Joined events** — participants see every event they have joined and can leave an event.
- **Authentication** — email/password and Google sign-in via Better Auth, with JWT tokens issued for authorized backend calls.
- **Dark / light theme** with the preference persisted in `localStorage` and applied before first paint to avoid flashing.
- **Toast notifications** for success and error states via `react-toastify`.
- **Responsive UI** built with Tailwind CSS v4 and Font Awesome 7 icons.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16.4](https://nextjs.org) (App Router, React Compiler, Cache Components) |
| UI | [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com) |
| Language | TypeScript |
| Auth | [Better Auth](https://better-auth.com) (MongoDB adapter, JWT plugin, Google OAuth) |
| Database | [MongoDB](https://www.mongodb.com) (auth data only — event data lives in the backend API) |
| Notifications | [react-toastify](https://fkhadra.github.io/react-toastify/) |
| Icons | Font Awesome 7 (CDN) |
| Hosting | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A MongoDB database (used by Better Auth)
- A Google OAuth application (for Google sign-in)
- The [CommonGround backend API](../backend_API) running locally (Express + MongoDB, default `http://localhost:8000`)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env   # or create .env manually and fill in the keys below

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** Values prefixed with `NEXT_PUBLIC_` are inlined at build time. Restart `next dev` after editing `.env`.

---

## Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# Better Auth
BETTER_AUTH_SECRET=your-random-32-byte-secret
BETTER_AUTH_URL=http://localhost:3000

# MongoDB (Better Auth database, database name: CommonGround)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/CommonGround

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend API (Express server)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

| Variable | Required | Description |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Yes | Secret used to sign sessions/tokens. |
| `BETTER_AUTH_URL` | Yes | Public URL of this app (used by Better Auth callbacks). |
| `MONGODB_URI` | Yes | MongoDB connection string. The app uses the `CommonGround` database. |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret. |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the CommonGround backend API (no trailing slash). |

> `src/lib/auth.ts` reads these values at module load, so a missing key fails dev/build before any page renders.

---

## Available Scripts

```bash
npm run dev        # Start the development server → http://localhost:3000
npm run build      # Production build (validates Cache Components + TypeScript)
npm start          # Serve the production build
npm run lint       # Run ESLint
```

Type-check manually (generate route types first on a clean checkout):

```bash
npx next typegen && npx tsc --noEmit
```

---

## Project Structure

```text
src/
├── app/
│   ├── api/auth/[...all]/   # Better Auth catch-all route handler
│   ├── events/              # Event listing, details, and create pages
│   ├── editEvent/[EventId]  # Edit an event
│   ├── joinedEvents/        # Events the user has joined
│   ├── manageEvents/        # Events the user organizes
│   ├── log-in/ sign-up/     # Auth pages
│   ├── layout.tsx           # Root layout: session, navbar, footer, toasts, theme
│   ├── page.tsx             # Landing page
│   └── globals.css          # Tailwind v4 theme tokens
├── components/              # UI components (forms, cards, nav, providers, etc.)
└── lib/
    ├── auth.ts              # Better Auth server instance (MongoDB adapter + JWT)
    ├── auth-client.ts       # Better Auth browser client
    └── Token/               # Client & server JWT helpers for backend requests
```

---

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page — banner, stats, recent events, gallery, newsletter |
| `/events` | All upcoming events |
| `/events/[EventId]` | Event details + Join action |
| `/events/create` | Create a new event |
| `/editEvent/[EventId]` | Edit an event (organizer only) |
| `/joinedEvents` | Events the signed-in user has joined |
| `/manageEvents` | Events created by the signed-in user |
| `/log-in`, `/sign-up` | Authentication pages |

---

## Backend API

The app talks to the CommonGround Express API via plain `fetch` from client components. Requests to protected routes include a Better Auth JWT in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Used by |
| --- | --- | --- |
| `GET` | `/events` | Upcoming events list |
| `GET` | `/events-recent6` | Homepage recent events |
| `GET` | `/events/:id` | Event details / edit form |
| `POST` | `/events` | Create event |
| `PUT` | `/events/:id` | Edit event |
| `DELETE` | `/events/:id` | Delete event |
| `POST` | `/joinedEvent` | Join an event |
| `POST` | `/joinedEvent/list` | List a participant's joined events |
| `DELETE` | `/joinedEvent/:id` | Leave a joined event |
| `GET` | `/organizedEvent/list/:participantId` | List events created by an organizer |

The backend lives in the sibling `../backend_API` directory and runs on port `8000` by default (`node index.js`).

---

## Authentication

Authentication is handled by **Better Auth**, mounted at `/api/auth/[...all]`.

- Email/password (minimum 6 characters) and Google OAuth.
- Sessions are cached as JWTs for 24 hours.
- `src/lib/auth-client.ts` hard-codes `baseURL: "http://localhost:3000"` — update it when changing host or port.
- Client components read the session through `useSessionContext()` (from `src/components/SessionProvider.tsx`), which owns the single shared session fetch and `signOut`.
- JWTs for backend API calls come from `getClientJwtToken()` (`src/lib/Token/getClientToken.ts`).

---

## Styling & Theming

- **Tailwind CSS v4** — no `tailwind.config.*` or PostCSS file. Theme tokens (`cream`, `forest`, `sand`, `clay`, `font-serif` = Fraunces) are defined in the `@theme` block of `src/app/globals.css`.
- **Fonts** — Geist, Geist Mono, and Fraunces loaded via `next/font`.
- **Icons** — Font Awesome 7 via CDN; use `fa-solid` / `fa-regular` / `fa-brands` classes.
- **Dark mode** — toggled by `ThemeToggle` and stored under the `cg-theme` key in `localStorage`.
- **Images** — remote images from any host are allowed; local assets live in `public/` (gallery images under `public/Gallery_section_Image`).

---

## Deployment

The frontend is deployed on Vercel:

**[https://common-ground-frontend.vercel.app](https://common-ground-frontend.vercel.app)**

To deploy your own instance:

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Add all [environment variables](#environment-variables) in **Project Settings → Environment Variables**, setting `BETTER_AUTH_URL` to your production URL and `NEXT_PUBLIC_API_URL` to your deployed backend.
4. Add the production callback URL to your Google OAuth credentials.
5. Deploy.
