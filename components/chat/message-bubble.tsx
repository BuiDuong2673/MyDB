"use client";

import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { User, Sparkles } from "lucide-react";
import { CHAT_MESSAGE_BODY_TYPOGRAPHY } from "@/lib/chat-message-body";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 px-4 py-6 group",
        isUser ? "bg-transparent" : "bg-muted/30"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-accent" : "bg-primary"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-accent-foreground" />
        ) : (
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isUser ? "You" : "MyDB"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <div className={CHAT_MESSAGE_BODY_TYPOGRAPHY}>
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-foreground animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
}
