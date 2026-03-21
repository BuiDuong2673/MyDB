import { Message, ChatConversation, UserProfile, AppSettings } from "./types";
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
    title: "Python best practices",
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
  theme: "dark",
  model: "gemini-pro",
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
// GEMINI API INTEGRATION (Placeholder)
// ============================================

/**
 * Send a message to the Gemini API and get a response
 * @placeholder Replace with actual Gemini API call
 */
export async function sendMessageToAI(
  messages: Message[],
  settings: AppSettings
): Promise<string> {
  // TODO: Replace with actual Gemini API call
  // const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     contents: messages.map(m => ({
  //       role: m.role === 'assistant' ? 'model' : 'user',
  //       parts: [{ text: m.content }],
  //     })),
  //     generationConfig: {
  //       temperature: settings.temperature,
  //       maxOutputTokens: settings.maxTokens,
  //     },
  //   }),
  // });
  // const data = await response.json();
  // return data.candidates[0].content.parts[0].text;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lastMessage = messages[messages.length - 1];
  
  // Return mock responses based on keywords
  if (lastMessage.content.toLowerCase().includes("code")) {
    return `Here's an example code snippet:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}! Welcome to our AI Assistant.\`;
}

// Usage
const message = greet("Developer");
console.log(message);
\`\`\`

This function takes a name parameter and returns a personalized greeting. The template literal syntax makes it easy to embed variables directly in the string.`;
  }

  if (lastMessage.content.toLowerCase().includes("help")) {
    return `I'd be happy to help! Here are some things I can assist you with:

1. **Code Generation** - I can write code in various programming languages
2. **Explanations** - I can explain complex concepts in simple terms
3. **Problem Solving** - I can help debug issues or find solutions
4. **Creative Writing** - I can help with content creation

What would you like to explore today?`;
  }

  return `Thank you for your message! I've processed your request about "${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? "..." : ""}".

This is a simulated response from the AI Assistant. In production, this would be replaced with actual responses from the Gemini API or another language model provider.

The integration is designed to be easily swapped out with real API calls - just update the \`sendMessageToAI\` function in \`lib/api.ts\`.`;
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
