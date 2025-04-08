import { BaasClient } from "@meeting-baas/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { registerBotTools } from "./bots";

export function registerTools(server: McpServer, apiKey: string): McpServer {
  const baasClient = new BaasClient({
    apiKey: apiKey,
  });

  // Register bot tools
  server = registerBotTools(server, baasClient);

  // Add a simple echo tool for testing
  server.tool("echo", { message: z.string() }, async ({ message }: { message: string }) => ({
    content: [
      {
        type: "text",
        text: `Tool echo: ${message}`,
      },
    ],
  }));

  return server;
}

export default registerTools; 