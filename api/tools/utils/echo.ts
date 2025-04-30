import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";

export function registerEchoTool(server: McpServer): McpServer {
  server.tool(
    "echo",
    { message: z.string() },
    async ({ message }: { message: string }) => ({
      content: [
        {
          type: "text",
          text: `Tool echo: ${message}`,
        },
      ],
    })
  );

  return server;
}
