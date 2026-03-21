import { actionGeneric } from "convex/server";
import { v } from "convex/values";

export const sendChat = actionGeneric({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    settings: v.optional(
      v.object({
        model: v.optional(v.string()),
        temperature: v.optional(v.number()),
        maxTokens: v.optional(v.number()),
      })
    ),
  },
  handler: async (_ctx, { messages, settings }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing GEMINI_API_KEY on Convex. Add it in Convex Dashboard → Settings → Environment Variables."
      );
    }

    const filtered = messages.filter(
      (m) =>
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        (m.role === "user" || m.role === "assistant")
    );
    if (filtered.length === 0) {
      throw new Error("No valid messages were provided.");
    }

    const model = sanitizeModel(settings?.model);
    const temperature = sanitizeTemperature(settings?.temperature);
    const maxOutputTokens = sanitizeMaxTokens(settings?.maxTokens);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: filtered.map((message) => ({
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
      throw new Error("Failed to reach Gemini API. Check network connectivity.");
    }

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(
        `Gemini API request failed (${geminiResponse.status}): ${errorBody}`
      );
    }

    const data = (await geminiResponse.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return { text };
  },
});

const DEFAULT_MODEL = "gemini-2.5-flash";

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
