import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function divide(
  a: number,
  b: number
): { result?: number; error?: string } {
  if (b === 0) {
    return { error: "Error: Division by zero" };
  }
  return { result: a / b };
}

export function registerDivideTool(server: McpServer) {
  server.tool(
    "divide",
    "Divide first number by second number.",
    {
      a: z.number().describe("Dividend (number to be divided)"),
      b: z.number().describe("Divisor (number to divide by)"),
    },
    async ({ a, b }) => {
      const result = divide(a, b);
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
