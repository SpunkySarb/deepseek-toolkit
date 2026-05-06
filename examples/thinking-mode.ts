import { DeepSeekClient } from "deepseek-toolkit";

const client = new DeepSeekClient({
  deepseekApiKey: process.env.DEEPSEEK_API_KEY!,
  // Thinking is enabled by default with reasoning_effort: "high"
});

async function main() {
  // Turn 1 — thinks before answering
  console.log("--- Thinking mode (high) ---");
  const r1 = await client.chat([
    { role: "user", content: "9.11 and 9.8, which is greater?" },
  ]);

  console.log("Reasoning:", r1.choices[0]?.message.reasoning_content);
  console.log("Answer:", r1.choices[0]?.message.content);

  // Switch to max reasoning effort for harder problems
  console.log("\n--- Thinking mode (max effort) ---");
  client.reasoningEffort = "max";

  const r2 = await client.chat([
    {
      role: "user",
      content: "If a train leaves Station A at 60mph and another leaves Station B at 80mph going towards each other, and the stations are 280 miles apart, when do they meet?",
    },
  ]);

  console.log("Reasoning:", r2.choices[0]?.message.reasoning_content);
  console.log("Answer:", r2.choices[0]?.message.content);

  // Disable thinking for fast responses
  console.log("\n--- Non-thinking mode ---");
  client.thinking = { type: "disabled" };

  const r3 = await client.chat([
    { role: "user", content: "What is 2 + 2?" },
  ]);

  console.log("Answer:", r3.choices[0]?.message.content);
  // In non-thinking mode, reasoning_content will be null/empty
  console.log("Has reasoning:", !!r3.choices[0]?.message.reasoning_content);
}

main().catch(console.error);
