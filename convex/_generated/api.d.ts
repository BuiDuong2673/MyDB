/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents_orchestrator from "../agents/orchestrator.js";
import type * as agents_registry from "../agents/registry.js";
import type * as agents_searchTripAgent from "../agents/searchTripAgent.js";
import type * as agents_toolDeclarations from "../agents/toolDeclarations.js";
import type * as agents_types from "../agents/types.js";
import type * as chat from "../chat.js";
import type * as llm_gemini from "../llm/gemini.js";
import type * as llm_geminiShared from "../llm/geminiShared.js";
import type * as llm_geminiToolChat from "../llm/geminiToolChat.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agents/orchestrator": typeof agents_orchestrator;
  "agents/registry": typeof agents_registry;
  "agents/searchTripAgent": typeof agents_searchTripAgent;
  "agents/toolDeclarations": typeof agents_toolDeclarations;
  "agents/types": typeof agents_types;
  chat: typeof chat;
  "llm/gemini": typeof llm_gemini;
  "llm/geminiShared": typeof llm_geminiShared;
  "llm/geminiToolChat": typeof llm_geminiToolChat;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
