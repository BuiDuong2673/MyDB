import { action } from "./_generated/server";
import { v } from "convex/values";
import { runChatOrchestrator } from "./agents/orchestrator";

export const sendChat = action({
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
    const filtered = messages.filter(
      (m) =>
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        (m.role === "user" || m.role === "assistant")
    );
    if (filtered.length === 0) {
      throw new Error("No valid messages were provided.");
    }

    return runChatOrchestrator({ messages: filtered, settings });
  },
});
