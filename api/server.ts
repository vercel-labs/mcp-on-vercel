import { z } from "zod";
import createMcpApiHandler from "@vercel/mcp-adapter/next";

const handler = createMcpApiHandler((server) => {
  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }],
  }));
});

export { handler as GET, handler as POST, handler as DELETE };
