"use client";

import { cn } from "@/lib/utils";
import type { ChatConversation, UserProfile } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PanelLeftClose,
  PanelLeft,
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  Search,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onToggleCollapse: () => void;
  conversations: ChatConversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  user?: UserProfile;
}

export function Sidebar({
  isOpen,
  isCollapsed,
  onToggle,
  onToggleCollapse,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onOpenSettings,
  user,
}: SidebarProps) {
  if (!isOpen) {
    return (
      <div className="fixed top-4 left-4 z-50 md:relative md:top-0 md:left-0">
        <Tooltip content="Open sidebar" side="right">
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <PanelLeft className="w-5 h-5" />
          </Button>
        </Tooltip>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-72",
        "fixed md:relative inset-y-0 left-0 z-40"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!isCollapsed && (
          <span className="font-semibold text-sm text-primary">MyDB</span>
        )}
        <div className="flex items-center gap-1">
          <Tooltip content="New chat" side="bottom">
            <Button variant="ghost" size="icon" onClick={onNewChat}>
              <Plus className="w-5 h-5" />
            </Button>
          </Tooltip>
          <Tooltip content={isCollapsed ? "Expand" : "Collapse"} side="bottom">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hidden md:flex"
            >
              <PanelLeftClose
                className={cn(
                  "w-5 h-5 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </Tooltip>
          <Tooltip content="Close sidebar" side="bottom">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="md:hidden"
            >
              <PanelLeftClose className="w-5 h-5" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Search (only when expanded) */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Chat History */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {isCollapsed ? (
            conversations.slice(0, 10).map((conv) => (
              <Tooltip key={conv.id} content={conv.title} side="right">
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    "w-full p-2 rounded-lg transition-colors flex items-center justify-center",
                    currentConversationId === conv.id
                      ? "bg-accent"
                      : "hover:bg-muted"
                  )}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </Tooltip>
            ))
          ) : (
            <>
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Recent
              </p>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    currentConversationId === conv.id
                      ? "bg-accent"
                      : "hover:bg-muted"
                  )}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-2 space-y-1">
        {isCollapsed ? (
          <>
            <Tooltip content="Settings" side="right">
              <button
                onClick={onOpenSettings}
                className="w-full p-2 rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
              >
                <Settings className="w-5 h-5" />
              </button>
            </Tooltip>
            {user && (
              <Tooltip content={user.name} side="right">
                <button className="w-full p-2 rounded-lg hover:bg-muted transition-colors flex items-center justify-center">
                  <Avatar fallback={user.name} size="sm" />
                </button>
              </Tooltip>
            )}
          </>
        ) : (
          <>
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Settings</span>
            </button>
            {user && (
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <Avatar fallback={user.name} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
