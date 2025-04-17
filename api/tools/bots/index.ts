import { BaasClient } from "@meeting-baas/sdk/dist/baas/api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerJoinTool } from "./join";
import { registerJoinSpeakingTool } from "./join-speaking";

export function registerBotTools(
  server: McpServer,
  baasClient: BaasClient
): McpServer {
  // Register all bot-related tools
  let updatedServer = registerJoinTool(server, baasClient);
  updatedServer = registerJoinSpeakingTool(server);

  return updatedServer;
}
