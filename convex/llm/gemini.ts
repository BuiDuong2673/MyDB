import type { AgentSettings, ChatMessage } from "../agents/types";
import {
  buildGeminiGenerateUrl,
  generationConfigFromSettings,
  getGeminiApiKey,
  sanitizeModel,
} from "./geminiShared";

/**
 * Single-turn Gemini generateContent (no tools). For multi-turn agent tools, use `geminiToolChat.ts`.
 */
export async function generateWithGemini(
  filtered: ChatMessage[],
  settings?: AgentSettings
): Promise<{ text: string }> {
  const apiKey = getGeminiApiKey();
  const model = sanitizeModel(settings?.model);
  const geminiUrl = buildGeminiGenerateUrl(model, apiKey);

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
        generationConfig: generationConfigFromSettings(settings),
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
}
