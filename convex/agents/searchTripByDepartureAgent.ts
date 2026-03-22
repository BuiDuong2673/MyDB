import type { Agent, AgentInput, AgentResult } from "./types";

const ROUTES_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

const DD_MM_YYYY = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const HH_MM = /^(\d{2}):(\d{2})$/;

/** Interpret user date/time in Europe/Berlin for departureTime sent to Google (RFC3339 Z). */
const LOCAL_TZ = "Europe/Berlin";

const FIELD_MASK = [
  "routes.duration",
  "routes.distanceMeters",
  "routes.localizedValues",
  "routes.description",
  "routes.legs.localizedValues",
  "routes.legs.steps.travelMode",
  "routes.legs.steps.staticDuration",
  "routes.legs.steps.localizedValues",
  "routes.legs.steps.navigationInstruction",
  "routes.legs.steps.transitDetails",
  "routes.legs.steps.transitDetails.stopDetails",
  "routes.legs.steps.transitDetails.localizedValues",
  "routes.legs.steps.transitDetails.transitLine",
  "routes.legs.steps.transitDetails.transitLine.agencies",
  "routes.legs.steps.transitDetails.transitLine.vehicle",
  "routes.legs.steps.transitDetails.headsign",
  "routes.legs.steps.transitDetails.headway",
  "routes.legs.steps.transitDetails.stopCount",
  "routes.legs.steps.transitDetails.tripShortText",
].join(",");

function isValidDdMmYyyy(s: string): boolean {
  const m = DD_MM_YYYY.exec(s);
  if (!m) return false;
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === mo - 1 &&
    date.getDate() === d
  );
}

function isValidHhMm(s: string): boolean {
  const m = HH_MM.exec(s);
  if (!m) return false;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

function requireStringField(
  args: Record<string, unknown>,
  key: string
): string {
  const v = args[key];
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(
      `Trip search requires "${key}" (string). Ask the user if it is missing.`
    );
  }
  return v.trim();
}

/**
 * Find UTC instant whose Europe/Berlin wall clock matches (y, mo, d, h, mi).
 */
function berlinWallTimeToRfc3339Utc(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number
): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: LOCAL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  });
  const matches = (ms: number) => {
    const parts = fmt.formatToParts(new Date(ms));
    const g = (t: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === t)?.value ?? NaN);
    return (
      g("year") === y &&
      g("month") === mo &&
      g("day") === d &&
      g("hour") === h &&
      g("minute") === mi
    );
  };
  const anchor = Date.UTC(y, mo - 1, d, 12, 0, 0);
  const windowMin = 14 * 24 * 60;
  for (let delta = -windowMin; delta <= windowMin; delta += 1) {
    const ms = anchor + delta * 60 * 1000;
    if (matches(ms)) {
      return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
    }
  }
  throw new Error("Could not convert local date/time to UTC for routing.");
}

function getRoutesApiKey(): string {
  const key =
    process.env.GOOGLE_ROUTES_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing GOOGLE_ROUTES_API_KEY (or GOOGLE_MAPS_API_KEY) in Convex environment variables."
    );
  }
  return key;
}

type LocalizedText = { text?: string };

type LocalizedTime = {
  time?: LocalizedText;
  timeZone?: string;
};

type TransitAgency = { name?: string; phoneNumber?: string; uri?: string };

type TransitVehicle = {
  name?: LocalizedText;
  type?: string;
  iconUri?: string;
  localIconUri?: string;
};

type TransitLine = {
  agencies?: TransitAgency[];
  name?: string;
  nameShort?: string;
  uri?: string;
  color?: string;
  textColor?: string;
  iconUri?: string;
  vehicle?: TransitVehicle;
};

type TransitStop = {
  name?: string;
  location?: unknown;
};

type TransitStopDetails = {
  departureStop?: TransitStop;
  arrivalStop?: TransitStop;
  departureTime?: string;
  arrivalTime?: string;
};

type TransitDetailsLocalizedValues = {
  departureTime?: LocalizedTime;
  arrivalTime?: LocalizedTime;
};

type RouteLegStepTransitDetails = {
  stopDetails?: TransitStopDetails;
  localizedValues?: TransitDetailsLocalizedValues;
  headsign?: string;
  headway?: string;
  transitLine?: TransitLine;
  stopCount?: number;
  tripShortText?: string;
};

type RouteLegStepLocalizedValues = {
  distance?: LocalizedText;
  staticDuration?: LocalizedText;
};

