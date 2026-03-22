/**
 * Gemini function declarations for agent tools. Names must match `registry.ts`.
 */
export const RETRIEVE_SPECIALIZED_INFORMATION = "retrieve_specialized_information";

export const agentFunctionDeclarations = [
  {
    name: RETRIEVE_SPECIALIZED_INFORMATION,
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
];
