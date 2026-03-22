import { defaultAgent } from "./defaultAgent";
import { RETRIEVE_SPECIALIZED_INFORMATION } from "./toolDeclarations";
import type { Agent, AgentInput, AgentResult } from "./types";

const agentsByToolName: Record<string, Agent> = {
  [RETRIEVE_SPECIALIZED_INFORMATION]: defaultAgent,
};

function normalizeArgs(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export async function executeAgentTool(
  toolName: string,
  args: unknown,
  baseInput: AgentInput
): Promise<AgentResult> {
  const agent = agentsByToolName[toolName];
  if (!agent) {
    throw new Error(`Unknown agent tool: ${toolName}`);
  }
  const toolArguments = normalizeArgs(args);
  return agent.run({
    ...baseInput,
    toolArguments,
  });
}
