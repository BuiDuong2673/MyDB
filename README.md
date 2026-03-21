# MyDB

**The AI travel advisor that finds the perfect train for your journey.**

A [Next.js](https://nextjs.org/) chat app with a Deutsche Bahn–inspired UI. The browser calls **`POST /api/chat`** on the Next.js server, which **proxies** the request to a **Python (FastAPI)** service that calls Google Gemini. The API key stays on the Python process (and in `.env` / `.env.local`); the client never sees it. Conversations and settings are still mocked in the UI with hooks ready for a real database.

---

## Repository map

### Root

| File | Role |
|------|------|
| `package.json` | Project metadata, npm scripts (`dev`, `dev:backend`, `build`, `start`, `lint`), and dependency list. |
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
| `app/api/chat/route.ts` | `POST` handler: forwards the JSON body to the Python service at `PYTHON_BACKEND_URL` (same-origin for the browser — no CORS). Returns the upstream status and body. |

### `backend/`

| File | Role |
|------|------|
| `backend/main.py` | FastAPI app: `POST /api/chat` (same contract as `lib/api.ts`), `GET /health`. Calls Gemini via `google-generativeai`; reads `GEMINI_API_KEY` from the environment (loads repo-root `.env` / `.env.local`). |
| `backend/requirements.txt` | Python dependencies (FastAPI, Uvicorn, Gemini SDK, python-dotenv). |

### `lib/` — Shared logic & types

| File | Role |
|------|------|
| `lib/types.ts` | TypeScript types: `Message`, `ChatConversation`, `UserProfile`, `AppSettings`. |
| `lib/utils.ts` | Helpers: `cn()` for class names, `formatTimestamp()`, `generateId()`. |
| `lib/api.ts` | Client-side API layer: mock user/conversations/settings, `sendMessageToAI` → same-origin `/api/chat` (proxied to Python), and placeholder streaming. |

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
2. **Set `PYTHON_BACKEND_URL`** to the Python API base URL (default in `.env.example`: `http://127.0.0.1:8000`). Next.js uses this **server-side only** to proxy `/api/chat`.
3. **Set `GEMINI_API_KEY`** to your Google Gemini API key ([AI Studio](https://aistudio.google.com/apikey)). It is read by the **Python** process (`backend/main.py`), not by the browser.
4. **Restart** both the Next.js and Python dev processes after changing env files.

---

## Python backend

Install dependencies once (a virtual environment under `backend/` is recommended):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Start the API (from the `backend/` directory, with the venv activated):

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Or from the **repository root**: `npm run dev:backend` (uses your default `python` / `python3`; install `requirements.txt` into that environment first).

The Google `google-generativeai` Python package shows a deprecation notice in some versions; migrating to the newer `google-genai` SDK is optional and can be done later.

---

## Run locally

You need **two terminals**: Python API first, then Next.js.

**Terminal 1 — Python**

```bash
cd backend && source .venv/bin/activate && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Next.js**

```bash
npm install
# Configure .env.local or .env (see "Environment variables" above)
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:3000`).
