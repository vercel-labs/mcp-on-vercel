import { BaasClient } from "@meeting-baas/sdk/dist/baas/api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBotTools } from "./bots";
import { registerEchoTool } from "./utils/echo";

export function registerTools(server: McpServer, apiKey: string): McpServer {
  const baasClient = new BaasClient({
    apiKey: apiKey,
  });

  // Register bot tools
  const updatedServer = registerBotTools(server, baasClient);

  // Add echo tool for testing
  const finalServer = registerEchoTool(updatedServer);

  return finalServer;
}

export default registerTools;
