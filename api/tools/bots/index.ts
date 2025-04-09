import { BaasClient } from "@meeting-baas/sdk/dist/generated/baas/api/client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerJoinTool } from "./join";

export function registerBotTools(server: McpServer, baasClient: BaasClient): McpServer {
  // Register all bot-related tools
  const updatedServer = registerJoinTool(server, baasClient);
  
  return updatedServer;
} 