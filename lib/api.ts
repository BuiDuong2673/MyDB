import { Message, ChatConversation, UserProfile, AppSettings } from "./types";
import { sendChatAction } from "./convex-chat-action";
import { generateId } from "./utils";

// ============================================
// MOCK DATA - Replace with actual database calls
// ============================================

const mockConversations: ChatConversation[] = [
  {
    id: "1",
    title: "Getting started with React",
    messages: [],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "2",
    title: "API design patterns",
    messages: [],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
  },
  {
    id: "3",
    title: "Database design patterns",
    messages: [],
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 259200000),
  },
];

const mockUser: UserProfile = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
};

const mockSettings: AppSettings = {
  theme: "light",
  model: "gemini-2.5-flash",
  temperature: 0.7,
  maxTokens: 2048,
};

// ============================================
// CONVEX DATABASE MUTATIONS (Placeholders)
// ============================================

/**
 * Create a new conversation in the database
 * @placeholder Replace with: api.conversations.create
 */
export async function createConversation(title: string): Promise<ChatConversation> {
  // TODO: Replace with Convex mutation
  // return await convex.mutation(api.conversations.create, { title });
  
  const newConversation: ChatConversation = {
    id: generateId(),
    title,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return newConversation;
}

/**
 * Get all conversations for the current user
 * @placeholder Replace with: api.conversations.list
 */
export async function getConversations(): Promise<ChatConversation[]> {
  // TODO: Replace with Convex query
  // return await convex.query(api.conversations.list);
  
  return mockConversations;
}

/**
 * Add a message to a conversation
 * @placeholder Replace with: api.messages.create
 */
export async function addMessage(
  conversationId: string,
  message: Omit<Message, "id" | "timestamp">
): Promise<Message> {
  // TODO: Replace with Convex mutation
  // return await convex.mutation(api.messages.create, { conversationId, ...message });
  
  return {
    ...message,
    id: generateId(),
    timestamp: new Date(),
  };
}

/**
 * Delete a conversation
 * @placeholder Replace with: api.conversations.delete
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  // TODO: Replace with Convex mutation
  // return await convex.mutation(api.conversations.delete, { id: conversationId });
  
  console.log(`Deleting conversation: ${conversationId}`);
}

/**
 * Update conversation title
 * @placeholder Replace with: api.conversations.updateTitle
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  // TODO: Replace with Convex mutation
  // return await convex.mutation(api.conversations.updateTitle, { id: conversationId, title });
  
  console.log(`Updating conversation ${conversationId} title to: ${title}`);
}

// ============================================
// CHAT API — Convex action only (`convex/chat.ts` → Gemini). Set `NEXT_PUBLIC_CONVEX_URL`.
// ============================================

/**
 * Sends chat history to the assistant via the Convex `sendChat` action.
 */
export async function sendMessageToAI(
  messages: Message[],
  settings: AppSettings
): Promise<string> {
  const convexUrl =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_CONVEX_URL?.trim()
      : undefined;

  if (!convexUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL. Run `npm run convex:dev`, copy your deployment URL into .env.local, and set GEMINI_API_KEY in the Convex dashboard."
    );
  }

  const payload = {
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    settings: {
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
    },
  };

  const { ConvexHttpClient } = await import("convex/browser");
  const client = new ConvexHttpClient(convexUrl);
  try {
    const result = await client.action(sendChatAction, payload);
    if (!result?.text) {
      throw new Error("The assistant returned an empty response.");
    }
    return result.text;
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Failed to get a response from the assistant.";
    throw new Error(msg);
  }
}

/**
 * Stream a message response from the AI
 * @placeholder Replace with actual streaming implementation
 */
export async function* streamMessageFromAI(
  messages: Message[],
  settings: AppSettings
): AsyncGenerator<string> {
  // TODO: Replace with actual streaming API call
  // This would use Server-Sent Events or WebSocket for real streaming
  
  const fullResponse = await sendMessageToAI(messages, settings);
  const words = fullResponse.split(" ");
  
  for (const word of words) {
    yield word + " ";
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
}

// ============================================
// USER & SETTINGS
// ============================================

/**
 * Get the current user profile
 * @placeholder Replace with: api.users.current
 */
export async function getCurrentUser(): Promise<UserProfile> {
  // TODO: Replace with actual auth/user query
  return mockUser;
}

/**
 * Get user settings
 * @placeholder Replace with: api.settings.get
 */
export async function getSettings(): Promise<AppSettings> {
  // TODO: Replace with Convex query
  return mockSettings;
}

/**
 * Update user settings
 * @placeholder Replace with: api.settings.update
 */
export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  // TODO: Replace with Convex mutation
  return { ...mockSettings, ...settings };
}
