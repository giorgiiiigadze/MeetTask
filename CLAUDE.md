@AGENTS.md

# MeetTask Codebase Guide

MeetTask (internal package name: `nova`) is a Next.js 16 app for meeting transcription and AI-powered task extraction. It integrates with AssemblyAI for real-time transcription, Supabase for auth/database, and supports OAuth connections to Notion and Linear.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.6 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (PostCSS plugin) |
| Components | shadcn/ui + Radix UI |
| Database/Auth | Supabase (PostgreSQL) |
| Transcription | AssemblyAI streaming |
| Integrations | Notion, Linear (OAuth) |
| Animations | GSAP 3 |
| Theme | next-themes (dark/light) |

## Directory Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (theme provider, Inter font)
│   │   ├── page.tsx            # Root page
│   │   ├── globals.css         # Tailwind v4 entry + CSS custom properties
│   │   ├── fonts.css           # Satoshi and Zodiak font face declarations
│   │   ├── auth/
│   │   │   ├── login/page.tsx  # Email/password + Google OAuth login
│   │   │   └── callback/route.ts # Supabase OAuth callback handler
│   │   ├── api/
│   │   │   ├── transcribe/     # POST: save transcript to Supabase
│   │   │   ├── extract/        # POST: task extraction (stubbed)
│   │   │   ├── tasks/          # CRUD: task management (stubbed)
│   │   │   ├── upload/         # POST: file upload
│   │   │   ├── assemblyai/token/ # GET: generate streaming token
│   │   │   └── integrations/
│   │   │       ├── notion/     # auth, callback, pages endpoints
│   │   │       └── linear/     # auth, callback endpoints
│   │   └── (dashboard)/        # Route group — protected pages
│   │       ├── layout.tsx      # Dashboard shell (sidebar + header)
│   │       ├── home/
│   │       ├── new/            # Start new meeting/upload
│   │       ├── processing/     # Live transcription view
│   │       ├── review/[meetingId]/
│   │       ├── success/
│   │       ├── test/
│   │       └── settings/
│   │           ├── layout.tsx  # Settings sidebar
│   │           ├── general/
│   │           ├── account/
│   │           ├── billing/
│   │           ├── privacy/
│   │           └── integrations/ # Notion / Linear connection UI
│   ├── components/
│   │   ├── ui/                 # Shared UI primitives
│   │   ├── layout/
│   │   │   ├── Header/Header.tsx
│   │   │   └── Sidebar/        # Sidebar.tsx, SidebarContext.tsx, etc.
│   │   └── theming/providers.tsx # next-themes wrapper
├── lib/
│   ├── server.ts               # createClient() — server-side Supabase
│   ├── client.ts               # createClient() — browser Supabase
│   ├── utils.ts                # cn() — clsx + tailwind-merge
│   ├── format.ts               # Date formatting helpers
│   └── integrations.ts         # fetch/disconnect integration helpers
├── hooks/
│   ├── useLiveTranscription.tsx # AssemblyAI real-time hook
│   ├── use-current-user-image.ts
│   └── use-current-user-name.ts
└── public/
    └── fonts/                  # Satoshi, Zodiak font files
```

## Development

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

No test runner is configured.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # Used for server-side Supabase client
NEXT_PUBLIC_SUPABASE_ANON_KEY=          # Used for client-side Supabase client
ASSEMBLYAI_API_KEY=
NOTION_CLIENT_ID=
NOTION_REDIRECT_URI=
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=
```

## Next.js 16 — Critical Differences

This project uses **Next.js 16**, which has breaking changes from v13/14/15. Before writing any route, component, or config, read the relevant doc:

```
node_modules/next/dist/docs/
```

Key things that differ from earlier versions:
- `cookies()` from `next/headers` is now **async** — always `await cookies()`
- The `params` prop in dynamic routes is also **async** — always `await params`
- Middleware, layout, and streaming APIs may behave differently — check the docs

