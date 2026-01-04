import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function abs(n: number): number {
  return Math.abs(n);
}

export function registerAbsTool(server: McpServer) {
  server.tool(
    "abs",
    "Get the absolute value of a number.",
    {
      n: z.number().describe("The number to get absolute value of"),
    },
    async ({ n }) => ({
      content: [{ type: "text", text: String(abs(n)) }],
    })
  );
}
