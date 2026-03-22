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
  onSuggestionSelect: (template: string) => void;
}

export function EmptyState({ onSuggestionSelect }: EmptyStateProps) {
  const suggestions = [
    {
      icon: <Route className="w-5 h-5" />,
      title: "Plan a trip (known departure time)",
      description: "Find trips that start at the departure time",
      template: `I want to go
      - From: Berlin Hbf
      - To: Munich Hbf
      - Departure Date: 23.03.2026
      - Departure Time: 10am

      Which 3 trips arrive at the destination first?`,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Plan a trip (known arrival time)",
      description: "Find trips that arrive before the arrival time",
      template: `I want to go
      - From: Berlin Hbf
      - To: Munich Hbf
      - Arrival Date: 23.03.2026
      - Arrival Time: 10am

      List the 3 options that arrive at or before the arrival time mentioned above and have the latest
      possible departure (i.e. maximize departure time while still meeting the arrival deadline).`,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Comfortable transfer duration",
      description: "Buffers and alternatives",
      template: `I want to go
      - From: Berlin Hbf
      - To: Munich Hbf
      - Date: 23.03.2026
      - Time: 10am
      Which 3 best trips with transfer durations more than 3 minutes.`
    },
    {
      icon: <TrainFront className="w-5 h-5" />,
      title: "Least Transfer Trips",
      description: "Find trips that has the least number of transfers",
      template: `I want to go
      - From: Berlin Hbf
      - To: Munich Hbf
      - Date: 23.03.2026
      - Time: 10am
      Which 3 trips with the least number of transfers?`,
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
              onClick={() => onSuggestionSelect(suggestion.template)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
