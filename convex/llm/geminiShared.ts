import type { AgentSettings } from "../agents/types";

export const DEFAULT_MODEL = "gemini-2.5-flash";

const MODEL_ALIASES: Record<string, string> = {
  "gemini-2.0-flash": "gemini-2.5-flash",
  "gemini-2.0-flash-lite": "gemini-2.5-flash-lite",
  "gemini-1.5-flash": "gemini-2.5-flash",
  "gemini-1.5-pro": "gemini-2.5-pro",
};

export function sanitizeModel(model?: string): string {
  const raw =
    !model || !model.startsWith("gemini-") ? DEFAULT_MODEL : model.trim();
  return MODEL_ALIASES[raw] ?? raw;
}

export function sanitizeTemperature(temperature?: number): number {
  if (typeof temperature !== "number" || Number.isNaN(temperature)) {
    return 0.7;
  }
  return Math.max(0, Math.min(2, temperature));
}

export function sanitizeMaxTokens(maxTokens?: number): number {
  if (typeof maxTokens !== "number" || Number.isNaN(maxTokens)) {
    return 8192;
  }
  return Math.max(1, Math.min(8192, Math.floor(maxTokens)));
}

export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY on Convex. Add it in Convex Dashboard → Settings → Environment Variables."
    );
  }
  return apiKey;
}

export function buildGeminiGenerateUrl(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

export function generationConfigFromSettings(settings?: AgentSettings) {
  return {
    temperature: sanitizeTemperature(settings?.temperature),
    maxOutputTokens: sanitizeMaxTokens(settings?.maxTokens),
  };
}
