# Connecting to MCP Server via STDIO Transport

This document provides instructions on how to build, run, and connect to the MCP server using STDIO transport.

## Building the Project

First, build the TypeScript project to generate the JavaScript files in the `dist` directory:

```bash
npm run build
```

## Running the STDIO Server

There are two ways to run the STDIO server:

### Production Mode

```bash
npm run start:stdio
```

### Development Mode (with auto-recompilation)

```bash
npm run dev:stdio
```

This will start the STDIO server at `dist/api/stdio-server.js`.

## Connecting to the STDIO Server

### Using the Built-in Test Client

The simplest way to test the connection is using the built-in test client:

```bash
npm run test:client
```

This runs a pre-configured client that connects to the STDIO server, lists available tools, and tests both the echo and joinMeeting tools.

### Programmatic Connection Using the SDK

To connect programmatically from your own application:

```javascript
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const {
  StdioClientTransport,
} = require("@modelcontextprotocol/sdk/client/stdio.js");

async function main() {
  // Create a transport pointing to the stdio server
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/api/stdio-server.js"], // Path to the stdio server
    env: {
      ...process.env,
      NODE_ENV: "development",
      BAAS_API_KEY: "your-api-key", // Replace with your API key
      REDIS_URL: "your-redis-url", // Replace with your Redis URL
      MCP_TRANSPORT_TYPE: "stdio",
    },
  });

  // Create an MCP client
  const client = new Client(
    { name: "your-client", version: "1.0.0" },
    { capabilities: { prompts: {}, resources: {}, tools: {} } }
  );

  try {
    // Connect to the server
    console.log("Connecting to server...");
    await client.connect(transport);
    console.log("Connected!");

    // List available tools
    const tools = await client.listTools();
    console.log("Available tools:", JSON.stringify(tools, null, 2));

    // Call a tool
    const echoResult = await client.callTool({
      name: "echo",
      arguments: { message: "Hello from custom client!" },
    });

    console.log(
      "Echo response:",
      echoResult.content?.map((c) => c.text).join("") ||
        JSON.stringify(echoResult)
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Clean up
    await transport.close();
  }
}

main();
```

## Environment Variables

The following environment variables are used:

- `NODE_ENV`: Set to "development" for development mode
- `BAAS_API_KEY`: Your Meeting BaaS API key
- `REDIS_URL` or `KV_URL`: URL to your Redis instance
- `MCP_TRANSPORT_TYPE`: Set to "stdio" for proper logging

## Logging

Logs are written to:

- Console (in development mode)
- `logs/mcp-server.log` file in development mode
- `/tmp/mcp-server.log` in production mode

The logs directory is automatically created if it doesn't exist.

## Troubleshooting

If you encounter issues:

1. Ensure the STDIO server is running before connecting
2. Verify all required environment variables are set
3. Check the log files for error messages
4. Make sure Redis is running and accessible

## API Key Authentication

Authentication is optional for development purposes. In production, you should:

1. Provide the API key as an environment variable
2. Or pass it in the request headers as one of:
   - x-meeting-baas-api-key
   - x-meetingbaas-apikey
   - x-api-key
   - Authorization (as a Bearer token)
