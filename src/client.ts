import OpenAI from "openai";
import type {
  DeepSeekConfig,
  ResolvedConfig,
  ThinkingConfig,
  ReasoningEffort,
  BraveSearchDefaults,
} from "./types/config.js";
import type {
  ToolDefinition,
  ToolHandler,
  RegisteredTool,
  ToolChoice,
  ToolCall,
  ToolResult,
} from "./types/tools.js";
import type {
  ChatMessage,
  ChatResponse,
  StreamChunk,
} from "./types/chat.js";
import type {
  BraveWebSearchOptions,
  BraveLLMContextOptions,
  BraveWebSearchResponse,
  BraveLLMContextResponse,
} from "./types/brave-search.js";
import type { ModelName } from "./types/models.js";
import { BraveSearchClient } from "./brave-search.js";
import { ToolManager } from "./tool-manager.js";
import { ToolLoop, type ToolLoopCallbacks } from "./tool-loop.js";
import { resolveConfig } from "./defaults.js";
import {
  BRAVE_WEB_SEARCH_TOOL_DEFINITION,
  BRAVE_LLM_CONTEXT_TOOL_DEFINITION,
} from "./defaults.js";
import { ConfigError } from "./errors.js";

export class DeepSeekClient {
  private config: ResolvedConfig;
  private openai: OpenAI;
  private braveSearch?: BraveSearchClient;
  private toolManager: ToolManager;
  private toolLoop: ToolLoop;

  constructor(config: DeepSeekConfig) {
    if (!config.deepseekApiKey) {
      throw new ConfigError("deepseekApiKey is required");
    }
    this.config = resolveConfig(config);

    this.openai = new OpenAI({
      apiKey: this.config.deepseekApiKey,
      baseURL: this.config.baseURL,
    });

    if (config.braveSearchApiKey) {
      this.braveSearch = new BraveSearchClient(config.braveSearchApiKey);
    }

    this.toolManager = new ToolManager();
    this.toolLoop = new ToolLoop(this.openai, this.config, this.toolManager);

    this.registerBuiltinTools();
  }

  private registerBuiltinTools(): void {
    if (this.braveSearch) {
      this.toolManager.addTool(
        BRAVE_WEB_SEARCH_TOOL_DEFINITION,
        async (args) => {
          const result = await this.braveSearch!.webSearch(
            args.query as string,
            {
              freshness: args.freshness as BraveWebSearchOptions["freshness"],
              safesearch:
                (args.safesearch as BraveWebSearchOptions["safesearch"]) ??
                this.config.braveSearch.safesearch,
              count:
                (args.count as number) ?? this.config.braveSearch.count,
              country: this.config.braveSearch.country,
              searchLang: this.config.braveSearch.searchLang,
            },
          );
          return JSON.stringify(result);
        },
      );

      this.toolManager.addTool(
        BRAVE_LLM_CONTEXT_TOOL_DEFINITION,
        async (args) => {
          const result = await this.braveSearch!.llmContext(
            args.query as string,
            {
              freshness: args.freshness as BraveLLMContextOptions["freshness"],
              maxTokens: args.maxTokens as number,
              maxUrls: args.maxUrls as number,
              country: this.config.braveSearch.country,
              searchLang: this.config.braveSearch.searchLang,
              safesearch: this.config.braveSearch.safesearch,
            },
          );
          return JSON.stringify(result);
        },
      );
    }
  }

  async chat(
    messages: ChatMessage[],
    options?: {
      tools?: ToolDefinition[];
      toolChoice?: ToolChoice;
      model?: ModelName;
      thinking?: ThinkingConfig;
      reasoningEffort?: ReasoningEffort;
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      onToolCall?: ToolLoopCallbacks["onToolCall"];
      onToolResult?: ToolLoopCallbacks["onToolResult"];
    },
  ): Promise<ChatResponse> {
    const prevModel = this.config.model;
    const prevThinking = this.config.thinking;
    const prevEffort = this.config.reasoningEffort;
    const prevMaxTokens = this.config.maxTokens;
    const prevTemp = this.config.temperature;
    const prevTopP = this.config.topP;

    if (options?.model) this.config.model = options.model;
    if (options?.thinking) this.config.thinking = options.thinking;
    if (options?.reasoningEffort)
      this.config.reasoningEffort = options.reasoningEffort;
    if (options?.maxTokens !== undefined)
      this.config.maxTokens = options.maxTokens;
    if (options?.temperature !== undefined)
      this.config.temperature = options.temperature;
    if (options?.topP !== undefined) this.config.topP = options.topP;

    try {
      return await this.toolLoop.run(
        messages,
        options?.tools,
        options?.toolChoice,
        {
          onToolCall: options?.onToolCall,
          onToolResult: options?.onToolResult,
        },
      );
    } finally {
      this.config.model = prevModel;
      this.config.thinking = prevThinking;
      this.config.reasoningEffort = prevEffort;
      this.config.maxTokens = prevMaxTokens;
      this.config.temperature = prevTemp;
      this.config.topP = prevTopP;
    }
  }

