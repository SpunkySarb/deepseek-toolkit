# deepseek-toolkit

DeepSeek API toolkit with built-in Brave Search — batteries-included TypeScript wrapper for chat, tools, and web search.

```bash
npm install deepseek-toolkit
```

## Quick Start

```ts
import { DeepSeekClient } from "deepseek-toolkit";

const client = new DeepSeekClient({
  deepseekApiKey: process.env.DEEPSEEK_API_KEY!,
  braveSearchApiKey: process.env.BRAVE_SEARCH_API_KEY!, // optional
});

const response = await client.chat([
  { role: "user", content: "What's new in AI?" },
]);

console.log(response.choices[0].message.content);
```

## Features

- **DeepSeek V4** — `deepseek-v4-pro` and `deepseek-v4-flash` models
- **Thinking mode** — `enabled` / `disabled` with `reasoning_effort`: `high` or `max`
- **Built-in Brave Search** — web search and LLM-optimized context, auto-registered as tools
- **Custom tools** — `addTool()` with typed handlers, auto-execution loop
- **Streaming** — `chatStream()` with async iterable
- **Full TypeScript** — types exported for everything
- **ESM + CJS** — dual build, works everywhere
- **Minimal setup** — sensible defaults, zero config needed

## Configuration

```ts
interface DeepSeekConfig {
  deepseekApiKey: string;                    // required
  braveSearchApiKey?: string;                // optional — enables built-in search tools
  model?: "deepseek-v4-pro" | "deepseek-v4-flash";  // default: "deepseek-v4-pro"
  thinking?: { type: "enabled" | "disabled" };      // default: { type: "enabled" }
  reasoningEffort?: "high" | "max";                  // default: "high"
  braveSearch?: {
    safesearch?: "off" | "moderate" | "strict";     // default: "off"
    freshness?: "pd" | "pw" | "pm" | "py";
    country?: string;                                // default: "US"
    searchLang?: string;                             // default: "en"
    count?: number;                                  // default: 10
  };
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  baseURL?: string;                          // default: "https://api.deepseek.com"
  maxToolLoopIterations?: number;            // default: 10
}
```

## API

### Chat

```ts
// Single-turn
const r = await client.chat([
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Hello!" },
]);
console.log(r.choices[0].message.content);

// Streaming
const stream = await client.chatStream([
  { role: "user", content: "Tell me a story." },
]);
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}
```

### Thinking Mode

```ts
// High reasoning effort (default)
const r = await client.chat([
  { role: "user", content: "9.11 and 9.8, which is greater?" },
]);
console.log(r.choices[0].message.reasoning_content); // chain-of-thought
console.log(r.choices[0].message.content);           // final answer

// Max reasoning effort for harder problems
client.reasoningEffort = "max";

// Disable thinking for fast responses
client.thinking = { type: "disabled" };

// Per-request override
const r = await client.chat(messages, {
  thinking: { type: "disabled" },
  reasoningEffort: "max",
});
```

### Brave Search

```ts
// Direct web search (bypasses the model)
const results = await client.search("climate news", {
  freshness: "pw",       // past week
  safesearch: "moderate",
  count: 5,
});
console.log(results.web?.results);

// LLM-optimized search (pre-extracted content for AI consumption)
const ctx = await client.searchAsContext("TypeScript 5.8 features", {
  maxTokens: 4096,
  maxUrls: 5,
});
console.log(ctx.grounding.generic);

// Let the model decide when to search (auto tool-calling)
const r = await client.chat([
  { role: "user", content: "Search the web: What's the latest TypeScript version?" },
]);
// The model calls brave_web_search, the library executes it, returns grounded answer
console.log(r.choices[0].message.content);
```

### Custom Tools

```ts
import type { ToolDefinition } from "deepseek-toolkit";

const weatherTool: ToolDefinition = {
  type: "function",
  function: {
    name: "get_weather",
    description: "Get current weather for a city",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name" },
      },
      required: ["city"],
    },
  },
};

// Register with a handler for auto-execution
client.addTool(weatherTool, async (args) => {
  const city = args.city;
  // Call your weather API here
  return JSON.stringify({ city, temp: 22, condition: "Sunny" });
});

// Register multiple tools at once
client.addTools([
  { definition: toolA, handler: handlerA },
  { definition: toolB, handler: handlerB },
]);

// The model calls your tool, library auto-executes, loops until done
const r = await client.chat([
  { role: "user", content: "What's the weather in Tokyo?" },
]);
console.log(r.choices[0].message.content);

// Remove a tool
client.removeTool("get_weather");
```

### Runtime Config

```ts
// Switch model
client.model = "deepseek-v4-flash";

// Toggle thinking
client.thinking = { type: "disabled" };
client.reasoningEffort = "max";

// Update Brave Search defaults
client.braveSearchDefaults = { safesearch: "strict", country: "DE" };
```

### Per-Request Options

```ts
const r = await client.chat(messages, {
  model: "deepseek-v4-flash",
  thinking: { type: "disabled" },
  maxTokens: 500,
  temperature: 0.7,
  tools: [myTool],
  toolChoice: "auto",
  onToolCall: async (name, args, id) => {
    console.log(`Model called: ${name}(${JSON.stringify(args)})`);
    return "custom result";
  },
  onToolResult: (name, result) => {
    console.log(`Tool result: ${name} → ${result}`);
  },
});
```

## Advanced

### Access the raw OpenAI client

```ts
const openai = client.openaiClient; // OpenAI instance
```

### Direct tool management

```ts
import { ToolManager } from "deepseek-toolkit";

const tm = new ToolManager();
tm.addTool(myDefinition, myHandler);
const result = await tm.executeToolCall("my_tool", { arg: "val" }, "call_id");
```

### Error types

```ts
import {
  DeepSeekError,
  BraveSearchError,
  ToolError,
  ToolLoopError,
  ConfigError,
} from "deepseek-toolkit";
```

## License

MIT
