import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function modulo(
  a: number,
  b: number
): { result?: number; error?: string } {
  if (b === 0) {
    return { error: "Error: Division by zero" };
  }
  return { result: a % b };
}

export function registerModuloTool(server: McpServer) {
  server.tool(
    "modulo",
    "Get the remainder of division (modulo operation).",
    {
      a: z.number().describe("Dividend"),
      b: z.number().describe("Divisor"),
    },
    async ({ a, b }) => {
      const result = modulo(a, b);
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
