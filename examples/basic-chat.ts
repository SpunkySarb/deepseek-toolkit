import { DeepSeekClient } from "deepseek-toolkit";

// Minimal setup — just an API key
const client = new DeepSeekClient({
  deepseekApiKey: process.env.DEEPSEEK_API_KEY!,
});

async function main() {
  const response = await client.chat([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the capital of France?" },
  ]);

  console.log(response.choices[0]?.message.content);
}

main().catch(console.error);
