import type OpenAI from "openai";

// Directly use OpenAI's tool types — no reinvention
export type ToolDefinition = OpenAI.Chat.Completions.ChatCompletionFunctionTool;

export type ToolCall = OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall;

export type ToolResult = OpenAI.Chat.Completions.ChatCompletionToolMessageParam;

export type ToolChoice = OpenAI.Chat.Completions.ChatCompletionToolChoiceOption;

export type ToolHandler<TParams = Record<string, unknown>> = (
  args: TParams,
) => Promise<string> | string;

export interface RegisteredTool {
  definition: ToolDefinition;
  handler?: ToolHandler;
}
