import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
export const runtime = "nodejs";

const handler = createMcpHandler((server) => {
  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }],
  }));
});

export { handler as GET, handler as POST, handler as DELETE };
