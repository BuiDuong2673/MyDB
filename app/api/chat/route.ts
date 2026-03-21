import { NextResponse } from "next/server";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

interface IncomingSettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

const DEFAULT_MODEL = "gemini-2.5-flash";

/** Older model IDs may 403/404 for new API keys; map to current stable IDs. */
const MODEL_ALIASES: Record<string, string> = {
  "gemini-2.0-flash": "gemini-2.5-flash",
  "gemini-2.0-flash-lite": "gemini-2.5-flash-lite",
  "gemini-1.5-flash": "gemini-2.5-flash",
  "gemini-1.5-pro": "gemini-2.5-pro",
};

function sanitizeModel(model?: string): string {
  const raw =
    !model || !model.startsWith("gemini-") ? DEFAULT_MODEL : model.trim();
  return MODEL_ALIASES[raw] ?? raw;
}

function sanitizeTemperature(temperature?: number): number {
  if (typeof temperature !== "number" || Number.isNaN(temperature)) {
    return 0.7;
  }

  return Math.max(0, Math.min(2, temperature));
}

function sanitizeMaxTokens(maxTokens?: number): number {
  if (typeof maxTokens !== "number" || Number.isNaN(maxTokens)) {
    return 2048;
  }

  return Math.max(1, Math.min(8192, Math.floor(maxTokens)));
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY in server environment." },
      { status: 500 }
    );
  }

  let payload: { messages?: IncomingMessage[]; settings?: IncomingSettings };
  try {
    payload = (await request.json()) as {
      messages?: IncomingMessage[];
      settings?: IncomingSettings;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const messages = Array.isArray(payload.messages)
    ? payload.messages.filter(
        (message) =>
          typeof message?.content === "string" &&
          message.content.trim().length > 0 &&
          (message.role === "user" || message.role === "assistant")
      )
    : [];

  if (messages.length === 0) {
    return NextResponse.json({ error: "No valid messages were provided." }, { status: 400 });
  }

  const model = sanitizeModel(payload.settings?.model);
  const temperature = sanitizeTemperature(payload.settings?.temperature);
  const maxOutputTokens = sanitizeMaxTokens(payload.settings?.maxTokens);

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Gemini API. Check network connectivity." },
      { status: 502 }
    );
  }

  if (!geminiResponse.ok) {
    const errorBody = await geminiResponse.text();
    return NextResponse.json(
      { error: `Gemini API request failed (${geminiResponse.status}): ${errorBody}` },
      { status: 502 }
    );
  }

  const data = (await geminiResponse.json()) as GeminiResponse;
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    return NextResponse.json({ error: "Gemini returned an empty response." }, { status: 502 });
  }

  return NextResponse.json({ text });
}
