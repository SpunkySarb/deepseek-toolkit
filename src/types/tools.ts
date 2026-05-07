import type OpenAI from "openai";

// Stricter than OpenAI's FunctionDefinition — parameters must have type + properties
export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
      additionalProperties?: boolean;
    };
    strict?: boolean;
  };
}

// These remain directly from OpenAI
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
