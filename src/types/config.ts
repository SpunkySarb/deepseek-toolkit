import type { ModelName } from "./models.js";

export type ReasoningEffort = "high" | "max";

export interface ThinkingConfig {
  type: "enabled" | "disabled";
}

export interface BraveSearchDefaults {
  safesearch?: "off" | "moderate" | "strict";
  freshness?: "pd" | "pw" | "pm" | "py";
  country?: string;
  searchLang?: string;
  count?: number;
}

export interface DeepSeekConfig {
  deepseekApiKey: string;
  braveSearchApiKey?: string;
  model?: ModelName;
  baseURL?: string;
  thinking?: ThinkingConfig;
  reasoningEffort?: ReasoningEffort;
  braveSearch?: BraveSearchDefaults;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  maxToolLoopIterations?: number;
}

export interface ResolvedConfig {
  deepseekApiKey: string;
  braveSearchApiKey?: string;
  model: ModelName;
  baseURL: string;
  thinking: ThinkingConfig;
  reasoningEffort: ReasoningEffort;
  braveSearch: BraveSearchDefaults;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  maxToolLoopIterations: number;
}
