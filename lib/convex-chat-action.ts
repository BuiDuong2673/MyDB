import { makeFunctionReference } from "convex/server";

/** Reference to `convex/chat.ts` → `sendChat` (no codegen required). */
export const sendChatAction = makeFunctionReference<
  "action",
  {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    settings?: { model?: string; temperature?: number; maxTokens?: number };
  },
  { text: string }
>("chat:sendChat");
