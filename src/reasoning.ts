import type { ChatMessage, DeepSeekAssistantMessage } from "./types/chat.js";

export class ReasoningState {
  private activeToolCall = false;

  startToolCallTurn(): void {
    this.activeToolCall = true;
  }

  endToolCallTurn(): void {
    this.activeToolCall = false;
  }

  shouldIncludeReasoning(): boolean {
    return this.activeToolCall;
  }

  reset(): void {
    this.activeToolCall = false;
  }

  cleanMessageForContext(message: ChatMessage): ChatMessage {
    if (this.activeToolCall) return message;

    if (message.role === "assistant" && "reasoning_content" in message) {
      const msg = message as DeepSeekAssistantMessage;
      if (msg.reasoning_content && !msg.tool_calls?.length) {
        const { reasoning_content: _, ...rest } = msg;
        return rest as ChatMessage;
      }
    }
    return message;
  }
}
