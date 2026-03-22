import { TrainFront, MapPin, Clock, Route } from "lucide-react";
import {
  PROMPT_COMFORTABLE_TRANSFER,
  PROMPT_KNOWN_ARRIVAL,
  PROMPT_KNOWN_DEPARTURE,
  PROMPT_LEAST_TRANSFERS,
} from "@/lib/trip-prompt-templates";

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
  onSuggestionSelect: (template: string) => void;
}

export function EmptyState({ onSuggestionSelect }: EmptyStateProps) {
  const suggestions = [
    {
      icon: <Route className="w-5 h-5" />,
      title: "Plan a trip (known departure time)",
      description: "Find trips that start at the departure time",
      template: PROMPT_KNOWN_DEPARTURE,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Plan a trip (known arrival time)",
      description: "Find trips that arrive before the arrival time",
      template: PROMPT_KNOWN_ARRIVAL,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Comfortable transfer duration",
      description: "Find trips that have at least some minutes for transfer between trains/buses",
      template: PROMPT_COMFORTABLE_TRANSFER
    },
    {
      icon: <TrainFront className="w-5 h-5" />,
      title: "Least Transfer Trips",
      description: "Find trips that has the least number of transfers",
      template: PROMPT_LEAST_TRANSFERS,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-md">
            <TrainFront className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Where would you like to go?
          </h1>
          <p className="text-muted-foreground text-balance max-w-md mx-auto">
            A powerful and thoughtful AI Travel Advisor for flexible trip planning in Germany.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.title}
              icon={suggestion.icon}
              title={suggestion.title}
              description={suggestion.description}
              onClick={() => onSuggestionSelect(suggestion.template)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
