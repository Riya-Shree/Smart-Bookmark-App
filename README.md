# Markd — Smart Bookmark Manager

> **Live URL:** https://your-app.vercel.app  
> **Repo:** https://github.com/your-username/smart-bookmark-app

A private, real-time bookmark manager built with **Next.js 15 App Router**, **Supabase** (Auth + Postgres + Realtime), and **Tailwind CSS**.

---

## Features

| Feature | Implementation |
|---------|---------------|
| Google OAuth only | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| Add bookmarks (URL + title) | Client-side insert via `@supabase/ssr` browser client |
| Private per user | Postgres Row-Level Security policies on the `bookmarks` table |
| Real-time sync across tabs | `supabase.channel().on('postgres_changes', ...)` filtered by `user_id` |
| Delete bookmarks | Optimistic UI + server delete with rollback on error |
| Deployed on Vercel | `vercel --prod` with env vars configured in dashboard |

---

## Tech Stack

- **Next.js 15** — App Router, Server Components for initial data fetch, Client Components for interactivity
- **Supabase** — Google OAuth, Postgres database, Row-Level Security, Realtime subscriptions
- **Tailwind CSS** — Utility-first styling with custom design tokens
- **TypeScript** — End-to-end type safety
- **Vercel** — Deployment

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/your-username/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**
3. Go to **Authentication → Providers → Google** → enable it
4. Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com):
   - Authorized redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
5. Paste the Client ID and Client Secret into the Supabase Google provider settings

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in the values from **Supabase Dashboard → Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run locally

```bash
npm run dev
# → http://localhost:3000
```

### 5. Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Then in **Vercel Dashboard → Settings → Environment Variables**, add both env vars and redeploy.

**Important:** Update Supabase Auth settings with your Vercel URL:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

Also add `http://localhost:3000` and `http://localhost:3000/auth/callback` for local dev.

---

## Project Structure

```
bookmarks-app/
├── app/
│   ├── auth/callback/route.ts    # Exchanges OAuth code for session
│   ├── bookmarks/page.tsx        # Protected page — SSR initial data fetch
│   ├── globals.css               # Global styles + design tokens
│   ├── layout.tsx                # Root HTML shell + metadata
│   └── page.tsx                  # Login page (redirects authed users)
├── components/
│   ├── AddBookmarkForm.tsx       # Controlled form with validation
│   ├── BookmarkCard.tsx          # Individual bookmark row with actions
│   ├── BookmarksPage.tsx         # Main shell — realtime subscription
│   └── LoginPage.tsx             # Google OAuth login screen
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser-side Supabase client (SSR-safe)
│       └── server.ts             # Server-side client (reads Next.js cookies)
├── supabase/
│   └── schema.sql                # Full DB schema + RLS policies
├── middleware.ts                 # Protects /bookmarks, redirects authed users
├── .env.local.example            # Template for environment variables
└── tailwind.config.ts            # Custom color palette + animations
```

---

## Architecture Decisions

**Server Components for initial fetch, Client Components for interactivity**  
The `/bookmarks` page server-fetches the user's bookmarks before sending HTML to the browser. This means zero loading flash on first paint. Supabase Realtime then takes over client-side for any subsequent changes.

**`getUser()` over `getSession()` in protected routes**  
`getSession()` reads a JWT from the cookie without validating it against Supabase's servers — it can return stale data. `getUser()` makes a network call to verify the JWT is still valid. We use it in middleware and server components to ensure the user is genuinely authenticated.

**RLS as the real security boundary**  
The Postgres RLS policies mean that even if someone obtained the anon key and crafted a direct API request, they could never read or modify another user's bookmarks. The `filter` in the realtime subscription is an optimisation (avoid receiving events for other users' rows), not a security measure.

**Optimistic deletes with rollback**  
When a user deletes a bookmark, we immediately remove it from state for a snappy UX, then delete it from the database. If the DB delete fails (e.g. network error), we re-fetch the full list and restore state.

---

## Problems Encountered & Solutions

### 1. `cookies()` is async in Next.js 15
**Problem:** Next.js 15 made `cookies()` return a `Promise`, breaking the synchronous cookie access pattern that `@supabase/ssr` examples were written for.  
**Solution:** `await`ed the `cookies()` call in `lib/supabase/server.ts` before passing the result to `createServerClient`. This required upgrading to `@supabase/ssr` v0.6+.

### 2. Realtime subscription receiving all users' events
**Problem:** Without a filter, the Postgres Changes subscription fires for every insert/update/delete on the `bookmarks` table — including other users'.  
**Solution:** Added `filter: \`user_id=eq.${user.id}\`` to the subscription options. Combined with RLS, this ensures both security (RLS) and efficiency (only receive relevant events).

### 3. OAuth redirect URL mismatch between localhost and Vercel
**Problem:** The `redirectTo` URL in `signInWithOAuth` uses `window.location.origin`, which works perfectly — it dynamically picks up `http://localhost:3000` in dev and `https://your-app.vercel.app` in prod. The bug was that I only added the Vercel URL to Supabase's allowed redirect list.  
**Solution:** Added both `http://localhost:3000/auth/callback` and `https://your-app.vercel.app/auth/callback` to Supabase **Authentication → URL Configuration → Redirect URLs**.

### 4. Middleware redirect loop
**Problem:** Middleware was redirecting authenticated users from `/` to `/bookmarks`, but the Supabase callback also sends users to `/bookmarks` — this worked fine. The loop happened when I accidentally checked `pathname.startsWith("/")` instead of `pathname === "/"`.  
**Solution:** Used exact match `pathname === "/"` for the login redirect, and `pathname.startsWith("/bookmarks")` for the auth guard.

### 5. Favicon 404s causing broken image icons
**Problem:** Google's favicon service returns a blank placeholder (not a 404) for some domains — so `onError` doesn't fire, and a blank 16×16 image shows instead of the fallback.  
**Solution:** Kept the `onError` fallback to the domain's first letter, and accepted that Google's service works well for the majority of URLs. This is a cosmetic issue with no functional impact.

### 6. Duplicate bookmarks on realtime INSERT after optimistic update
**Problem:** If the client adds a bookmark optimistically AND receives the INSERT event from Realtime, the bookmark appears twice.  
**Solution:** In the `INSERT` case of the realtime handler, checked `if (prev.find(b => b.id === payload.new.id)) return prev` before adding to state. Since UUIDs are generated server-side by Supabase, the IDs will match.

---

Built with Next.js, Supabase, Tailwind CSS, and TypeScript. Deployed on Vercel.  
AI tools used: Claude (architecture guidance + code review). All code written and understood by the developer.
