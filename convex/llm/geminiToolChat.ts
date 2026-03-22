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

const SYSTEM_INSTRUCTION = `You are MyDB, a professional travel advisor in Germany. When you need data you do not have or are unsure, call the appropriate agent.

Trip search: tool responses are JSON in the text field (schemaVersion, query, routes with segments and times). Parse it, answer in natural language, and do not paste raw JSON.

Trip lists: unless the user already specifies how many options or a selection strategy, show three routes (earliest arrival as the selection strategy) and ask if they want a different selection strategy
or different number of options.

Reply in concise and beautiful markdown. Format trips like this:
example start:
Option ...: from (starting place) at (starting time) to (destination place) at (destination time) Total Trip Duration: (duration)
* Vehicle name (e.g Train S4): (boarding place) at (boarding time) -> (dropping place) at (dropping time) Trip Duration: (duration) Transfer Duration: (transfer duration)
* Vehicle name (e.g Bus 1): (boarding place) at (boarding time) -> (dropping place) at (dropping time) Trip Duration: (duration) Transfer Duration: (transfer duration)
example end
The language of the answer must be in English.`;

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

function isMaxTokensFinish(finish: string | undefined): boolean {
  return finish === "MAX_TOKENS";
}

const TRUNCATION_HINT =
  "\n\n---\n*The reply was cut off at the output length limit. In Settings, increase **Max tokens** (up to 8192) or ask for a shorter trip summary.*";

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
      let text = extractText(parts);
      if (!text) {
        throw new Error("Gemini returned an empty text response.");
      }

      let finishOut = finish;
      if (isMaxTokensFinish(finishOut)) {
        const gen = generationConfigFromSettings(input.settings);
        if (gen.maxOutputTokens < 8192) {
          const dataRetry = await postGenerate(url, {
            ...baseBody,
            contents,
            generationConfig: {
              ...gen,
              maxOutputTokens: 8192,
            },
          });
          const candR = dataRetry.candidates?.[0];
          if (!dataRetry.promptFeedback?.blockReason && candR?.content?.parts?.length) {
            const partsR = candR.content.parts;
            if (!hasFunctionCall(partsR)) {
              const textR = extractText(partsR);
              if (textR.length > text.length) {
                text = textR;
              }
              finishOut = candR.finishReason;
            }
          }
        }
      }

      if (isMaxTokensFinish(finishOut)) {
        text += TRUNCATION_HINT;
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
