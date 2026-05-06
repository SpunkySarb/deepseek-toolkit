import type { ChatMessage } from "./types/chat.js";

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
    if (this.activeToolCall) {
      return message;
    }
    if (message.reasoning_content && !message.tool_calls?.length) {
      const { reasoning_content: _, ...rest } = message;
      return rest as ChatMessage;
    }
    return message;
  }
}