  async chatStream(
    messages: ChatMessage[],
    options?: {
      tools?: ToolDefinition[];
      toolChoice?: ToolChoice;
      model?: ModelName;
      thinking?: ThinkingConfig;
      reasoningEffort?: ReasoningEffort;
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      onToolCall?: ToolLoopCallbacks["onToolCall"];
      onToolResult?: ToolLoopCallbacks["onToolResult"];
    },
  ): Promise<AsyncIterable<StreamChunk>> {
    const prevModel = this.config.model;
    const prevThinking = this.config.thinking;
    const prevEffort = this.config.reasoningEffort;
    const prevMaxTokens = this.config.maxTokens;
    const prevTemp = this.config.temperature;
    const prevTopP = this.config.topP;

    if (options?.model) this.config.model = options.model;
    if (options?.thinking) this.config.thinking = options.thinking;
    if (options?.reasoningEffort)
      this.config.reasoningEffort = options.reasoningEffort;
    if (options?.maxTokens !== undefined)
      this.config.maxTokens = options.maxTokens;
    if (options?.temperature !== undefined)
      this.config.temperature = options.temperature;
    if (options?.topP !== undefined) this.config.topP = options.topP;

    try {
      return await this.toolLoop.runStream(
        messages,
        options?.tools,
        options?.toolChoice,
        {
          onToolCall: options?.onToolCall,
          onToolResult: options?.onToolResult,
        },
      );
    } finally {
      this.config.model = prevModel;
      this.config.thinking = prevThinking;
      this.config.reasoningEffort = prevEffort;
      this.config.maxTokens = prevMaxTokens;
      this.config.temperature = prevTemp;
      this.config.topP = prevTopP;
    }
  }

  addTool(definition: ToolDefinition, handler?: ToolHandler): void {
    this.toolManager.addTool(definition, handler);
  }

  addTools(
    tools: Array<{ definition: ToolDefinition; handler?: ToolHandler }>,
  ): void {
    this.toolManager.addTools(tools);
  }

  removeTool(name: string): boolean {
    return this.toolManager.removeTool(name);
  }

  getTools(): RegisteredTool[] {
    return this.toolManager.getToolDefinitions().map((d) => {
      const registered = this.toolManager.getTool(d.function.name);
      return registered!;
    });
  }

  hasTool(name: string): boolean {
    return this.toolManager.hasTool(name);
  }

  async executeToolCall(
    name: string,
    args: Record<string, unknown>,
    toolCallId: string,
  ): Promise<ToolResult> {
    return this.toolManager.executeToolCall(name, args, toolCallId);
  }

  async search(
    query: string,
    options?: BraveWebSearchOptions,
  ): Promise<BraveWebSearchResponse> {
    if (!this.braveSearch) {
      throw new ConfigError(
        "Brave Search is not configured. Provide braveSearchApiKey in config.",
      );
    }
    return this.braveSearch.webSearch(query, options ?? {});
  }

  async searchAsContext(
    query: string,
    options?: BraveLLMContextOptions,
  ): Promise<BraveLLMContextResponse> {
    if (!this.braveSearch) {
      throw new ConfigError(
        "Brave Search is not configured. Provide braveSearchApiKey in config.",
      );
    }
    return this.braveSearch.llmContext(query, options ?? {});
  }

  get model(): ModelName {
    return this.config.model;
  }

  set model(m: ModelName) {
    this.config.model = m;
  }

  get thinking(): ThinkingConfig {
    return this.config.thinking;
  }

  set thinking(t: ThinkingConfig) {
    this.config.thinking = t;
  }

  get reasoningEffort(): ReasoningEffort {
    return this.config.reasoningEffort;
  }

  set reasoningEffort(r: ReasoningEffort) {
    this.config.reasoningEffort = r;
  }

  get braveSearchDefaults(): BraveSearchDefaults {
    return this.config.braveSearch;
  }

  set braveSearchDefaults(d: BraveSearchDefaults) {
    this.config.braveSearch = { ...this.config.braveSearch, ...d };
  }

  get openaiClient(): OpenAI {
    return this.openai;
  }
}
