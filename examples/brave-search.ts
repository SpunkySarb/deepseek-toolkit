import { DeepSeekClient } from "deepseek-toolkit";

// With both API keys, Brave Search tools are auto-registered
const client = new DeepSeekClient({
  deepseekApiKey: process.env.DEEPSEEK_API_KEY!,
  braveSearchApiKey: process.env.BRAVE_SEARCH_API_KEY!,
  // Configure default Brave Search settings
  braveSearch: {
    safesearch: "moderate",
    country: "US",
  },
});

async function main() {
  // Direct Brave Search (bypasses the model)
  const webResults = await client.search("latest AI news 2026");
  console.log("Web search results:", webResults.web?.results.length);

  // Let the model decide to use Brave Search as a tool
  console.log("\n--- Asking model (it will use web search if needed) ---\n");
  const response = await client.chat([
    {
      role: "user",
      content: "What are the latest developments in DeepSeek V4? Search the web to find up-to-date information.",
    },
  ]);

  console.log(response.choices[0]?.message.content);
}

main().catch(console.error);
