import type OpenAI from "openai";

/** A single property in a JSON Schema object */
export interface JsonProperty {
  type: string;
  description?: string;
  enum?: readonly string[];
  minimum?: number;
  maximum?: number;
  items?: JsonProperty;
}

/** JSON Schema object definition for tool parameters */
export interface JsonSchemaObject {
  type: "object";
  properties: Record<string, JsonProperty>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: JsonSchemaObject;
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
