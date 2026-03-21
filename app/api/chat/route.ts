import { NextResponse } from "next/server";

/**
 * Proxies POST /api/chat to the Python backend (same JSON body as `lib/api.ts` sends).
 * The browser stays same-origin (`/api/chat`); only Next.js calls Python — no CORS for the client.
 * Set `PYTHON_BACKEND_URL` (e.g. http://127.0.0.1:8000). The Python process holds `GEMINI_API_KEY`.
 */
export async function POST(request: Request) {
  const base = process.env.PYTHON_BACKEND_URL?.trim();
  if (!base) {
    return NextResponse.json(
      {
        error:
          "Missing PYTHON_BACKEND_URL. Start the Python API (see README) and set PYTHON_BACKEND_URL in .env.local.",
      },
      { status: 503 }
    );
  }

  const backendUrl = `${base.replace(/\/$/, "")}/api/chat`;
  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach the Python backend. Is it running?" },
      { status: 502 }
    );
  }

  const responseText = await upstream.text();
  const contentType = upstream.headers.get("content-type") ?? "application/json";

  return new NextResponse(responseText, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType,
    },
  });
}
