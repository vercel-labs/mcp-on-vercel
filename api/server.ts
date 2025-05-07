const z = require("zod");

// TODO this is exported from `next` but is generic to all isomorphic web API signatures
const createMcpApiHandler = require("@vercel/mcp-adapter/next");

const handler = createMcpApiHandler((server) => {
  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }],
  }));
});

export { handler as GET, handler as POST, handler as DELETE };
