import { TrainFront, MapPin, Clock, Route } from "lucide-react";

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
      icon: <Route className="w-5 h-5" />,
      title: "Plan a trip",
      description: "Connections, duration, and changes",
      message:
        "I need a train from Berlin to Munich tomorrow morning. What are good options with few changes?",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Stations & stops",
      description: "Find platforms and local tips",
      message:
        "What should I know about arriving at Frankfurt (Main) Hauptbahnhof with luggage?",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Timing & delays",
      description: "Buffers and alternatives",
      message:
        "My connection is 8 minutes. Is that realistic if the first train is often a few minutes late?",
    },
    {
      icon: <TrainFront className="w-5 h-5" />,
      title: "Tickets & savings",
      description: "Saver fares and passes",
      message:
        "When is a day ticket better than two single tickets for regional travel in Germany?",
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
            MyDB helps you plan rail journeys—routes, timing, and travel tips tailored to your trip.
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
