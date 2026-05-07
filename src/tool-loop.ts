import type OpenAI from "openai";
import type { ChatMessage, ChatResponse, StreamChunk } from "./types/chat.js";
import type { ToolDefinition, ToolCall, ToolChoice } from "./types/tools.js";
import type { ResolvedConfig } from "./types/config.js";
import { ToolManager } from "./tool-manager.js";
import { ReasoningState } from "./reasoning.js";
import { ToolLoopError } from "./errors.js";

export interface ToolLoopCallbacks {
  /** Observe or override a tool call. Return undefined/null to delegate to the registered handler. */
  onToolCall?: (
    name: string,
    args: Record<string, unknown>,
    toolCallId: string,
  ) => Promise<string | null | undefined> | string | null | undefined;
  /** Called after each tool call completes with the result */
  onToolResult?: (name: string, result: string) => void;
}

export class ToolLoop {
  private reasoning: ReasoningState;

  constructor(
    private openai: OpenAI,
    private config: ResolvedConfig,
    private toolManager: ToolManager,
  ) {
    this.reasoning = new ReasoningState();
  }

  async run(
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    toolChoice?: ToolChoice,
    callbacks?: ToolLoopCallbacks,
  ): Promise<ChatResponse> {
    const allTools = [
      ...this.toolManager.getToolDefinitions(),
      ...(tools ?? []),
    ];

    let response = await this.makeRequest(messages, allTools, toolChoice);
    let iterations = 0;

    while (this.hasToolCalls(response) && iterations < this.config.maxToolLoopIterations) {
      iterations++;
      this.reasoning.startToolCallTurn();

      const choice = response.choices[0];
      if (!choice) break;

      const rawCalls = choice.message.tool_calls ?? [];
      const toolCalls = rawCalls.filter(
        (tc): tc is ToolCall => tc.type === "function",
      );
      const toolResults = await this.executeToolCalls(toolCalls, callbacks);

      messages.push(choice.message);
      for (const tr of toolResults) {
        messages.push(tr);
      }

      response = await this.makeRequest(messages, allTools, toolChoice);
      this.reasoning.endToolCallTurn();
    }

    if (iterations >= this.config.maxToolLoopIterations) {
      const lastChoice = response.choices[0];
      if (lastChoice && this.hasToolCallsInChoice(response)) {
        throw new ToolLoopError(
          `Tool call loop exceeded maximum iterations (${this.config.maxToolLoopIterations})`,
          iterations,
        );
      }
    }

    return response;
  }

