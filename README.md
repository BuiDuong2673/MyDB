# MyDB

**The AI travel advisor that finds the perfect train for your journey.**

A [Next.js](https://nextjs.org/) chat app with a Deutsche Bahn–inspired UI. Chat uses **[Convex](https://convex.dev/)**: `lib/api.ts` calls a Convex **action** (`convex/chat.ts`) that talks to Google Gemini. **`GEMINI_API_KEY`** is set in the **Convex** dashboard (not exposed to the browser). **`NEXT_PUBLIC_CONVEX_URL`** in `.env.local` / Vercel points the client at your deployment. Conversations and settings are still mocked in the UI with hooks ready for a real database.

---

## Repository map

### Root

| File | Role |
|------|------|
| `package.json` | Project metadata, npm scripts (`dev`, `convex:dev`, `convex:deploy`, `build`, `start`, `lint`), and dependency list. |
| `package-lock.json` | npm lockfile: exact dependency tree for reproducible installs. |
| `pnpm-lock.yaml` | pnpm lockfile: same purpose if you use pnpm instead of npm. |
| `next.config.ts` | Next.js configuration (e.g. React Compiler). |
| `tsconfig.json` | TypeScript compiler options and path alias `@/*` → project root. |
| `postcss.config.mjs` | PostCSS pipeline: wires Tailwind CSS v4 via `@tailwindcss/postcss`. |
| `next-env.d.ts` | Auto-generated Next.js type references (do not edit by hand). |
| `requirements.txt` | Flat list of npm packages (mirrors `package.json`); use with the install command below. |
| `.env.example` | **Tracked template:** `NEXT_PUBLIC_CONVEX_URL` (no secrets). |
| `.env` | **Local only (gitignored):** create by copying `.env.example`, then add your values (never commit). |
| `.gitignore` | Files and folders ignored by Git (env files, `node_modules`, `.next`, logs, editor junk). |
| `LICENSE` | Legal license for the project. |

### `app/` — Routes & global styles

| File | Role |
|------|------|
| `app/layout.tsx` | Root HTML shell: fonts (Geist), metadata, viewport, and global body classes. |
| `app/page.tsx` | Main chat page: wires sidebar, header, canvas, input, settings modal, and toasts. |
| `app/globals.css` | Tailwind v4 import, design tokens (`@theme`), and DB-style light theme variables. |

### `convex/`

| File | Role |
|------|------|
| `convex/schema.ts` | Convex schema (empty until you add tables). |
| `convex/chat.ts` | Action `sendChat`: same payload as `lib/api.ts`, calls Gemini REST API. **`GEMINI_API_KEY` is set in the Convex dashboard.** |

### `lib/` — Shared logic & types

| File | Role |
|------|------|
| `lib/types.ts` | TypeScript types: `Message`, `ChatConversation`, `UserProfile`, `AppSettings`. |
| `lib/utils.ts` | Helpers: `cn()` for class names, `formatTimestamp()`, `generateId()`. |
| `lib/api.ts` | Client-side API layer: mock user/conversations/settings; `sendMessageToAI` → Convex `chat:sendChat`, plus placeholder streaming. |
| `lib/convex-chat-action.ts` | `makeFunctionReference("chat:sendChat")` for the Convex HTTP client (no `convex codegen` required). |

### `hooks/`

| File | Role |
|------|------|
| `hooks/index.ts` | Re-exports `useChat`, `useSidebar`, and `useToast`. |
| `hooks/use-chat.ts` | Chat state: messages, loading, send/stop/clear, streams assistant text via `lib/api`. |
| `hooks/use-sidebar.ts` | Sidebar open/collapse state and responsive behavior. |
| `hooks/use-toast.ts` | Toast queue: add/remove/clear in-app notifications. |

### `components/chat/`

| File | Role |
|------|------|
| `components/chat/index.ts` | Barrel exports for chat UI pieces. |
| `components/chat/chat-canvas.tsx` | Scrollable message list, empty state, and typing indicator. |
| `components/chat/chat-header.tsx` | Top bar: title, optional subtitle, clear chat. |
| `components/chat/chat-input.tsx` | Composer: send message and stop generation while loading. |
| `components/chat/message-bubble.tsx` | Single message UI (markdown, code highlighting for assistant). |
| `components/chat/empty-state.tsx` | Placeholder when there are no messages yet. |
| `components/chat/typing-indicator.tsx` | “Assistant is typing” animation. |
| `components/chat/sidebar.tsx` | Conversation list, new chat, delete, user block, settings entry. |
| `components/chat/settings-modal.tsx` | Modal to adjust model, temperature, and max tokens. |

### `components/ui/`

| File | Role |
|------|------|
| `components/ui/button.tsx` | Styled button primitive (variants/sizes). |
| `components/ui/avatar.tsx` | User avatar display. |
| `components/ui/scroll-area.tsx` | Scrollable region wrapper. |
| `components/ui/tooltip.tsx` | Tooltip trigger + content. |
| `components/ui/toast.tsx` | Toast list UI consumed with `useToast`. |

### `README.md`

This file: project intro and a short guide to what lives where.

---

## Install packages

**Option A — from `package.json` (default):**

```bash
npm install
```

**Option B — install every package listed in `requirements.txt`:**

```bash
npm install $(grep -v '^#' requirements.txt | grep -v '^$')
```

`package.json` and `package-lock.json` remain authoritative for versions; `requirements.txt` is a readable manifest you can keep in sync when dependencies change.

---

## Convex setup

1. **Link a project:** `npm run convex:dev` (or `npx convex dev`) — log in, create or select a deployment.
2. **Secrets:** In [Convex Dashboard](https://dashboard.convex.dev/) → your deployment → **Settings → Environment Variables**, add **`GEMINI_API_KEY`** ([AI Studio](https://aistudio.google.com/apikey)).
3. **Deploy functions:** `npm run convex:deploy` (or `npx convex deploy`) before or after deploying the Next app.
4. **Next.js / Vercel:** Set **`NEXT_PUBLIC_CONVEX_URL`** to your Convex deployment URL (e.g. `https://happy-animal-123.convex.cloud`).

---

## Environment variables

1. **Copy** `.env.example` to `.env.local` (recommended) or `.env`.
2. Set **`NEXT_PUBLIC_CONVEX_URL`** to your Convex deployment URL (from `convex dev` output or the dashboard).
3. Set **`GEMINI_API_KEY`** in the **Convex** dashboard only (not required in Vercel for the model call).
4. Restart `npm run dev` after changing `.env.local`.

---

## Run locally

**Terminal 1 — Convex** (syncs functions; shows deployment URL):

```bash
npm run convex:dev
```

**Terminal 2 — Next.js**

```bash
npm install
# Add NEXT_PUBLIC_CONVEX_URL to .env.local (see Environment variables)
npm run dev
```

Open `http://localhost:3000`.

**Vercel:** Set **`NEXT_PUBLIC_CONVEX_URL`** in the project environment variables. Run **`npm run convex:deploy`** so production uses the latest Convex functions.
