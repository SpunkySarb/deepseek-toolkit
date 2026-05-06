import { DeepSeekClient } from "deepseek-toolkit";

const client = new DeepSeekClient({
  deepseekApiKey: process.env.DEEPSEEK_API_KEY!,
});

async function main() {
  const stream = await client.chatStream([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Write a haiku about programming." },
  ]);

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (delta?.content) {
      process.stdout.write(delta.content);
    }
  }
  process.stdout.write("\n");
}

main().catch(console.error);