  async runStream(
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    toolChoice?: ToolChoice,
    callbacks?: ToolLoopCallbacks,
  ): Promise<AsyncIterable<StreamChunk>> {
    const allTools = [
      ...this.toolManager.getToolDefinitions(),
      ...(tools ?? []),
    ];

    let streamResult = await this.makeStreamRequest(messages, allTools, toolChoice);

    let iterations = 0;
    let accumulatedToolCalls: Array<{
      id: string;
      name: string;
      arguments: string;
    }> = [];
    let accumulatedReasoning = "";
    let finalChunks: StreamChunk[] = [];

    for await (const chunk of streamResult) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.reasoning_content) {
        accumulatedReasoning += delta.reasoning_content;
      }
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (tc.id) {
            accumulatedToolCalls.push({
              id: tc.id,
              name: tc.function?.name ?? "",
              arguments: tc.function?.arguments ?? "",
            });
          } else if (tc.function?.arguments) {
            const existing = accumulatedToolCalls[accumulatedToolCalls.length - 1];
            if (existing) {
              existing.arguments += tc.function.arguments;
            }
          }
        }
      }
      finalChunks.push(chunk);
    }

    if (accumulatedToolCalls.length > 0 && iterations < this.config.maxToolLoopIterations) {
      this.reasoning.startToolCallTurn();

      const toolResults = await this.executeToolCalls(
        accumulatedToolCalls.map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: { name: tc.name, arguments: tc.arguments },
        })),
        callbacks,
      );

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: null,
        reasoning_content: accumulatedReasoning || null,
        tool_calls: accumulatedToolCalls.map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: { name: tc.name, arguments: tc.arguments },
        })),
      };
      messages.push(assistantMsg);
      for (const tr of toolResults) {
        messages.push(tr);
      }

      const nextResponse = await this.makeStreamRequest(messages, allTools, toolChoice);
      this.reasoning.endToolCallTurn();
      return nextResponse;
    }

    return this.chunksToAsyncIterable(finalChunks);
  }

  private async makeRequest(
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    toolChoice?: ToolChoice,
  ): Promise<ChatResponse> {
    const params = {
      model: this.config.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      reasoning_effort: this.config.reasoningEffort,
      thinking: this.config.thinking,
    } as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

    if (tools && tools.length > 0) {
      params.tools = tools as OpenAI.Chat.Completions.ChatCompletionTool[];
      params.tool_choice = (toolChoice ?? "auto") as OpenAI.Chat.Completions.ChatCompletionToolChoiceOption;
    }
    if (this.config.maxTokens !== undefined) params.max_tokens = this.config.maxTokens;
    if (this.config.temperature !== undefined) params.temperature = this.config.temperature;
    if (this.config.topP !== undefined) params.top_p = this.config.topP;

    const result = await this.openai.chat.completions.create(params);
    return result as unknown as ChatResponse;
  }

  private async makeStreamRequest(
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    toolChoice?: ToolChoice,
  ): Promise<AsyncIterable<StreamChunk>> {
    const params = {
      model: this.config.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      stream: true as const,
      reasoning_effort: this.config.reasoningEffort,
      thinking: this.config.thinking,
    } as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming;

    if (tools && tools.length > 0) {
      params.tools = tools as OpenAI.Chat.Completions.ChatCompletionTool[];
      params.tool_choice = (toolChoice ?? "auto") as OpenAI.Chat.Completions.ChatCompletionToolChoiceOption;
    }
    if (this.config.maxTokens !== undefined) params.max_tokens = this.config.maxTokens;
    if (this.config.temperature !== undefined) params.temperature = this.config.temperature;
    if (this.config.topP !== undefined) params.top_p = this.config.topP;

    const stream = await this.openai.chat.completions.create(params);
    return stream as unknown as AsyncIterable<StreamChunk>;
  }

  private async executeToolCalls(
    toolCalls: ToolCall[],
    callbacks?: ToolLoopCallbacks,
  ) {
    const results = [];
    for (const tc of toolCalls) {
      const name = tc.function.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {
        args = {};
      }

      if (callbacks?.onToolCall) {
        const result = await callbacks.onToolCall(name, args, tc.id);
        if (result !== undefined && result !== null) {
          // Callback handled it — use its return value
          results.push({
            tool_call_id: tc.id,
            role: "tool" as const,
            content: result,
          });
          callbacks.onToolResult?.(name, result);
          continue;
        }
        // result is undefined/null — fall through to registered handler
      }
      if (this.toolManager.hasHandler(name)) {
        const tr = await this.toolManager.executeToolCall(name, args, tc.id);
        results.push(tr);
        callbacks?.onToolResult?.(name, typeof tr.content === "string" ? tr.content : JSON.stringify(tr.content));
      } else {
        results.push({
          tool_call_id: tc.id,
          role: "tool" as const,
          content: `Tool "${name}" has no handler registered. Register a handler to enable automatic execution.`,
        });
      }
    }
    return results;
  }

  private hasToolCalls(response: ChatResponse): boolean {
    return this.hasToolCallsInChoice(response);
  }

  private hasToolCallsInChoice(response: ChatResponse): boolean {
    const choice = response.choices[0];
    if (!choice) return false;
    return (
      choice.finish_reason === "tool_calls" &&
      (choice.message.tool_calls?.length ?? 0) > 0
    );
  }

  private async *chunksToAsyncIterable(
    chunks: StreamChunk[],
  ): AsyncIterable<StreamChunk> {
    for (const chunk of chunks) {
      yield chunk;
    }
  }

  get reasoningState(): ReasoningState {
    return this.reasoning;
  }

  resetReasoning(): void {
    this.reasoning.reset();
  }
}
