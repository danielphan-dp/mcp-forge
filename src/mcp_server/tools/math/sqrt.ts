import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function sqrt(n: number): { result?: number; error?: string } {
  if (n < 0) {
    return { error: "Error: Cannot calculate square root of negative number" };
  }
  return { result: Math.sqrt(n) };
}

export function registerSqrtTool(server: McpServer) {
  server.tool(
    "sqrt",
    "Calculate the square root of a number.",
    {
      n: z.number().describe("The number to find the square root of"),
    },
    async ({ n }) => {
      const result = sqrt(n);
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
