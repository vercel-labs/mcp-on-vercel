import { BaasClient, MpcClient } from "@meeting-baas/sdk";
import { IncomingMessage } from "http";
import { createClient } from "redis";
import { z } from "zod";
import { initializeMcpApiHandler } from "../lib/mcp-api-handler";

// Initialize Redis client
const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

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
      schema[param.name] = z.string();
    } else {
      schema[param.name] = z.string().optional();
    }
  }
  return schema;
}

// Helper to get BaaS client for each request
function getBaasClient(req: IncomingMessage): BaasClient {
  const url = new URL(req.url || "", "https://example.com");
  const apiKey = url.searchParams.get("X-Meeting-BaaS-Key") || "";
  return new BaasClient({
    apiKey,
  });
}

const handler = initializeMcpApiHandler(
  (server) => {
    return async (req: IncomingMessage) => {
      // Connect to Redis
      await redis.connect();

      // Get BaaS client for this request
      const baasClient = getBaasClient(req);

      // Register all Meeting BaaS tools automatically
      const tools = mpcClient.getRegisteredTools();
      for (const tool of tools) {
        const paramsSchema = convertToZodSchema(tool.parameters || []);
        server.tool(
          tool.name,
          paramsSchema,
          async (params: Record<string, string>) => {
            // Handle tool execution here using the request-specific baasClient
            try {
              // Here you would use baasClient to make the actual calls to Meeting BaaS
              // Example: await baasClient.someMethod(params);
              return {
                content: [
                  {
                    type: "text",
                    text: `Tool ${tool.name} executed with Meeting BaaS`,
                  },
                ],
              };
            } catch (error) {
              console.error(`Error executing tool ${tool.name}:`, error);
              throw error;
            }
          }
        );
      }

      // Add a Redis test tool
      server.tool(
        "redis_test",
        { key: z.string(), value: z.string() },
        async ({ key, value }: { key: string; value: string }) => {
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
      server.tool(
        "echo",
        { message: z.string() },
        async ({ message }: { message: string }) => ({
          content: [{ type: "text", text: `Tool echo: ${message}` }],
        })
      );
    };
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
      },
    },
  }
);

export default handler;
