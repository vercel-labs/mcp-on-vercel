# Meeting Baas MCP Server on Vercel

This is the main MCP (Model Context Protocol) server powering [chat.meetingbaas.com](https://chat.meetingbaas.com), providing the LLM integration and AI capabilities for the Meeting Baas chat interface. It's a fork of the [Vercel MCP template](https://github.com/vercel-labs/mcp-on-vercel) with Meeting Baas-specific modifications.

The server implements the Model Context Protocol (MCP) that integrates with Meeting Baas services, enabling:
- AI-powered chat interactions
- Meeting automation through LLMs
- Intelligent bot management
- Calendar integration with AI assistance

## Features

- Integration with [Meeting Baas SDK](https://www.npmjs.com/package/@meeting-baas/sdk) for video meeting management
- Support for both standard and speaking bots
- Calendar integration for automated meeting recordings
- Real-time transcription and audio streaming capabilities
- Comprehensive bot management tools

## SDK Integration

This project uses the official Meeting Baas SDK (`@meeting-baas/sdk`) which provides:

- Complete type safety with comprehensive TypeScript definitions
- Automatic updates synced with OpenAPI specification
- Simplified access to all meeting automation capabilities
- Cross-platform consistency for all supported meeting providers (Google Meet, Zoom, Microsoft Teams)
- Pre-generated MPC tools for easy integration with AI systems
- Strongly typed functions for interacting with the complete Meeting Baas API

## Environment Variables

The following environment variables are required:

- `REDIS_URL`: URL to your Redis instance (required for session management)

Optional environment variables:
- `NODE_ENV`: Set to "development" for development mode
- `LOG_LEVEL`: Set the logging level (defaults to "info")
- `BAAS_API_KEY`: Your Meeting Baas API key (only used in development mode)

## Authentication

The server supports multiple ways to provide the Meeting Baas API key:

1. Request headers (in order of precedence):
   - `x-meeting-baas-api-key`
   - `x-meetingbaas-apikey`
   - `x-api-key`
   - `Authorization` (as a Bearer token)

2. Request body (for POST requests):
   ```json
   {
     "apiKey": "your-api-key"
   }
   ```

3. Environment variable (development mode only):
   ```bash
   BAAS_API_KEY=your-api-key
   ```

Note: In production, the API key should be provided through request headers or body. The environment variable is only used in development mode for testing purposes.

## Usage

Update `api/server.ts` with your tools, prompts, and resources following the [MCP TypeScript SDK documentation](https://github.com/modelcontextprotocol/typescript-sdk/tree/main?tab=readme-ov-file#server).

[There is also a Next.js version of this template](https://vercel.com/templates/next.js/model-context-protocol-mcp-with-next-js)

## Notes for running on Vercel

- Requires a Redis attached to the project under `process.env.REDIS_URL`
- Make sure you have [Fluid compute](https://vercel.com/docs/functions/fluid-compute) enabled for efficient execution
- After enabling Fluid compute, open `vercel.json` and adjust max duration to 800 if you using a Vercel Pro or Enterprise account
- [Deploy the MCP template](https://vercel.com/templates/other/model-context-protocol-mcp-with-vercel-functions)

## Meeting Baas Integration

This fork includes several Meeting Baas-specific tools:

### Meeting Management
- Join meetings with AI bots
- Record meetings with transcription
- Manage speaking bots with different personas
- Leave meetings and clean up resources

### Calendar Management
- Create and manage calendar integrations
- Schedule automated recordings
- List and manage calendar events
- Update calendar configurations

### Bot Management
- List and monitor active bots
- Get detailed bot metadata
- Manage bot configurations

## Sample Client

`script/test-client.mjs` contains a sample client to try invocations.

```sh
node scripts/test-client.mjs https://mcp-on-vercel.vercel.app
```

## Differences from Original Template

This fork adds:
1. Meeting Baas SDK integration
2. Enhanced bot management capabilities
3. Calendar integration features
4. Speaking bot support with personas
5. Improved error handling and logging

## Contributing

This is a fork of the Vercel MCP template. For the original template, please visit [vercel-labs/mcp-on-vercel](https://github.com/vercel-labs/mcp-on-vercel).

## Documentation

For more information about the Meeting Baas SDK, visit:
- [SDK Documentation](https://docs.meetingbaas.com/com/docs/typescript-sdk)
- [npm Package](https://www.npmjs.com/package/@meeting-baas/sdk)
- [GitHub Repository](https://github.com/Meeting-Baas/sdk)
