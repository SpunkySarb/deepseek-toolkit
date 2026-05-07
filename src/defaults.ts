import type { DeepSeekConfig, ResolvedConfig } from "./types/config.js";
import type { ToolDefinition } from "./types/tools.js";
import {
  DEEPSEEK_MODELS,
  DEEPSEEK_BASE_URL,
  DEFAULT_MAX_TOOL_LOOP_ITERATIONS,
} from "./types/models.js";

export const DEFAULT_CONFIG = {
  model: DEEPSEEK_MODELS.V4_PRO,
  baseURL: DEEPSEEK_BASE_URL,
  thinking: { type: "enabled" as const },
  reasoningEffort: "high" as const,
  braveSearch: {
    safesearch: "off" as const,
    freshness: undefined as "pd" | "pw" | "pm" | "py" | undefined,
    country: "US",
    searchLang: "en",
    count: 10,
  },
  maxToolLoopIterations: DEFAULT_MAX_TOOL_LOOP_ITERATIONS,
};

// -- Typed params for built-in tools ------------------------------------------

export interface BraveWebSearchParams {
  query: string;
  freshness?: "pd" | "pw" | "pm" | "py";
  count?: number;
  safesearch?: "off" | "moderate" | "strict";
}

export interface BraveLLMContextParams {
  query: string;
  freshness?: "pd" | "pw" | "pm" | "py";
  maxTokens?: number;
  maxUrls?: number;
}

// -- Built-in tool definitions ------------------------------------------------

export const BRAVE_WEB_SEARCH_TOOL_DEFINITION: ToolDefinition = {
  type: "function",
  function: {
    name: "brave_web_search",
    description:
      "Search the web using Brave Search. Returns web page results with titles, URLs, and descriptions. Use this to find current information, news, documentation, or any web content.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
        freshness: {
          type: "string",
          enum: ["pd", "pw", "pm", "py"],
          description:
            "Filter results by freshness: pd (24h), pw (7 days), pm (month), py (year)",
        },
        count: {
          type: "integer",
          minimum: 1,
          maximum: 20,
          description: "Number of results (max 20)",
        },
        safesearch: {
          type: "string",
          enum: ["off", "moderate", "strict"],
          description: "Content filter level",
        },
      },
      required: ["query"],
    },
  },
};

export const BRAVE_LLM_CONTEXT_TOOL_DEFINITION: ToolDefinition = {
  type: "function",
  function: {
    name: "brave_llm_context",
    description:
      "Search the web and get content optimized for AI consumption. Returns pre-extracted text snippets from web pages, ideal for grounding responses in current information.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
        freshness: {
          type: "string",
          enum: ["pd", "pw", "pm", "py"],
          description:
            "Filter results by freshness: pd (24h), pw (7 days), pm (month), py (year)",
        },
        maxTokens: {
          type: "integer",
          minimum: 1024,
          maximum: 32768,
          description: "Max tokens in context (default 8192)",
        },
        maxUrls: {
          type: "integer",
          minimum: 1,
          maximum: 50,
          description: "Maximum URLs to include (default 20)",
        },
      },
      required: ["query"],
    },
  },
};

// -- Config resolver ----------------------------------------------------------

export function resolveConfig(config: DeepSeekConfig): ResolvedConfig {
  return {
    deepseekApiKey: config.deepseekApiKey,
    braveSearchApiKey: config.braveSearchApiKey,
    model: config.model ?? DEFAULT_CONFIG.model,
    baseURL: config.baseURL ?? DEFAULT_CONFIG.baseURL,
    thinking: config.thinking ?? DEFAULT_CONFIG.thinking,
    reasoningEffort: config.reasoningEffort ?? DEFAULT_CONFIG.reasoningEffort,
    braveSearch: {
      safesearch:
        config.braveSearch?.safesearch ?? DEFAULT_CONFIG.braveSearch.safesearch,
      freshness:
        config.braveSearch?.freshness ?? DEFAULT_CONFIG.braveSearch.freshness,
      country:
        config.braveSearch?.country ?? DEFAULT_CONFIG.braveSearch.country,
      searchLang:
        config.braveSearch?.searchLang ?? DEFAULT_CONFIG.braveSearch.searchLang,
      count:
        config.braveSearch?.count ?? DEFAULT_CONFIG.braveSearch.count,
    },
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    topP: config.topP,
    maxToolLoopIterations:
      config.maxToolLoopIterations ?? DEFAULT_CONFIG.maxToolLoopIterations,
  };
}
