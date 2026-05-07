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

// Responses — OpenAI compatible, extended for DeepSeek

export type ChatResponse = OpenAI.Chat.Completions.ChatCompletion & {
  choices: (OpenAI.Chat.Completions.ChatCompletion.Choice & {
    message: DeepSeekAssistantMessage;
  })[];
};

/** Stream chunk with DeepSeek reasoning_content on the delta */
export interface StreamChunk {
  id: string;
  model: string;
  object: "chat.completion.chunk";
  created: number;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
      reasoning_content?: string;
      tool_calls?: {
        index?: number;
        id?: string;
        type?: "function";
        function?: { name?: string; arguments?: string };
      }[];
    };
    finish_reason: string | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
