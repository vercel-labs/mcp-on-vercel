import { z } from "zod";

// TODO this is exported from `next` but is generic to all isomorphic web API signatures
import createMcpApiHandler from "@vercel/mcp-adapter";

const handler = createMcpApiHandler((server) => {
  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }],
  }));
});

export { handler as GET, handler as POST, handler as DELETE };
