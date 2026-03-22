/**
 * Edit this file to change sidebar preview / demo chat content.
 * Keep conversation titles in sync with `components/chat/empty-state.tsx` suggestion cards.
 * User prompts should match `lib/trip-prompt-templates.ts` (same copy as home suggestions).
 */
import type { ChatConversation } from "./types";
import {
  PROMPT_COMFORTABLE_TRANSFER,
  PROMPT_KNOWN_ARRIVAL,
  PROMPT_KNOWN_DEPARTURE,
  PROMPT_LEAST_TRANSFERS,
} from "./trip-prompt-templates";

const day = 86400000;

const ASSISTANT_DEPARTURE = [
  "Here are the 3 trips that arrive earliest at Munich Hbf:",
  "",
  "Option 1: from Berlin Hbf at 10:36 AM to Munich Hbf at 2:45 PM Total Trip Duration: 4 hours 12 mins",
  "",
  "* Vehicle name (ICE 1007 · DB Fernverkehr AG): Berlin Hauptbahnhof at 10:36 AM -> Munich Central Station at 2:45 PM Trip Duration: 4 hours 9 mins Transfer Duration: 1 min",
  "Option 2: from Berlin Hbf at 11:36 AM to Munich Hbf at 3:43 PM Total Trip Duration: 4 hours 10 mins",
  "",
  "* Vehicle name (ICE 1507 · DB Fernverkehr AG): Berlin Hauptbahnhof at 11:36 AM -> Munich Central Station at 3:43 PM Trip Duration: 4 hours 7 mins Transfer Duration: 1 min",
  "Option 3: from Berlin Hbf at 11:51 AM to Nürnberg Hbf at 2:52 PM Total Trip Duration: 4 hours 25 mins",
  "",
  "* Vehicle name (ICE 707 · DB Fernverkehr AG): Berlin Hauptbahnhof at 11:51 AM -> Nürnberg Hbf at 2:52 PM Trip Duration: 3 hours 1 min Transfer Duration: 1 min",
  "* Vehicle name (ICE 625 · DB Fernverkehr AG): Nürnberg Hbf at 3:01 PM -> Munich Central Station at 4:13 PM Trip Duration: 1 hour 12 mins Transfer Duration: 9 mins",
  "Would you like to see more options, or would you like to sort them differently?",
].join("\n");

const ASSISTANT_ARRIVAL = [
  "I found the following option from Berlin Hbf to Munich Hbf on 23.03.2026, arriving at or before 10:00 AM:",
  "",
  "Option 1: from Berlin Hbf at 5:36 AM to Munich Central Station at 9:41 AM Total Trip Duration: 4 hours 8 mins",
  "",
  "Train ICE 1501: Berlin Hauptbahnhof at 5:36 AM -> Munich Central Station at 9:41 AM Trip Duration: 4 hours 5 mins Transfer Duration: 0 minutes",
  "Unfortunately, only one option was found that meets your criteria of arriving at or before 10:00 AM with the latest possible departure.",
].join("\n");

const ASSISTANT_COMFORT = [
  "Here are the top 3 options for your trip from Berlin Hbf to Munich Hbf on March 23, 2026, with transfer durations of more than 3 minutes:",
  "",
  "Option 1: from Berlin Hbf at 10:36 AM to Munich Hbf at 2:45 PM. Total Trip Duration: 4 hours 9 mins",
  "",
  "Vehicle name (e.g Train ICE 1007 · DB Fernverkehr AG): Berlin Hauptbahnhof at 10:36 AM -> Munich Central Station at 2:45 PM. Trip Duration: 4 hours 9 mins. Transfer Duration: 2 mins",
  "Option 2: from Berlin Hbf at 11:36 AM to Munich Hbf at 3:43 PM. Total Trip Duration: 4 hours 7 mins",
  "",
  "Vehicle name (e.g Train ICE 1507 · DB Fernverkehr AG): Berlin Hauptbahnhof at 11:36 AM -> Munich Central Station at 3:43 PM. Trip Duration: 4 hours 7 mins. Transfer Duration: 2 mins",
  "Option 3: from Berlin Hbf at 11:51 AM to Nürnberg Hbf at 2:52 PM. Then transfer to ICE 625 · DB Fernverkehr AG from Nürnberg Hbf at 3:01 PM to Munich Central Station at 4:13 PM. Total Trip Duration: 4 hours 12 mins",
  "",
  "Vehicle name (e.g Train ICE 707 · DB Fernverkehr AG): Berlin Hauptbahnhof at 11:51 AM -> Nürnberg Hbf at 2:52 PM. Trip Duration: 3 hours 1 min. Transfer Duration: 2 mins",
  "Vehicle name (e.g Train ICE 625 · DB Fernverkehr AG): Nürnberg Hbf at 3:01 PM -> Munich Central Station at 4:13 PM. Trip Duration: 1 hour 12 mins. Transfer Duration: 9 mins",
  "Would you like to see more options or sort them differently?",
].join("\n");

