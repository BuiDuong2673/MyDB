"use client";

import { cn } from "@/lib/utils";
import { Send, StopCircle } from "lucide-react";
import {
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { CHAT_MESSAGE_BODY_TYPOGRAPHY } from "@/lib/chat-message-body";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  placeholder = "Message MyDB...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    adjustHeight();
  };

  const handleSend = () => {
    if (value.trim() && !disabled && !isLoading) {
      onSend(value.trim());
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div
          className={cn(
            "flex items-end gap-2 bg-secondary rounded-2xl border border-input p-2 transition-colors",
            "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring"
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent placeholder:text-muted-foreground",
              "focus:outline-none py-2 px-1 max-h-[200px]",
              CHAT_MESSAGE_BODY_TYPOGRAPHY
            )}
          />

          {isLoading ? (
            <Tooltip content="Stop generating">
              <Button
                variant="ghost"
                size="icon"
                onClick={onStop}
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                aria-label="Stop generating"
              >
                <StopCircle className="w-5 h-5" />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip content="Send message">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSend}
                disabled={!value.trim() || disabled}
                className="shrink-0"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </Button>
            </Tooltip>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-3">
          AI Assistant can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
