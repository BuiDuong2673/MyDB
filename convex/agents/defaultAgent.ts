import type { Agent, AgentInput, AgentResult } from "./types";

const DEFAULT_REPLY =
  "Train RE10a often go from Heilbronn to Heidelberg.";

export const defaultAgent: Agent = {
  id: "default",
  async run(_input: AgentInput): Promise<AgentResult> {
    return { text: DEFAULT_REPLY };
  },
};
