import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure functions for testing
export function min(numbers: number[]): number {
  return Math.min(...numbers);
}

export function max(numbers: number[]): number {
  return Math.max(...numbers);
}

export function registerMinTool(server: McpServer) {
  server.tool(
    "min",
    "Find the minimum value from a list of numbers.",
    {
      numbers: z.array(z.number()).min(1).describe("Array of numbers"),
    },
    async ({ numbers }) => ({
      content: [{ type: "text", text: String(min(numbers)) }],
    })
  );
}

export function registerMaxTool(server: McpServer) {
  server.tool(
    "max",
    "Find the maximum value from a list of numbers.",
    {
      numbers: z.array(z.number()).min(1).describe("Array of numbers"),
    },
    async ({ numbers }) => ({
      content: [{ type: "text", text: String(max(numbers)) }],
    })
  );
}
