import { describe, it, expect, beforeEach } from "vitest";
import { ToolManager } from "../src/tool-manager.js";
import type { ToolDefinition } from "../src/types/tools.js";

const makeTool = (name: string): ToolDefinition => ({
  type: "function",
  function: {
    name,
    description: `Test tool: ${name}`,
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
});

describe("ToolManager", () => {
  let tm: ToolManager;

  beforeEach(() => {
    tm = new ToolManager();
  });

  it("registers a tool", () => {
    const tool = makeTool("test");
    tm.addTool(tool);
    expect(tm.hasTool("test")).toBe(true);
    expect(tm.registeredCount).toBe(1);
  });

  it("throws on duplicate tool", () => {
    tm.addTool(makeTool("test"));
    expect(() => tm.addTool(makeTool("test"))).toThrow(
      'Tool "test" is already registered',
    );
  });

  it("registers multiple tools with addTools", () => {
    tm.addTools([
      { definition: makeTool("one") },
      { definition: makeTool("two") },
    ]);
    expect(tm.registeredCount).toBe(2);
    expect(tm.hasTool("one")).toBe(true);
    expect(tm.hasTool("two")).toBe(true);
  });

  it("removes a tool", () => {
    tm.addTool(makeTool("test"));
    expect(tm.removeTool("test")).toBe(true);
    expect(tm.hasTool("test")).toBe(false);
  });

  it("returns false removing nonexistent tool", () => {
    expect(tm.removeTool("nope")).toBe(false);
  });

  it("lists tool definitions", () => {
    tm.addTool(makeTool("a"));
    tm.addTool(makeTool("b"));
    const defs = tm.getToolDefinitions();
    expect(defs).toHaveLength(2);
    expect(defs.map((d) => d.function.name).sort()).toEqual(["a", "b"]);
  });

  it("executes a tool call with a handler", async () => {
    tm.addTool(makeTool("echo"), async (args) => {
      return `You said: ${args.query}`;
    });

    const result = await tm.executeToolCall(
      "echo",
      { query: "hello" },
      "call_123",
    );
    expect(result.role).toBe("tool");
    expect(result.tool_call_id).toBe("call_123");
    expect(result.content).toBe("You said: hello");
  });

  it("throws executing tool without handler", async () => {
    tm.addTool(makeTool("no_handler"));
    await expect(
      tm.executeToolCall("no_handler", {}, "call_1"),
    ).rejects.toThrow("No handler registered");
  });

  it("clears all tools", () => {
    tm.addTool(makeTool("a"));
    tm.addTool(makeTool("b"));
    tm.clear();
    expect(tm.registeredCount).toBe(0);
  });
});