## Supabase

### Server-side (Server Components, Route Handlers)

```ts
import { createClient } from '@/lib/server'
const supabase = await createClient()
```

Always create a new client per request — do not store it in a module-level variable (Fluid compute).

### Client-side (Client Components)

```ts
import { createClient } from '@/lib/client'
const supabase = createClient()
```

### Database Tables

| Table | Key Columns |
|-------|-------------|
| `transcripts` | `user_id`, `content`, `title`, `language`, `duration_secs`, `source`, `source_url`, `metadata` |
| `integrations` | `user_id`, `provider`, `access_token`, `workspace_name`, `workspace_icon`, `last_synced` |

No migrations are tracked in the repo — schema is managed through the Supabase dashboard.

## Authentication

- Provider: Supabase Auth
- Methods: email/password, Google OAuth
- Login page: `src/app/auth/login/page.tsx`
- OAuth callback handler: `src/app/auth/callback/route.ts`
- Sessions are cookie-based via `@supabase/ssr`
- Dashboard routes under `(dashboard)/` should verify the user session in their layout or page

## Styling

Tailwind CSS v4 is configured via the PostCSS plugin (`@tailwindcss/postcss`) — there is no `tailwind.config.ts` file. All theme customization is in CSS custom properties inside `src/app/globals.css`.

### CSS Variable Naming

```css
--color-ui-blue-{50|75|100|200|300|400|500|600|700}
--color-gray-{0|50|100|200|300|400|500|600|700|800|900}
--color-tgray-{50|100|200|300|400|500|600|700}   /* transparent grays */
--color-{red|orange|yellow|green|teal|purple|pink|brown}-{50|500|600|700}
```

Dark mode is applied with the `dark` class on `<html>` (managed by next-themes, `data-theme` attribute) and matched in CSS via `@custom-variant dark (&:is(.dark *))`.

### `cn()` Utility

Use `cn()` from `@/lib/utils` for all conditional classname composition:

```ts
import { cn } from '@/lib/utils'
// cn wraps clsx + tailwind-merge
```

### Fonts

- `--font-sans`: Inter (loaded via `next/font/google` in root layout)
- Satoshi and Zodiak are declared in `src/app/fonts.css` and available as CSS variables

## Component Conventions

- UI primitives live in `src/components/ui/` — prefer extending these over creating new one-offs
- Layout components (Sidebar, Header) are in `src/components/layout/`
- Sidebar open/close state lives in `SidebarContext` — consume via the context hook, do not manage sidebar state locally
- Icon library: `lucide-react` (primary), `react-icons` (secondary), `simple-icons` (brand logos)

## API Route Conventions

All routes use the Next.js App Router format (`route.ts` with exported named handlers):

```ts
// src/app/api/example/route.ts
export async function POST(request: Request) { ... }
```

- Authenticate by calling `createClient()` from `@/lib/server` and checking `supabase.auth.getUser()`
- Return JSON responses with appropriate HTTP status codes
- The `/api/extract` and `/api/tasks` routes are currently stubbed

## Integrations

### AssemblyAI

Real-time transcription is handled by `hooks/useLiveTranscription.tsx`. The `/api/assemblyai/token` route generates a short-lived token for client-side streaming. The API key must stay server-side.

### Notion & Linear

OAuth flows follow the same pattern:
1. `/api/integrations/{provider}/auth` — redirect to provider's OAuth consent screen
2. `/api/integrations/{provider}/callback` — exchange code for token, store in `integrations` table
3. Integration status and disconnect UI is in `src/app/(dashboard)/settings/integrations/`

## Path Aliases

`@/*` resolves to the repo root (not `src/`):

```ts
import { cn } from '@/lib/utils'        // → /lib/utils.ts
import { createClient } from '@/lib/server' // → /lib/server.ts
```

Note: `src/app/` and `src/components/` are under `src/`, but `lib/` and `hooks/` are at the **root level**.
