import { BaasClient } from "@meeting-baas/sdk/dist/baas/api/client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { registerJoinTool } from "./join";
import { registerJoinSpeakingTool } from "./join-speaking";

export function registerBotTools(
  server: McpServer,
  baasClient?: BaasClient
): McpServer {
  // Extract the API key if the BaasClient is provided
  const apiKey = baasClient
    ? (baasClient as any).configuration.apiKey
    : undefined;

  // Register all bot-related tools
  let updatedServer = registerJoinSpeakingTool(server, apiKey);

  // Register the standard joinMeeting tool if baasClient is provided
  if (baasClient) {
    updatedServer = registerJoinTool(updatedServer, baasClient);
  }

  return updatedServer;
}
