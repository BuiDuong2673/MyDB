/**
 * Gemini function declarations for agent tools. Names must match `registry.ts`.
 */
export const RETRIEVE_SPECIALIZED_INFORMATION = "retrieve_specialized_information";

export const agentFunctionDeclarations = [
  {
    name: RETRIEVE_SPECIALIZED_INFORMATION,
    description:
      "Retrieve factual, specialized information from the internal knowledge subsystem (routes, stations, schedules, policies). " +
      "Call this when the user needs concrete data you should not invent. " +
      "If the user's request is ambiguous or missing critical details (origin, destination, date, etc.), do NOT call this tool—reply in plain text with a short clarifying question instead.",
    parameters: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description:
            "What to look up: paraphrase the user's information need in a short phrase.",
        },
      },
    },
  },
];
