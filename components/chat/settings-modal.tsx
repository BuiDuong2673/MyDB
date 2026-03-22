"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AppSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";

/** Matches Max Tokens and other settings fields (native selects use OS colors for the list). */
const settingsFieldClass =
  "w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const MODEL_OPTIONS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
] as const;

function ModelMenu({
  value,
  onChange,
}: {
  value: string;
  onChange: (model: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const label =
    MODEL_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="relative">
      <button
        type="button"
        id="settings-model-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          settingsFieldClass,
          "flex items-center justify-between gap-2 text-left"
        )}
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            aria-labelledby="settings-model-trigger"
            className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-input bg-muted py-1 shadow-lg"
          >
            {MODEL_OPTIONS.map((opt) => (
              <li key={opt.value} role="option" aria-selected={value === opt.value}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary hover:text-secondary-foreground",
                    value === opt.value && "bg-secondary text-secondary-foreground"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

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
            <label className="text-sm font-medium" htmlFor="settings-model-trigger">
              Model
            </label>
            <ModelMenu
              value={settings.model}
              onChange={(model) => onUpdateSettings({ model })}
            />
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
              className={settingsFieldClass}
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
