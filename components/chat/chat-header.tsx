"use client";

import { Sparkles, MoreVertical, Share, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useState } from "react";

interface ChatHeaderProps {
  title?: string;
  onClearChat?: () => void;
}

export function ChatHeader({ title, onClearChat }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">
              {title || "New Conversation"}
            </h1>
            <p className="text-xs text-muted-foreground">Gemini Pro</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip content="Share">
          <Button variant="ghost" size="icon">
            <Share className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Download">
          <Button variant="ghost" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </Tooltip>

        <div className="relative">
          <Tooltip content="More options">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </Tooltip>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
                <button
                  onClick={() => {
                    onClearChat?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear conversation
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
