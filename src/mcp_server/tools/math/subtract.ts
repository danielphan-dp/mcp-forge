import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function subtract(a: number, b: number): number {
  return a - b;
}

export function registerSubtractTool(server: McpServer) {
  server.tool(
    "subtract",
    "Subtract second number from first number.",
    {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number to subtract"),
    },
    async ({ a, b }) => ({
      content: [{ type: "text", text: String(subtract(a, b)) }],
    })
  );
}
