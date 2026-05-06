import { describe, it, expect } from "vitest";
import { BraveSearchClient } from "../src/brave-search.js";

describe("BraveSearchClient", () => {
  it("constructs with an API key", () => {
    const client = new BraveSearchClient("test-key");
    expect(client).toBeInstanceOf(BraveSearchClient);
  });

  it("throws on HTTP error for webSearch (no real key)", async () => {
    const client = new BraveSearchClient("invalid-key");
    await expect(
      client.webSearch("test query"),
    ).rejects.toThrow("Brave Web Search failed");
  });

  it("throws on HTTP error for llmContext (no real key)", async () => {
    const client = new BraveSearchClient("invalid-key");
    await expect(
      client.llmContext("test query"),
    ).rejects.toThrow("Brave LLM Context failed");
  });
});
