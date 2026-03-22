"use client";

import { useRef, useEffect } from "react";
import type { Message } from "@/lib/types";
import { MessageBubble } from "./message-bubble";
import { EmptyState } from "./empty-state";
import { TypingIndicator } from "./typing-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatCanvasProps {
  messages: Message[];
  isLoading: boolean;
  /** Fills the composer with a prompt template; does not send. */
  onSuggestionSelect: (template: string) => void;
}

export function ChatCanvas({ messages, isLoading, onSuggestionSelect }: ChatCanvasProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <EmptyState onSuggestionSelect={onSuggestionSelect} />;
  }

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && !messages.some((m) => m.isStreaming) && (
          <TypingIndicator />
        )}
        
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
