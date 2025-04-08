import { BaasClient } from "@meeting-baas/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerJoinTool } from "./join";

export function registerBotTools(server: McpServer, baasClient: BaasClient): McpServer {
  // Register all bot-related tools
  const updatedServer = registerJoinTool(server, baasClient);
  
  return updatedServer;
} 