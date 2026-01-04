import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function add(a: number, b: number): number {
  return a + b;
}

export function registerAddTool(server: McpServer) {
  server.tool(
    "add",
    "Add two numbers.",
    {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    },
    async ({ a, b }) => ({
      content: [{ type: "text", text: String(add(a, b)) }],
    })
  );
}
