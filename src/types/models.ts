export const DEEPSEEK_MODELS = {
  V4_PRO: "deepseek-v4-pro",
  V4_FLASH: "deepseek-v4-flash",
} as const;

export type ModelName = (typeof DEEPSEEK_MODELS)[keyof typeof DEEPSEEK_MODELS];

export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
export const DEEPSEEK_BETA_BASE_URL = "https://api.deepseek.com/beta";

export const BRAVE_WEB_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search";
export const BRAVE_LLM_CONTEXT_URL = "https://api.search.brave.com/res/v1/llm/context";

export const DEFAULT_MAX_TOOL_LOOP_ITERATIONS = 10;
