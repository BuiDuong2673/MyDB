/**
 * Exact strings for home-screen suggestions and demo chat user messages.
 * Left-aligned lines only (no indented template literals) so composer and history match.
 */
export const PROMPT_KNOWN_DEPARTURE = [
  "I want to go",
  "- From: Berlin Hbf",
  "- To: Munich Hbf",
  "- Departure Date: 23.03.2026",
  "- Departure Time: 10am",
  "",
  "Which 3 trips arrive at the destination first?",
].join("\n");

export const PROMPT_KNOWN_ARRIVAL = [
  "I want to go",
  "- From: Berlin Hbf",
  "- To: Munich Hbf",
  "- Arrival Date: 23.03.2026",
  "- Arrival Time: 10am",
  "",
  "List the 3 options that arrive at or before the arrival time mentioned above and have the latest",
  "possible departure (i.e. maximize departure time while still meeting the arrival deadline).",
].join("\n");

export const PROMPT_COMFORTABLE_TRANSFER = [
  "I want to go",
  "- From: Berlin Hbf",
  "- To: Munich Hbf",
  "- Date: 23.03.2026",
  "- Time: 10am",
  "",
  "Which 3 best trips with transfer durations more than 3 minutes.",
].join("\n");

export const PROMPT_LEAST_TRANSFERS = [
  "I want to go",
  "- From: Berlin Hbf",
  "- To: Munich Hbf",
  "- Date: 23.03.2026",
  "- Time: 10am",
  "",
  "Which 3 trips with the least number of transfers?",
].join("\n");
