import type OpenAI from "openai";

// OpenAI's base types extended for DeepSeek-specific fields

/** A message in the conversation. Extends OpenAI's types with DeepSeek fields. */
export type ChatMessage =
  | OpenAI.Chat.Completions.ChatCompletionSystemMessageParam
  | OpenAI.Chat.Completions.ChatCompletionUserMessageParam
  | DeepSeekAssistantMessage
  | OpenAI.Chat.Completions.ChatCompletionToolMessageParam;

/** Assistant message with DeepSeek thinking-mode fields */
export interface DeepSeekAssistantMessage {
  role: "assistant";
  content: string | null;
  name?: string;
  reasoning_content?: string | null;
  tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] | null;
  prefix?: boolean;
}

// Responses — OpenAI compatible
export type ChatResponse = OpenAI.Chat.Completions.ChatCompletion;
export type StreamChunk = OpenAI.Chat.Completions.ChatCompletionChunk;
