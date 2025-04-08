import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerEchoTool(server: McpServer): McpServer {
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