import { DeepSeekClient } from "deepseek-toolkit";
import type { ToolDefinition } from "deepseek-toolkit";

const client = new DeepSeekClient({
  deepseekApiKey: process.env.DEEPSEEK_API_KEY!,
});

// Define a custom tool
const getWeatherTool: ToolDefinition = {
  type: "function",
  function: {
    name: "get_weather",
    description: "Get current weather for a city",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name, e.g. San Francisco",
        },
      },
      required: ["city"],
    },
  },
};

// Register it with a handler for auto-execution
client.addTool(getWeatherTool, async (args) => {
  const city = args.city as string;
  // In a real app, call a weather API here
  return JSON.stringify({
    city,
    temp: 22,
    condition: "Sunny",
    humidity: "45%",
  });
});

async function main() {
  const response = await client.chat(
    [
      { role: "user", content: "What's the weather in San Francisco?" },
    ],
    {
      tools: [getWeatherTool],
    },
  );

  console.log(response.choices[0]?.message.content);
}

main().catch(console.error);
