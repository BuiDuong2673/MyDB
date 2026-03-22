export type AgentId = string;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentSettings = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

/** Input passed into the orchestrator and individual agents. */
export type AgentInput = {
  messages: ChatMessage[];
  settings?: AgentSettings;
  /** Arguments from a Gemini `functionCall`, when the agent was invoked as a tool. */
  toolArguments?: Record<string, unknown>;
};

export type AgentResult = {
  text: string;
};

/** Contract for specialized agents (retrieval, drafting, etc.). */
export type Agent = {
  id: AgentId;
  run: (input: AgentInput) => Promise<AgentResult>;
};