type RouteStep = {
  travelMode?: string;
  staticDuration?: string;
  localizedValues?: RouteLegStepLocalizedValues;
  transitDetails?: RouteLegStepTransitDetails;
  navigationInstruction?: { instructions?: string };
};

type GoogleRoute = {
  duration?: string;
  distanceMeters?: number;
  description?: string;
  localizedValues?: {
    duration?: LocalizedText;
    distance?: LocalizedText;
  };
  legs?: Array<{ steps?: RouteStep[]; localizedValues?: unknown }>;
};

type ComputeRoutesResponse = {
  routes?: GoogleRoute[];
  error?: { code?: number; message?: string; status?: string };
};

/** Tool result JSON (schemaVersion 1) — serialized into `AgentResult.text`. */
const TRIP_SEARCH_SCHEMA_VERSION = 1 as const;

type TripStopTimeJson = {
  stopName: string;
  timeText: string;
  timeIso?: string;
};

type TransitLineSegmentJson = {
  nameShort?: string;
  name?: string;
  tripShortText?: string;
  agency?: string;
};

type TransitSegmentJson = {
  mode: "TRANSIT";
  vehicleLabel: string;
  line: TransitLineSegmentJson;
  headsign?: string;
  headwayText?: string;
  stopCount?: number;
  departure: TripStopTimeJson;
  arrival: TripStopTimeJson;
  tripDurationText: string;
  transferFromPreviousText: string;
};

type RouteSummaryJson = {
  totalDurationText?: string;
  totalDistanceText?: string;
  routeDescription?: string;
  firstDepartureTime?: string;
  lastArrivalTime?: string;
  note?: string;
};

type RouteOptionJson = {
  optionIndex: number;
  summary: RouteSummaryJson;
  segments: TransitSegmentJson[];
  walkNotes: string[];
};

type TripSearchQueryJson = {
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  timezone: string;
};

type TripSearchSuccessPayload = {
  schemaVersion: typeof TRIP_SEARCH_SCHEMA_VERSION;
  query: TripSearchQueryJson;
  routes: RouteOptionJson[];
};

type TripSearchEmptyPayload = {
  schemaVersion: typeof TRIP_SEARCH_SCHEMA_VERSION;
  ok: false;
  message: string;
};

function parseDurationSeconds(duration: string | undefined): string {
  if (!duration || !duration.endsWith("s")) return duration ?? "";
  const n = Number(duration.slice(0, -1));
  if (Number.isNaN(n)) return duration;
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** English month/day wording; wall clock is always Europe/Berlin (German civil time). */
function formatIsoInBerlin(iso: string | undefined): string {
  if (!iso) return "?";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LOCAL_TZ,
    dateStyle: "short",
    timeStyle: "short",
  }).format(ms);
}

function parseIsoToMs(iso: string | undefined): number | undefined {
  if (!iso) return undefined;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? undefined : ms;
}

function humanizeGapMs(ms: number | undefined): string {
  if (ms == null || ms < 0) return "—";
  if (ms < 60_000) return "<1 min";
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest > 0 ? `${h}h ${rest}m` : `${h}h`;
}

function stepDurationLabel(step: RouteStep): string {
  return (
    step.localizedValues?.staticDuration?.text ??
    parseDurationSeconds(step.staticDuration) ??
    "—"
  );
}

function departureTimeLabel(td: RouteLegStepTransitDetails): string {
  const loc = td.localizedValues?.departureTime?.time?.text;
  if (loc) return loc;
  return formatIsoInBerlin(td.stopDetails?.departureTime);
}

function arrivalTimeLabel(td: RouteLegStepTransitDetails): string {
  const loc = td.localizedValues?.arrivalTime?.time?.text;
  if (loc) return loc;
  return formatIsoInBerlin(td.stopDetails?.arrivalTime);
}

function vehicleLabel(td: RouteLegStepTransitDetails): string {
  const line = td.transitLine;
  const parts: string[] = [];
  const lineName =
    line?.nameShort ||
    line?.name ||
    line?.vehicle?.name?.text ||
    line?.vehicle?.type ||
    "Transit";
  parts.push(lineName);
  if (td.tripShortText) parts.push(`(${td.tripShortText})`);
  const agency = line?.agencies?.[0]?.name;
  if (agency) parts.push(`· ${agency}`);
  return parts.join(" ");
}

