import { BaasClient } from "@meeting-baas/sdk/dist/baas/api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBotTools } from "./bots";
import { registerEchoTool } from "./utils/echo";
// import { registerJoinSpeakingTool } from "./bots/join-speaking";

export function registerTools(server: McpServer, apiKey: string): McpServer {
  const baasClient = new BaasClient({
    apiKey: apiKey,
    baseUrl: "https://api.meetingbaas.com/",
  });

  // Register bot tools
  let updatedServer = registerBotTools(server, baasClient);

  // Add echo tool for testing
  const finalServer = registerEchoTool(updatedServer);

  return finalServer;
}

export default registerTools;
