import type {
  ToolDefinition,
  ToolHandler,
  RegisteredTool,
  ToolResult,
} from "./types/tools.js";
import { ToolError } from "./errors.js";

export class ToolManager {
  private tools: Map<string, RegisteredTool> = new Map();

  addTool<TParams = Record<string, unknown>>(
    definition: ToolDefinition,
    handler?: ToolHandler<TParams>,
  ): void {
    const name = definition.function.name;
    if (this.tools.has(name)) {
      throw new ToolError(`Tool "${name}" is already registered`, name);
    }
    // Safe: at runtime handler receives Record<string,unknown> from JSON.parse
    this.tools.set(name, { definition, handler: handler as ToolHandler });
  }

  addTools<TParams = Record<string, unknown>>(
    tools: Array<{
      definition: ToolDefinition;
      handler?: ToolHandler<TParams>;
    }>,
  ): void {
    for (const tool of tools) {
      this.addTool(tool.definition, tool.handler);
    }
  }

  removeTool(name: string): boolean {
    return this.tools.delete(name);
  }

  getTool(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  getToolDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  getHandler(name: string): ToolHandler | undefined {
    return this.tools.get(name)?.handler;
  }

  hasHandler(name: string): boolean {
    const tool = this.tools.get(name);
    return tool !== undefined && tool.handler !== undefined;
  }

  async executeToolCall(
    name: string,
    args: Record<string, unknown>,
    toolCallId: string,
  ): Promise<ToolResult> {
    const handler = this.getHandler(name);
    if (!handler) {
      throw new ToolError(
        `No handler registered for tool "${name}". Provide a handler via addTool() to enable automatic execution.`,
        name,
      );
    }
    const result = await handler(args);
    return {
      tool_call_id: toolCallId,
      role: "tool",
      content: typeof result === "string" ? result : JSON.stringify(result),
    };
  }

  get registeredCount(): number {
    return this.tools.size;
  }

  get registeredNames(): string[] {
    return Array.from(this.tools.keys());
  }

  clear(): void {
    this.tools.clear();
  }
}