function buildLineJson(td: RouteLegStepTransitDetails): TransitLineSegmentJson {
  const line = td.transitLine;
  const out: TransitLineSegmentJson = {};
  if (line?.nameShort) out.nameShort = line.nameShort;
  if (line?.name) out.name = line.name;
  if (td.tripShortText) out.tripShortText = td.tripShortText;
  const agency = line?.agencies?.[0]?.name;
  if (agency) out.agency = agency;
  return out;
}

function buildStopTimeJson(
  td: RouteLegStepTransitDetails,
  kind: "departure" | "arrival"
): TripStopTimeJson {
  const sd = td.stopDetails;
  if (kind === "departure") {
    return {
      stopName: sd?.departureStop?.name ?? "?",
      timeText: departureTimeLabel(td),
      ...(sd?.departureTime ? { timeIso: sd.departureTime } : {}),
    };
  }
  return {
    stopName: sd?.arrivalStop?.name ?? "?",
    timeText: arrivalTimeLabel(td),
    ...(sd?.arrivalTime ? { timeIso: sd.arrivalTime } : {}),
  };
}

/**
 * One route option as structured JSON (aligned with Gemini trip template fields).
 * Origin/destination labels live on the top-level `query` object in the payload.
 */
function buildRouteOption(route: GoogleRoute, index: number): RouteOptionJson {
  const totalDur =
    route.localizedValues?.duration?.text ??
    parseDurationSeconds(route.duration);
  const dist = route.localizedValues?.distance?.text;
  const steps = route.legs?.flatMap((l) => l.steps ?? []) ?? [];
  const transitIndices: number[] = [];
  steps.forEach((s, i) => {
    if (s.travelMode === "TRANSIT" && s.transitDetails) transitIndices.push(i);
  });

  const walkNotes: string[] = [];

  if (transitIndices.length === 0) {
    const note = steps.some((s) => s.travelMode === "WALK")
      ? "Walking-only or mixed steps (no transit segment in response)."
      : "No transit segments in this route.";
    return {
      optionIndex: index + 1,
      summary: {
        ...(totalDur ? { totalDurationText: totalDur } : {}),
        ...(dist ? { totalDistanceText: dist } : {}),
        ...(route.description ? { routeDescription: route.description } : {}),
        note,
      },
      segments: [],
      walkNotes,
    };
  }

  const firstTd = steps[transitIndices[0]!]!.transitDetails!;
  const lastTd = steps[transitIndices[transitIndices.length - 1]!]!.transitDetails!;

  const summary: RouteSummaryJson = {
    ...(totalDur ? { totalDurationText: totalDur } : {}),
    ...(dist ? { totalDistanceText: dist } : {}),
    ...(route.description ? { routeDescription: route.description } : {}),
    firstDepartureTime: departureTimeLabel(firstTd),
    lastArrivalTime: arrivalTimeLabel(lastTd),
  };

  const segments: TransitSegmentJson[] = [];
  let prevTransitArrivalMs: number | undefined;

  for (let k = 0; k < transitIndices.length; k++) {
    const stepIndex = transitIndices[k]!;
    const step = steps[stepIndex]!;
    const td = step.transitDetails!;
    const depMs = parseIsoToMs(td.stopDetails?.departureTime);
    const arrMs = parseIsoToMs(td.stopDetails?.arrivalTime);

    let transferLabel = "—";
    if (k === 0) {
      const firstWalk = steps.slice(0, stepIndex).filter((s) => s.travelMode === "WALK");
      if (firstWalk.length > 0) {
        const walkDur = firstWalk
          .map((s) => stepDurationLabel(s))
          .filter((x) => x && x !== "—")
          .join(" + ");
        transferLabel = walkDur ? `walk/approach ${walkDur}` : "—";
        if (walkDur) walkNotes.push(`Approach: ${walkDur}`);
      }
    } else if (depMs != null && prevTransitArrivalMs != null) {
      transferLabel = humanizeGapMs(depMs - prevTransitArrivalMs);
    }

    prevTransitArrivalMs = arrMs ?? parseIsoToMs(td.stopDetails?.arrivalTime);

    const tripDur = stepDurationLabel(step);

    const seg: TransitSegmentJson = {
      mode: "TRANSIT",
      vehicleLabel: vehicleLabel(td),
      line: buildLineJson(td),
      departure: buildStopTimeJson(td, "departure"),
      arrival: buildStopTimeJson(td, "arrival"),
      tripDurationText: tripDur,
      transferFromPreviousText: transferLabel,
    };
    if (td.headsign) seg.headsign = td.headsign;
    if (td.headway) seg.headwayText = parseDurationSeconds(td.headway);
    if (td.stopCount != null && td.stopCount > 0) seg.stopCount = td.stopCount;
    segments.push(seg);

    const nextTransitIdx =
      k + 1 < transitIndices.length ? transitIndices[k + 1]! : -1;
    if (nextTransitIdx > stepIndex + 1) {
      const walkBetween = steps.slice(stepIndex + 1, nextTransitIdx);
      const walkSteps = walkBetween.filter((s) => s.travelMode === "WALK");
      if (walkSteps.length > 0) {
        const wdur = walkSteps
          .map((s) => stepDurationLabel(s))
          .join(" + ");
        walkNotes.push(`Walk: ${wdur}`);
      }
    }
  }

  return {
    optionIndex: index + 1,
    summary,
    segments,
    walkNotes,
  };
}

