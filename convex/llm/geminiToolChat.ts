import { executeAgentTool } from "../agents/registry";
import { agentFunctionDeclarations } from "../agents/toolDeclarations";
import type { AgentInput, ChatMessage } from "../agents/types";
import {
  buildGeminiGenerateUrl,
  generationConfigFromSettings,
  getGeminiApiKey,
  sanitizeModel,
} from "./geminiShared";

const MAX_TOOL_ROUNDS = 8;

const SYSTEM_INSTRUCTION = `You are MyDB, a helpful rail-travel assistant for Germany and Europe.

You may call the provided tools to retrieve factual information that must not be guessed (routes, stations, schedules, ticket rules). When the user's message is unclear or missing required details (e.g. origin, destination, date, time window), do not call tools—respond with a short, polite question in plain text to get what you need.

After a tool returns data, incorporate it into a clear, concise answer for the user.`;

type GeminiPart = {
  text?: string;
  functionCall?: {
    name?: string;
    args?: unknown;
    id?: string;
  };
  functionResponse?: {
    name: string;
    id?: string;
    response: Record<string, unknown>;
  };
};

type GeminiContent = {
  role: string;
  parts: GeminiPart[];
};

type GenerateResponse = {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

function chatMessagesToContents(messages: ChatMessage[]): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

function parseFunctionArgs(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
    return {};
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

async function postGenerate(
  url: string,
  body: Record<string, unknown>
): Promise<GenerateResponse> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Failed to reach Gemini API. Check network connectivity.");
  }

  const data = (await res.json()) as GenerateResponse;
  if (!res.ok) {
    const msg =
      data.error?.message ??
      (typeof data === "object" ? JSON.stringify(data) : "Unknown error");
    throw new Error(`Gemini API request failed (${res.status}): ${msg}`);
  }
  return data;
}

function hasFunctionCall(parts: GeminiPart[]): boolean {
  return parts.some((p) => p.functionCall != null && p.functionCall.name);
}

function extractText(parts: GeminiPart[]): string {
  return parts
    .map((p) => ("text" in p ? (p.text ?? "") : ""))
    .join("")
    .trim();
}

/**
 * Multi-turn Gemini chat with AUTO function calling: model may answer in text
 * (e.g. ask for clarification) or call agent tools; tool results are sent back until final text.
 */
export async function runGeminiToolChat(
  input: AgentInput
): Promise<{ text: string }> {
  const apiKey = getGeminiApiKey();
  const model = sanitizeModel(input.settings?.model);
  const url = buildGeminiGenerateUrl(model, apiKey);

  const contents: GeminiContent[] = chatMessagesToContents(input.messages);

  const baseBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    tools: [{ functionDeclarations: agentFunctionDeclarations }],
    toolConfig: {
      functionCallingConfig: {
        mode: "AUTO",
      },
    },
    generationConfig: generationConfigFromSettings(input.settings),
  };

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const data = await postGenerate(url, { ...baseBody, contents });

    if (data.promptFeedback?.blockReason) {
      throw new Error(
        `Gemini blocked the prompt (${data.promptFeedback.blockReason}).`
      );
    }

    const candidate = data.candidates?.[0];
    if (!candidate?.content?.parts?.length) {
      throw new Error("Gemini returned no content.");
    }

    const finish = candidate.finishReason;
    if (finish === "SAFETY" || finish === "RECITATION") {
      throw new Error(`Gemini stopped (${finish}).`);
    }

    const modelContent = candidate.content;
    const parts = modelContent.parts;

    if (!hasFunctionCall(parts)) {
      const text = extractText(parts);
      if (!text) {
        throw new Error("Gemini returned an empty text response.");
      }
      return { text };
    }

    contents.push(modelContent);

    const responseParts: Array<{
      functionResponse: {
        name: string;
        id?: string;
        response: Record<string, unknown>;
      };
    }> = [];

    for (const part of parts) {
      const fc = part.functionCall;
      if (fc == null || !fc.name) continue;

      const args = parseFunctionArgs(fc.args);
      const result = await executeAgentTool(fc.name, args, input);
      responseParts.push({
        functionResponse: {
          name: fc.name,
          ...(fc.id != null ? { id: fc.id } : {}),
          response: { text: result.text },
        },
      });
    }

    if (responseParts.length === 0) {
      throw new Error("Gemini returned function-call parts without a valid name.");
    }

    contents.push({
      role: "user",
      parts: responseParts,
    });
  }

  throw new Error(
    `Exceeded maximum tool rounds (${MAX_TOOL_ROUNDS}). Try a simpler question.`
  );
}
