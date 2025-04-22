import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { IncomingMessage, ServerResponse } from "http";
import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";

export function initializeMcpApiHandler(
  initializeServer: (server: McpServer) => void,
  serverOptions: ServerOptions = {}
) {
  let statelessServer: McpServer;
  const statelessTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  return async function mcpApiHandler(
    req: IncomingMessage,
    res: ServerResponse
  ) {
    const url = new URL(req.url || "", "https://example.com");
    if (url.pathname === "/mcp") {
      if (req.method === "GET") {
        console.log("Received GET MCP request");
        res.writeHead(405).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Method not allowed.",
            },
            id: null,
          })
        );
        return;
      }
      if (req.method === "DELETE") {
        console.log("Received DELETE MCP request");
        res.writeHead(405).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Method not allowed.",
            },
            id: null,
          })
        );
        return;
      }
      console.log("Got new MCP connection", req.url, req.method);

      if (!statelessServer) {
        statelessServer = new McpServer(
          {
            name: "mcp-typescript server on vercel",
            version: "0.1.0",
          },
          serverOptions
        );

        initializeServer(statelessServer);
        await statelessServer.connect(statelessTransport);
      }
      await statelessTransport.handleRequest(req, res);
    } else {
      res.writeHead(404).end("Not found");
    }
  };
}
