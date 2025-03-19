import { BaasClient, MpcClient } from "@meeting-baas/sdk";
import { z } from "zod";
import { initializeMcpApiHandler } from "../lib/mcp-api-handler";

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
        // Meeting BaaS tools will be automatically added to capabilities
      },
    },
  }
);

export default handler;
