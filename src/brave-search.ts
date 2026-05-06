import { BraveSearchError } from "./errors.js";
import { BRAVE_WEB_SEARCH_URL, BRAVE_LLM_CONTEXT_URL } from "./types/models.js";
import type {
  BraveWebSearchOptions,
  BraveLLMContextOptions,
  BraveWebSearchResponse,
  BraveLLMContextResponse,
} from "./types/brave-search.js";

export class BraveSearchClient {
  constructor(private apiKey: string) {}

  async webSearch(
    query: string,
    options: BraveWebSearchOptions = {},
  ): Promise<BraveWebSearchResponse> {
    const params = new URLSearchParams();
    params.set("q", query);

    if (options.country) params.set("country", options.country);
    if (options.searchLang) params.set("search_lang", options.searchLang);
    if (options.safesearch) params.set("safesearch", options.safesearch);
    if (options.freshness) params.set("freshness", options.freshness);
    if (options.count !== undefined)
      params.set("count", String(options.count));
    if (options.offset !== undefined)
      params.set("offset", String(options.offset));
    if (options.extraSnippets)
      params.set("extra_snippets", "true");

    const url = `${BRAVE_WEB_SEARCH_URL}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "X-Subscription-Token": this.apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new BraveSearchError(
        `Brave Web Search failed: ${response.status} ${response.statusText}`,
        response.status,
      );
    }

    return response.json() as Promise<BraveWebSearchResponse>;
  }

  async llmContext(
    query: string,
    options: BraveLLMContextOptions = {},
  ): Promise<BraveLLMContextResponse> {
    const params = new URLSearchParams();
    params.set("q", query);

    if (options.country) params.set("country", options.country);
    if (options.searchLang) params.set("search_lang", options.searchLang);
    if (options.freshness) params.set("freshness", options.freshness);
    if (options.count !== undefined)
      params.set("count", String(options.count));
    if (options.maxUrls !== undefined)
      params.set("maximum_number_of_urls", String(options.maxUrls));
    if (options.maxTokens !== undefined)
      params.set("maximum_number_of_tokens", String(options.maxTokens));
    if (options.maxSnippets !== undefined)
      params.set("maximum_number_of_snippets", String(options.maxSnippets));
    if (options.maxTokensPerUrl !== undefined)
      params.set(
        "maximum_number_of_tokens_per_url",
        String(options.maxTokensPerUrl),
      );
    if (options.maxSnippetsPerUrl !== undefined)
      params.set(
        "maximum_number_of_snippets_per_url",
        String(options.maxSnippetsPerUrl),
      );
    if (options.contextThresholdMode)
      params.set("context_threshold_mode", options.contextThresholdMode);
    if (options.enableLocal !== undefined && options.enableLocal !== null)
      params.set("enable_local", String(options.enableLocal));
    if (options.safesearch) params.set("safesearch", options.safesearch);

    const url = `${BRAVE_LLM_CONTEXT_URL}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "X-Subscription-Token": this.apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new BraveSearchError(
        `Brave LLM Context failed: ${response.status} ${response.statusText}`,
        response.status,
      );
    }

    return response.json() as Promise<BraveLLMContextResponse>;
  }
}
