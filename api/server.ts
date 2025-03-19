import { BaasClient, MpcClient } from "@meeting-baas/sdk";
import { createClient } from "redis";
import { z } from "zod";
import { initializeMcpApiHandler } from "../lib/mcp-api-handler";

// Initialize Redis client
const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

// Initialize the BaaS client
const baasClient = new BaasClient({
  apiKey: process.env.MEETING_BAAS_API_KEY || "",
});

// Initialize MPC client for tool registration
const mpcClient = new MpcClient({
  serverUrl: process.env.MPC_SERVER_URL || "",
});

interface ToolParameter {
  name: string;
  required?: boolean;
  schema?: {
    type: string;
  };
}

// Helper function to convert MPC parameter definition to Zod schema
function convertToZodSchema(parameters: ToolParameter[]): z.ZodRawShape {
  const schema: z.ZodRawShape = {};
  for (const param of parameters) {
    if (param.required) {
      schema[param.name] = z.string(); // Default to string for now, can be expanded based on param.schema.type
    } else {
      schema[param.name] = z.string().optional();
    }
  }
  return schema;
}

const handler = initializeMcpApiHandler(
  async (server) => {
    // Connect to Redis
    await redis.connect();

    // Register all Meeting BaaS tools automatically
    const tools = mpcClient.getRegisteredTools();
    for (const tool of tools) {
      const paramsSchema = convertToZodSchema(tool.parameters || []);
      server.tool(tool.name, paramsSchema, async (params) => {
        // Handle tool execution here
        return {
          content: [{ type: "text", text: `Tool ${tool.name} executed` }],
        };
      });
    }

    // Add a Redis test tool
    server.tool(
      "redis_test",
      { key: z.string(), value: z.string() },
      async ({ key, value }) => {
        await redis.set(key, value);
        const result = await redis.get(key);
        return {
          content: [
            {
              type: "text",
              text: `Redis test: stored ${key}=${value}, retrieved ${result}`,
            },
          ],
        };
      }
    );

    // Keep the existing echo tool as an example
    server.tool("echo", { message: z.string() }, async ({ message }) => ({
      content: [{ type: "text", text: `Tool echo: ${message}` }],
    }));
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
        redis_test: {
          description:
            "Test Redis connection by storing and retrieving a key-value pair",
        },
        // Meeting BaaS tools will be automatically added to capabilities
      },
    },
  }
);

export default handler;