export const searchTripByDepartureAgent: Agent = {
  id: "searchTripByDeparture",
  async run(input: AgentInput): Promise<AgentResult> {
    const args = input.toolArguments ?? {};
    const origin = requireStringField(args, "origin");
    const destination = requireStringField(args, "destination");
    const dateRaw = requireStringField(args, "date");
    const timeRaw = requireStringField(args, "departureTime");

    if (!isValidDdMmYyyy(dateRaw)) {
      throw new Error(
        `Invalid date "${dateRaw}". Expected dd.mm.yyyy (e.g. 15.06.2025).`
      );
    }
    if (!isValidHhMm(timeRaw)) {
      throw new Error(
        `Invalid departureTime "${timeRaw}". Expected HH:mm in 24-hour form (e.g. 09:30).`
      );
    }

    const dm = DD_MM_YYYY.exec(dateRaw)!;
    const day = Number(dm[1]);
    const month = Number(dm[2]);
    const year = Number(dm[3]);
    const tm = HH_MM.exec(timeRaw)!;
    const hour = Number(tm[1]);
    const minute = Number(tm[2]);

    const departureTime = berlinWallTimeToRfc3339Utc(
      year,
      month,
      day,
      hour,
      minute
    );

    const apiKey = getRoutesApiKey();

    // User date/time and all displayed times use Europe/Berlin. English labels from the API only.
    const body = {
      origin: { address: origin },
      destination: { address: destination },
      travelMode: "TRANSIT",
      departureTime,
      computeAlternativeRoutes: true,
      languageCode: "en",
      regionCode: "de",
      units: "METRIC",
      transitPreferences: {
        routingPreference: "FEWER_TRANSFERS",
        allowedTravelModes: [
          "BUS",
          "SUBWAY",
          "TRAIN",
          "LIGHT_RAIL",
          "RAIL",
        ],
      },
    };

    let res: Response;
    try {
      res = await fetch(ROUTES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error(
        "Failed to reach Google Routes API. Check network connectivity."
      );
    }

    const textBody = await res.text();
    let data: ComputeRoutesResponse;
    try {
      data = JSON.parse(textBody) as ComputeRoutesResponse;
    } catch {
      throw new Error(
        `Google Routes API returned non-JSON (${res.status}): ${textBody.slice(0, 300)}`
      );
    }

    if (!res.ok) {
      const msg =
        data.error?.message ?? textBody.slice(0, 500);
      throw new Error(`Google Routes API failed (${res.status}): ${msg}`);
    }

    const routes = Array.isArray(data.routes) ? data.routes : [];
    if (routes.length === 0) {
      const emptyPayload: TripSearchEmptyPayload = {
        schemaVersion: TRIP_SEARCH_SCHEMA_VERSION,
        ok: false,
        message:
          "No transit routes were returned. Try different stations, times, or places closer to public transport.",
      };
      return { text: JSON.stringify(emptyPayload, null, 2) };
    }

    const routeOptions = routes.slice(0, 10).map((r, i) => buildRouteOption(r, i));

    const payload: TripSearchSuccessPayload = {
      schemaVersion: TRIP_SEARCH_SCHEMA_VERSION,
      query: {
        origin,
        destination,
        date: dateRaw,
        departureTime: timeRaw,
        timezone: LOCAL_TZ,
      },
      routes: routeOptions,
    };

    return { text: JSON.stringify(payload, null, 2) };
  },
};
