# MyDB

**The AI travel advisor that finds the perfect train for your journey.**

A [Next.js](https://nextjs.org/) chat app with a Deutsche Bahn–inspired UI. The client talks to Google Gemini through a server-side API route; conversations and settings are mocked today with hooks ready for a real backend.

---

## Repository map

### Root

| File | Role |
|------|------|
| `package.json` | Project metadata, npm scripts (`dev`, `build`, `start`, `lint`), and dependency list. |
| `package-lock.json` | npm lockfile: exact dependency tree for reproducible installs. |
| `pnpm-lock.yaml` | pnpm lockfile: same purpose if you use pnpm instead of npm. |
| `next.config.ts` | Next.js configuration (e.g. React Compiler). |
| `tsconfig.json` | TypeScript compiler options and path alias `@/*` → project root. |
| `postcss.config.mjs` | PostCSS pipeline: wires Tailwind CSS v4 via `@tailwindcss/postcss`. |
| `next-env.d.ts` | Auto-generated Next.js type references (do not edit by hand). |
| `requirements.txt` | Flat list of npm packages (mirrors `package.json`); use with the install command below. |
| `.env.example` | **Tracked template:** which environment variables exist and what they are for (no secrets). |
| `.env` | **Local only (gitignored):** create by copying `.env.example`, then add your secret values (never commit). |
| `.gitignore` | Files and folders ignored by Git (env files, `node_modules`, `.next`, logs, editor junk). |
| `LICENSE` | Legal license for the project. |

### `app/` — Routes & global styles

| File | Role |
|------|------|
| `app/layout.tsx` | Root HTML shell: fonts (Geist), metadata, viewport, and global body classes. |
| `app/page.tsx` | Main chat page: wires sidebar, header, canvas, input, settings modal, and toasts. |
| `app/globals.css` | Tailwind v4 import, design tokens (`@theme`), and DB-style light theme variables. |

### `app/api/chat/`

| File | Role |
|------|------|
| `app/api/chat/route.ts` | `POST` handler: validates messages, calls Gemini `generateContent`, returns JSON `{ text }`. Expects `GEMINI_API_KEY` on the server. |

### `lib/` — Shared logic & types

| File | Role |
|------|------|
| `lib/types.ts` | TypeScript types: `Message`, `ChatConversation`, `UserProfile`, `AppSettings`. |
| `lib/utils.ts` | Helpers: `cn()` for class names, `formatTimestamp()`, `generateId()`. |
| `lib/api.ts` | Client-side API layer: mock user/conversations/settings, `sendMessageToAI` → `/api/chat`, and placeholder streaming. |

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

## Environment variables

1. **Copy the template** from `.env.example` to `.env.local` (recommended) or `.env` in the project root.
2. **Set `GEMINI_API_KEY`** to your Google Gemini API key ([AI Studio](https://aistudio.google.com/apikey)).
3. **Restart** the dev server after changing env files.

---

## Run locally

```bash
npm install
# Configure .env.local or .env (see "Environment variables" above)
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:3000`).
