"use client";

import { TrainFront, MoreVertical, Share, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  /** Main app name shown in the header */
  title?: string;
  /** Optional line under the title (e.g. active conversation name) */
  subtitle?: string;
  /** When false on small screens, the sidebar toggle is fixed top-left; offset the train so they do not overlap. */
  sidebarOpen?: boolean;
  onClearChat?: () => void;
}

export function ChatHeader({
  title = "MyDB",
  subtitle,
  sidebarOpen = true,
  onClearChat,
}: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="relative flex min-h-[52px] items-center justify-end px-4 py-3 border-b border-border bg-card shadow-sm">
      <div
        className={cn(
          "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-primary shadow-sm",
          /* Desktop: open-sidebar control sits in the flex row before main — default inset is fine. */
          "left-4",
          /* Mobile: toggle is fixed left-4 (16px) + 40px button; start the train after it with a small gap. */
          !sidebarOpen && "max-md:left-[3.75rem]"
        )}
        aria-hidden
      >
        <TrainFront className="h-4 w-4 text-primary-foreground" />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-20">
        <div className="pointer-events-auto max-w-[min(100%,calc(100vw-12rem))] text-center">
          <h1 className="font-semibold text-base tracking-tight text-foreground">
            {title}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {subtitle ?? "AI travel advisor"}
          </p>
        </div>
      </div>

      <div className="relative z-10 ml-auto flex items-center gap-1">
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
