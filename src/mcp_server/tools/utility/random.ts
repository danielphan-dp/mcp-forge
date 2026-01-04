import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function random(
  min: number = 0,
  max: number = 1,
  integer: boolean = false
): { result?: number; error?: string } {
  if (max <= min) {
    return { error: "Error: max must be greater than min" };
  }

  if (integer) {
    const minInt = Math.ceil(min);
    const maxInt = Math.floor(max);
    if (maxInt <= minInt) {
      return { error: "Error: No integers exist in the provided range" };
    }
    const result = Math.floor(Math.random() * (maxInt - minInt) + minInt);
    return { result };
  }

  const result = Math.random() * (max - min) + min;
  return { result };
}

export function registerRandomTool(server: McpServer) {
  server.tool(
    "random",
    "Generate a random number within a range.",
    {
      min: z
        .number()
        .default(0)
        .describe("Minimum value (inclusive, default: 0)"),
      max: z
        .number()
        .default(1)
        .describe("Maximum value (exclusive, default: 1)"),
      integer: z
        .boolean()
        .default(false)
        .describe("Return integer instead of float (default: false)"),
    },
    async ({ min, max, integer }) => {
      const result = random(min, max, integer);
      if (result.error) {
        return {
          content: [{ type: "text", text: result.error }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: String(result.result) }],
      };
    }
  );
}
