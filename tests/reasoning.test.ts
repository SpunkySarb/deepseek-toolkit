import { describe, it, expect } from "vitest";
import { ReasoningState } from "../src/reasoning.js";
import type { ChatMessage } from "../src/types/chat.js";

describe("ReasoningState", () => {
  it("starts with shouldIncludeReasoning as false", () => {
    const rs = new ReasoningState();
    expect(rs.shouldIncludeReasoning()).toBe(false);
  });

  it("returns true during active tool call turn", () => {
    const rs = new ReasoningState();
    rs.startToolCallTurn();
    expect(rs.shouldIncludeReasoning()).toBe(true);
    rs.endToolCallTurn();
    expect(rs.shouldIncludeReasoning()).toBe(false);
  });

  it("resets state", () => {
    const rs = new ReasoningState();
    rs.startToolCallTurn();
    rs.reset();
    expect(rs.shouldIncludeReasoning()).toBe(false);
  });

  it("strips reasoning_content when not in tool call turn", () => {
    const rs = new ReasoningState();
    const msg: ChatMessage = {
      role: "assistant",
      content: "Final answer",
      reasoning_content: "Some reasoning here",
    };
    const cleaned = rs.cleanMessageForContext(msg);
    expect(cleaned.content).toBe("Final answer");
    expect(cleaned.reasoning_content).toBeUndefined();
  });

  it("keeps reasoning_content during tool call turn when tool_calls present", () => {
    const rs = new ReasoningState();
    rs.startToolCallTurn();
    const msg: ChatMessage = {
      role: "assistant",
      content: null,
      reasoning_content: "I should call the weather tool",
      tool_calls: [
        {
          id: "call_1",
          type: "function",
          function: { name: "get_weather", arguments: '{"city":"NYC"}' },
        },
      ],
    };
    const cleaned = rs.cleanMessageForContext(msg);
    expect(cleaned.reasoning_content).toBe("I should call the weather tool");
  });
});
