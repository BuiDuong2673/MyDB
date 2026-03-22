/**
 * Gemini function declarations for agent tools. Names must match `registry.ts`.
 */
/** Transit search constrained by departure clock time (Europe/Berlin). */
export const RETRIEVE_TRIP_BY_DEPARTURE = "retrieve_trip_by_departure";

/** Transit search constrained by arrival clock time at the destination (Europe/Berlin). */
export const RETRIEVE_TRIP_BY_ARRIVAL = "retrieve_trip_by_arrival";

export const agentFunctionDeclarations = [
  {
    name: RETRIEVE_TRIP_BY_DEPARTURE,
    description:
      "Search for public transit options (Google Maps transit data: trains, buses, metro, etc.) between two places on a specific travel day and departure clock time. " +
      "Date and time are interpreted in Europe/Berlin. Only call when origin, destination, dd.mm.yyyy date, and HH:mm departure time are known; otherwise ask the user. " +
      "Correct typo in user input before entering into this tool parameters. " +
      "The tool result `text` field is a JSON document (schemaVersion 1) describing routes, segments, and times; parse it and present a clear answer to the user.",
    parameters: {
      type: "object" as const,
      properties: {
        origin: {
          type: "string" as const,
          description:
            "Departure place: address or station name Google Maps can geocode (e.g. 'Berlin Hauptbahnhof').",
        },
        destination: {
          type: "string" as const,
          description:
            "Arrival place: address or station name Google Maps can geocode.",
        },
        date: {
          type: "string" as const,
          description:
            "Travel date MUST be dd.mm.yyyy (European order). Examples: 09.06.2025, 15.12.2024. Never use yyyy-mm-dd.",
        },
        departureTime: {
          type: "string" as const,
          description:
            "Departure time on that day, MUST be HH:mm in 24-hour local time. Examples: 09:00, 14:35.",
        },
      },
      required: ["origin", "destination", "date", "departureTime"] as const,
    },
  },
  {
    name: RETRIEVE_TRIP_BY_ARRIVAL,
    description:
      "Search for public transit options (Google Maps transit data) between two places when the user cares about when they ARRIVE at the destination, not when they leave. " +
      "Use this when the user specifies an arrival deadline, 'arrive by', 'get there by', or gives an arrival date/time. " +
      "Date and time are interpreted in Europe/Berlin. Only call when origin, destination, dd.mm.yyyy date, and HH:mm arrival time at the destination are known; otherwise ask the user. " +
      "Correct typos before filling parameters. " +
      "The tool result `text` field is JSON (schemaVersion 1) describing routes; parse it and answer in natural language.",
    parameters: {
      type: "object" as const,
      properties: {
        origin: {
          type: "string" as const,
          description:
            "Departure place: address or station name Google Maps can geocode (e.g. 'Berlin Hauptbahnhof').",
        },
        destination: {
          type: "string" as const,
          description:
            "Arrival place: address or station name Google Maps can geocode.",
        },
        date: {
          type: "string" as const,
          description:
            "Travel date MUST be dd.mm.yyyy (European order). Examples: 09.06.2025, 15.12.2024. Never use yyyy-mm-dd.",
        },
        arrivalTime: {
          type: "string" as const,
          description:
            "Desired arrival time at the destination on that day, MUST be HH:mm in 24-hour local time (Europe/Berlin). Examples: 09:00, 14:35.",
        },
      },
      required: ["origin", "destination", "date", "arrivalTime"] as const,
    },
  },
];
