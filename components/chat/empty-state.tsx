import { Sparkles, Code, Lightbulb, MessageSquare } from "lucide-react";

interface SuggestionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function SuggestionCard({ icon, title, description, onClick }: SuggestionCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-left group"
    >
      <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-sm text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </button>
  );
}

interface EmptyStateProps {
  onSuggestionClick: (message: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    {
      icon: <Code className="w-5 h-5" />,
      title: "Write code",
      description: "Generate code in any language",
      message: "Write a function to calculate the fibonacci sequence in TypeScript",
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Explain concepts",
      description: "Break down complex topics",
      message: "Explain how async/await works in JavaScript",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Creative writing",
      description: "Get help with content",
      message: "Help me write a professional email to request a meeting",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Brainstorm ideas",
      description: "Generate creative solutions",
      message: "Give me 5 innovative app ideas for productivity",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance">
            How can I help you today?
          </h1>
          <p className="text-muted-foreground text-balance max-w-md mx-auto">
            I'm your AI assistant, ready to help with coding, writing, analysis, and much more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.title}
              icon={suggestion.icon}
              title={suggestion.title}
              description={suggestion.description}
              onClick={() => onSuggestionClick(suggestion.message)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