const ASSISTANT_LEAST = [
  "Here are 3 trips with the least number of transfers from Berlin Hbf to Munich Hbf on 23.03.2026, departing around 10:00:",
  "",
  "Option 1: from Berlin Hauptbahnhof at 10:36 AM to Munich Central Station at 2:45 PM Total Trip Duration: 4 hours 12 mins",
  "",
  "Train ICE 1007: Berlin Hauptbahnhof at 10:36 AM -> Munich Central Station at 2:45 PM Trip Duration: 4 hours 9 mins Transfer Duration: walk/approach 1 min + 1 min",
  "Option 2: from Berlin Hauptbahnhof at 11:36 AM to Munich Central Station at 3:43 PM Total Trip Duration: 4 hours 10 mins",
  "",
  "Train ICE 1507: Berlin Hauptbahnhof at 11:36 AM -> Munich Central Station at 3:43 PM Trip Duration: 4 hours 7 mins Transfer Duration: walk/approach 1 min + 1 min",
  "Option 3: from Berlin Hauptbahnhof at 12:36 PM to Munich Central Station at 4:45 PM Total Trip Duration: 4 hours 12 mins",
  "",
  "Train ICE 1009: Berlin Hauptbahnhof at 12:36 PM -> Munich Central Station at 4:45 PM Trip Duration: 4 hours 9 mins Transfer Duration: walk/approach 1 min + 1 min",
].join("\n");

export const mockConversations: ChatConversation[] = [
  {
    id: "demo-departure-time",
    title: "Plan a trip (known departure time)",
    messages: [
      {
        id: "msg-departure-u1",
        role: "user",
        content: PROMPT_KNOWN_DEPARTURE,
        timestamp: new Date(Date.now() - day * 0.5),
      },
      {
        id: "msg-departure-a1",
        role: "assistant",
        content: ASSISTANT_DEPARTURE,
        timestamp: new Date(Date.now() - day * 0.5 + 60000),
      },
    ],
    createdAt: new Date(Date.now() - day * 1),
    updatedAt: new Date(Date.now() - day * 0.5),
  },
  {
    id: "demo-arrival-time",
    title: "Plan a trip (known arrival time)",
    messages: [
      {
        id: "msg-arrival-u1",
        role: "user",
        content: PROMPT_KNOWN_ARRIVAL,
        timestamp: new Date(Date.now() - day * 2),
      },
      {
        id: "msg-arrival-a1",
        role: "assistant",
        content: ASSISTANT_ARRIVAL,
        timestamp: new Date(Date.now() - day * 2 + 60000),
      },
    ],
    createdAt: new Date(Date.now() - day * 5),
    updatedAt: new Date(Date.now() - day * 2),
  },
  {
    id: "demo-comfortable-transfer",
    title: "Comfortable transfer duration",
    messages: [
      {
        id: "msg-comfort-u1",
        role: "user",
        content: PROMPT_COMFORTABLE_TRANSFER,
        timestamp: new Date(Date.now() - day * 4),
      },
      {
        id: "msg-comfort-a1",
        role: "assistant",
        content: ASSISTANT_COMFORT,
        timestamp: new Date(Date.now() - day * 4 + 60000),
      },
    ],
    createdAt: new Date(Date.now() - day * 10),
    updatedAt: new Date(Date.now() - day * 4),
  },
  {
    id: "demo-least-transfers",
    title: "Least Transfer Trips",
    messages: [
      {
        id: "msg-least-u1",
        role: "user",
        content: PROMPT_LEAST_TRANSFERS,
        timestamp: new Date(Date.now() - day * 8),
      },
      {
        id: "msg-least-a1",
        role: "assistant",
        content: ASSISTANT_LEAST,
        timestamp: new Date(Date.now() - day * 8 + 60000),
      },
    ],
    createdAt: new Date(Date.now() - day * 14),
    updatedAt: new Date(Date.now() - day * 8),
  },
];
