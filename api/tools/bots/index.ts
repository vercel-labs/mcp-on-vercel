import { BaasClient } from "@meeting-baas/sdk/dist/baas/api/client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { registerJoinSpeakingTool } from "./join-speaking";

export function registerBotTools(
  server: McpServer,
  baasClient?: BaasClient
): McpServer {
  // Register all bot-related tools
  let updatedServer = registerJoinSpeakingTool(server);
  return updatedServer;
}
