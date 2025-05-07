/// <reference types="node" />
import { type Config } from './mcp-api-handler';
import type { ServerOptions } from '@modelcontextprotocol/sdk/server/index.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates a MCP handler that can be used to handle MCP requests.
 * @param initializeServer - A function that initializes the MCP server. Use this to access the server instance and register tools, prompts, and resources.
 * @param serverOptions - Options for the MCP server.
 * @param config - Configuration for the MCP handler.
 * @returns A function that can be used to handle MCP requests.
 */
export default function createMcpRouteHandler(initializeServer: (server: McpServer) => void, serverOptions?: ServerOptions, config?: Config): (request: Request) => Promise<Response>;
