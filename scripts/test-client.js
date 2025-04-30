"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");

// Load environment variables from .env file
require("dotenv").config();

// Create logs directory if it doesn't exist
const fs = require("fs");
const path = require("path");
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log(`Created log directory: ${logsDir}`);
  } catch (error) {
    console.error(`Failed to create log directory: ${error}`);
  }
}

async function main() {
  // Check and log environment variables
  console.log("Checking environment variables...");
  if (!process.env.REDIS_URL) {
    console.error("Error: REDIS_URL is not set in environment or .env file");
    process.exit(1);
  }

  console.log("Required environment variables:");
  console.log(
    `- REDIS_URL: ${process.env.REDIS_URL ? "✅ Available" : "❌ Missing"}`
  );
  console.log(
    `- BAAS_API_KEY: ${
      process.env.BAAS_API_KEY ? "✅ Available" : "❌ Missing"
    }`
  );

  // Create a new .env file specifically for the subprocess
  const tempEnvPath = path.join(process.cwd(), ".env.temp");
  try {
    fs.writeFileSync(
      tempEnvPath,
      `REDIS_URL=${process.env.REDIS_URL}\nBAAS_API_KEY=${
        process.env.BAAS_API_KEY || ""
      }\n`
    );
    console.log("Created temporary .env file for subprocess");
  } catch (error) {
    console.error("Failed to create temporary .env file:", error);
    process.exit(1);
  }

  // Create transport with command configuration
  const transport = new stdio_js_1.StdioClientTransport({
    command: "node",
    args: [
      "-r",
      "dotenv/config",
      "dist/api/server.js",
      `dotenv_config_path=${tempEnvPath}`,
    ],
    env: {
      ...process.env,
      NODE_ENV: "development",
      MCP_TRANSPORT_TYPE: "stdio",
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
      REDIS_URL: process.env.REDIS_URL,
      BAAS_API_KEY: process.env.BAAS_API_KEY || "",
    },
  });

  console.log("Starting MCP client with stdio transport");

  // Create client
  const client = new index_js_1.Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    }
  );
  try {
    // Connect to server
    console.log("Connecting to server...");
    await client.connect(transport);
    console.log("Connected!");
    // List available tools
    console.log("\nListing tools:");
    const tools = await client.listTools();
    console.log(JSON.stringify(tools, null, 2));
    // Test echo tool
    console.log("\nTesting echo tool:");
    try {
      const echoResult = await client.callTool({
        name: "echo",
        arguments: {
          message: "Hello from test client!",
        },
      });
      if (echoResult.content?.length) {
        console.log(
          "Echo response:",
          echoResult.content.map((c) => c.text).join("")
        );
      } else {
        console.log("Echo result:", JSON.stringify(echoResult, null, 2));
      }
    } catch (error) {
      console.error("Echo error:", error);
    }
    // Test joinMeeting tool
    console.log("\nTesting joinMeeting tool:");
    try {
      const joinResult = await client.callTool({
        name: "joinMeeting",
        arguments: {
          meetingUrl: "https://meet.google.com/gwt-jpqj-exx",
          botName: "TestBot",
          reserved: false,
        },
      });
      if (joinResult.content?.length) {
        console.log(
          "Join response:",
          joinResult.content.map((c) => c.text).join("")
        );
      } else {
        console.log("Join result:", JSON.stringify(joinResult, null, 2));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Join error:", error.message);
      } else {
        console.error("Join error:", error);
      }
    }

    // Test joinSpeakingMeeting tool
    console.log("\nTesting joinSpeakingMeeting tool:");
    try {
      const joinSpeakingResult = await client.callTool({
        name: "joinSpeakingMeeting",
        arguments: {
          meetingUrl: "https://meet.google.com/gwt-jpqj-exx",
          botName: "SpeakingTestBot",
          meetingBaasApiKey: process.env.BAAS_API_KEY || "test-key",
        },
      });
      if (joinSpeakingResult.content?.length) {
        console.log(
          "Join Speaking response:",
          joinSpeakingResult.content.map((c) => c.text).join("")
        );
      } else {
        console.log(
          "Join Speaking result:",
          JSON.stringify(joinSpeakingResult, null, 2)
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Join Speaking error:", error.message);
      } else {
        console.error("Join Speaking error:", error);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Error:", error);
    }
  } finally {
    // Clean up
    console.log("\nClosing connection...");
    try {
      // Clean up temporary .env file
      if (fs.existsSync(tempEnvPath)) {
        fs.unlinkSync(tempEnvPath);
        console.log("Removed temporary .env file");
      }
      await transport.close();
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }
}
// Add proper signal handling
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Cleaning up...");
  const tempEnvPath = path.join(process.cwd(), ".env.temp");
  if (fs.existsSync(tempEnvPath)) {
    fs.unlinkSync(tempEnvPath);
  }
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Cleaning up...");
  const tempEnvPath = path.join(process.cwd(), ".env.temp");
  if (fs.existsSync(tempEnvPath)) {
    fs.unlinkSync(tempEnvPath);
  }
  process.exit(0);
});
main().catch((error) => {
  console.error("Fatal error:", error);
  const tempEnvPath = path.join(process.cwd(), ".env.temp");
  if (fs.existsSync(tempEnvPath)) {
    fs.unlinkSync(tempEnvPath);
  }
  process.exit(1);
});
