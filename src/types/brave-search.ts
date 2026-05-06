export type SafeSearch = "off" | "moderate" | "strict";

export type Freshness = "pd" | "pw" | "pm" | "py";

export interface BraveWebSearchOptions {
  country?: string;
  searchLang?: string;
  safesearch?: SafeSearch;
  freshness?: Freshness;
  count?: number;
  offset?: number;
  extraSnippets?: boolean;
}

export interface BraveLLMContextOptions {
  count?: number;
  freshness?: Freshness;
  country?: string;
  searchLang?: string;
  maxUrls?: number;
  maxTokens?: number;
  maxSnippets?: number;
  maxTokensPerUrl?: number;
  maxSnippetsPerUrl?: number;
  contextThresholdMode?: "strict" | "balanced" | "lenient" | "disabled";
  enableLocal?: boolean | null;
  safesearch?: SafeSearch;
}

export interface BraveWebResult {
  title: string;
  url: string;
  description: string;
  extra_snippets?: string[];
  is_source_local?: boolean;
  is_source_both?: boolean;
  page_age?: string;
  profile?: {
    name: string;
    url: string;
    long_name: string;
    img: string;
  };
  meta_url?: {
    scheme: string;
    netloc: string;
    hostname: string;
    favicon: string;
    path: string;
  };
  age?: string;
}

export interface BraveWebSearchResponse {
  web?: {
    type: string;
    results: BraveWebResult[];
    family_friendly?: boolean;
  };
  query?: {
    original: string;
    more_results_available?: boolean;
  };
}

export interface BraveLLMContextSnippet {
  title: string;
  url: string;
  snippets: string[];
}

export interface BraveLLMContextResponse {
  grounding: {
    generic: BraveLLMContextSnippet[];
  };
}
