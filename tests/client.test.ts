import { describe, it, expect } from "vitest";
import { DeepSeekClient } from "../src/client.js";
import {
  ConfigError,
  ToolError,
} from "../src/errors.js";
import {
  DEEPSEEK_MODELS,
  DEEPSEEK_BASE_URL,
} from "../src/types/models.js";

describe("DeepSeekClient", () => {
  it("throws without API key", () => {
    // @ts-expect-error testing missing key
    expect(() => new DeepSeekClient({})).toThrow(ConfigError);
  });

  it("constructs with minimal config", () => {
    const client = new DeepSeekClient({
      deepseekApiKey: "sk-test",
    });
    expect(client).toBeInstanceOf(DeepSeekClient);
    expect(client.model).toBe(DEEPSEEK_MODELS.V4_PRO);
    expect(client.thinking).toEqual({ type: "enabled" });
    expect(client.reasoningEffort).toBe("high");
  });

  it("constructs with Brave Search API key", () => {
    const client = new DeepSeekClient({
      deepseekApiKey: "sk-test",
      braveSearchApiKey: "bsk-test",
    });
    expect(client.hasTool("brave_web_search")).toBe(true);
    expect(client.hasTool("brave_llm_context")).toBe(true);
  });

  it("does not register Brave Search tools without API key", () => {
    const client = new DeepSeekClient({
      deepseekApiKey: "sk-test",
    });
    expect(client.hasTool("brave_web_search")).toBe(false);
    expect(client.hasTool("brave_llm_context")).toBe(false);
  });

  it("configures model on init", () => {
    const client = new DeepSeekClient({
      deepseekApiKey: "sk-test",
      model: "deepseek-v4-flash",
    });
    expect(client.model).toBe("deepseek-v4-flash");
  });

  it("switches model at runtime", () => {
    const client = new DeepSeekClient({ deepseekApiKey: "sk-test" });
    client.model = "deepseek-v4-flash";
    expect(client.model).toBe("deepseek-v4-flash");
  });

  it("switches thinking at runtime", () => {
    const client = new DeepSeekClient({ deepseekApiKey: "sk-test" });
    client.thinking = { type: "disabled" };
    expect(client.thinking).toEqual({ type: "disabled" });
  });

  it("switches reasoningEffort at runtime", () => {
    const client = new DeepSeekClient({ deepseekApiKey: "sk-test" });
    client.reasoningEffort = "max";
    expect(client.reasoningEffort).toBe("max");
  });

  it("configures custom base URL", () => {
    const client = new DeepSeekClient({
      deepseekApiKey: "sk-test",
      baseURL: DEEPSEEK_BASE_URL,
    });
    expect(client).toBeDefined();
  });

  it("adds custom tools", () => {
    const client = new DeepSeekClient({ deepseekApiKey: "sk-test" });
    client.addTool({
      type: "function",
      function: {
        name: "my_tool",
        description: "My custom tool",
        parameters: { type: "object", properties: {} },
      },
    });
    expect(client.hasTool("my_tool")).toBe(true);
    const tools = client.getTools();
    expect(tools.some((t) => t.definition.function.name === "my_tool")).toBe(true);
  });

  it("adds multiple custom tools", () => {
    const client = new DeepSeekClient({ deepseekApiKey: "sk-test" });
    client.addTools([
      {
        definition: {
          type: "function",
          function: {
            name: "tool_a",
            description: "A",
            parameters: {},
          },
        },
      },
      {
        definition: {
          type: "function",
          function: {
            name: "tool_b",
            description: "B",
            parameters: {},
          },
        },
      },
    ]);
    expect(client.hasTool("tool_a")).toBe(true);
    expect(client.hasTool("tool_b")).toBe(true);
  });

  it("removes tools", () => {
    const client = new DeepSeekClient({ deepseekApiKey: "sk-test" });
    client.addTool({
      type: "function",
      function: {
        name: "temp",
        description: "Temporary",
        parameters: {},
      },
    });
    expect(client.hasTool("temp")).toBe(true);
    expect(client.removeTool("temp")).toBe(true);
    expect(client.hasTool("temp")).toBe(false);
  });

  it("throws search() without Brave Search", async () => {
    const client = new DeepSeekClient({ deepseekApiKey: "sk-test" });
    await expect(client.search("test")).rejects.toThrow(ConfigError);
  });

  it("throws searchAsContext() without Brave Search", async () => {
    const client = new DeepSeekClient({ deepseekApiKey: "sk-test" });
    await expect(client.searchAsContext("test")).rejects.toThrow(ConfigError);
  });

  it("configures braveSearchDefaults", () => {
    const client = new DeepSeekClient({
      deepseekApiKey: "sk-test",
      braveSearchApiKey: "bsk-test",
      braveSearch: { safesearch: "strict", country: "DE" },
    });
    expect(client.braveSearchDefaults.safesearch).toBe("strict");
    expect(client.braveSearchDefaults.country).toBe("DE");
  });

  it("updates braveSearchDefaults at runtime", () => {
    const client = new DeepSeekClient({
      deepseekApiKey: "sk-test",
      braveSearchApiKey: "bsk-test",
    });
    client.braveSearchDefaults = { safesearch: "moderate" };
    expect(client.braveSearchDefaults.safesearch).toBe("moderate");
    // Existing defaults preserved
    expect(client.braveSearchDefaults.country).toBe("US");
  });
});
