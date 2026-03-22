"use client";

import { cn } from "@/lib/utils";
import type { AppSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <select
              value={settings.model}
              onChange={(e) => onUpdateSettings({ model: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            </select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Temperature</label>
              <span className="text-sm text-muted-foreground">
                {settings.temperature}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) =>
                onUpdateSettings({ temperature: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower values make responses more focused and deterministic.
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Tokens</label>
            <input
              type="number"
              min="256"
              max="8192"
              step="256"
              value={settings.maxTokens}
              onChange={(e) =>
                onUpdateSettings({ maxTokens: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of the generated response.
            </p>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSettings({ theme: "dark" })}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  settings.theme === "dark"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-input hover:bg-accent"
                )}
              >
                Dark
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: "light" })}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  settings.theme === "light"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-input hover:bg-accent"
                )}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
