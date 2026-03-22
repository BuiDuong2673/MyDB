import { runGeminiToolChat } from "../llm/geminiToolChat";
import type { AgentInput, AgentResult } from "./types";

/** Gemini-first: model may call agent tools or ask clarifying questions in plain text. */
export async function runChatOrchestrator(
  input: AgentInput
): Promise<AgentResult> {
  return runGeminiToolChat(input);
}
