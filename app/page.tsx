"use client";

import { useState, useCallback, useEffect, useLayoutEffect } from "react";
import { useChat, useSidebar, useToast } from "@/hooks";
import {
  ChatCanvas,
  ChatInput,
  ChatHeader,
  Sidebar,
  SettingsModal,
} from "@/components/chat";
import { ToastContainer } from "@/components/ui/toast";
import type { ChatConversation, UserProfile, AppSettings } from "@/lib/types";
import { getConversations, getCurrentUser, getSettings } from "@/lib/api";
import {
  applyThemeToDocument,
  readStoredTheme,
  THEME_STORAGE_KEY,
} from "@/lib/theme";

export default function ChatPage() {
  // Sidebar state
  const {
    isOpen: sidebarOpen,
    isCollapsed: sidebarCollapsed,
    toggle: toggleSidebar,
    toggleCollapse: toggleSidebarCollapse,
  } = useSidebar();

  // Toast state
  const { toasts, addToast, removeToast } = useToast();

  // App state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [user, setUser] = useState<UserProfile>();
  const [settings, setSettings] = useState<AppSettings>({
    theme: "light",
    model: "gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 8192,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Chat state
  const { messages, isLoading, sendMessage, clearMessages, stopGeneration } =
    useChat({
      settings,
      onError: (err) => {
        addToast({
          type: "error",
          message: err.message || "An error occurred while processing your message",
        });
      },
    });

  const resetComposerAndChat = useCallback(() => {
    clearMessages();
    setInputValue("");
  }, [clearMessages]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [convData, userData, settingsData] = await Promise.all([
          getConversations(),
          getCurrentUser(),
          getSettings(),
        ]);
        setConversations(convData);
        setUser(userData);
        const storedTheme = readStoredTheme();
        setSettings({
          ...settingsData,
          theme: storedTheme ?? settingsData.theme,
        });
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    };
    loadData();
  }, []);

  const handleNewChat = useCallback(() => {
    setCurrentConversationId(undefined);
    resetComposerAndChat();
  }, [resetComposerAndChat]);

  const handleSelectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
    // TODO: Load messages for selected conversation
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        handleNewChat();
      }
      addToast({
        type: "success",
        message: "Conversation deleted",
      });
    },
    [currentConversationId, handleNewChat, addToast]
  );

  const handleUpdateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      if (updates.theme !== undefined) {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next.theme);
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    const stored = readStoredTheme();
    const resolved = stored ?? settings.theme;
    if (stored && stored !== settings.theme) {
      setSettings((s) => ({ ...s, theme: stored }));
    }
    applyThemeToDocument(resolved);
  }, [settings.theme]);

  const handleSendMessage = useCallback(
    (content: string) => {
      void sendMessage(content);
      setInputValue("");
    },
    [sendMessage]
  );

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onToggleCollapse={toggleSidebarCollapse}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setSettingsOpen(true)}
        user={user}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          sidebarOpen={sidebarOpen}
          subtitle={currentConversation?.title}
          onHomeClick={resetComposerAndChat}
          onClearChat={resetComposerAndChat}
        />

        <ChatCanvas
          messages={messages}
          isLoading={isLoading}
          onSuggestionSelect={setInputValue}
        />

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          onStop={stopGeneration}
          isLoading={isLoading}
        />
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
