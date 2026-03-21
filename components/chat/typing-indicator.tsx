import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-4 px-4 py-6 bg-muted/30">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-primary-foreground" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">AI Assistant</span>
          <span className="text-xs text-muted-foreground">typing...</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
        </div>
      </div>
    </div>
  );
}
