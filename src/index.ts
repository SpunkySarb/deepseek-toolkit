export { DeepSeekClient } from "./client.js";
export { BraveSearchClient } from "./brave-search.js";
export { ToolManager } from "./tool-manager.js";
export { ToolLoop } from "./tool-loop.js";
export type { ToolLoopCallbacks } from "./tool-loop.js";
export { ReasoningState } from "./reasoning.js";

export {
  DeepSeekError,
  BraveSearchError,
  ToolError,
  ToolLoopError,
  ConfigError,
} from "./errors.js";

export {
  resolveConfig,
  DEFAULT_CONFIG,
  BRAVE_WEB_SEARCH_TOOL_DEFINITION,
  BRAVE_LLM_CONTEXT_TOOL_DEFINITION,
} from "./defaults.js";

export type {
  ModelName,
  DeepSeekConfig,
  ResolvedConfig,
  ThinkingConfig,
  ReasoningEffort,
  BraveSearchDefaults,
  ToolDefinition,
  ToolCall,
  ToolResult,
  ToolHandler,
  RegisteredTool,
  ToolChoice,
  ChatMessage,
  ChatResponse,
  StreamChunk,
  SafeSearch,
  Freshness,
  BraveWebSearchOptions,
  BraveLLMContextOptions,
  BraveWebResult,
  BraveWebSearchResponse,
  BraveLLMContextSnippet,
  BraveLLMContextResponse,
} from "./types/index.js";
export {
  DEEPSEEK_MODELS,
  DEEPSEEK_BASE_URL,
  DEEPSEEK_BETA_BASE_URL,
  BRAVE_WEB_SEARCH_URL,
  BRAVE_LLM_CONTEXT_URL,
  DEFAULT_MAX_TOOL_LOOP_ITERATIONS,
} from "./types/index.js";
