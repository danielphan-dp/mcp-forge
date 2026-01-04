import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure functions for testing
export function percentOf(x: number, y: number): number {
  return (x / 100) * y;
}

export function percentIs(
  x: number,
  y: number
): { result?: number; error?: string } {
  if (y === 0) {
    return { error: "Error: Cannot calculate percentage of zero" };
  }
  return { result: (x / y) * 100 };
}

export function registerPercentTool(server: McpServer) {
  server.tool(
    "percent",
    "Calculate percentage: what is X% of Y, or what percent is X of Y.",
    {
      operation: z
        .enum(["of", "is"])
        .describe("'of' = calculate X% of Y, 'is' = what percent is X of Y"),
      x: z.number().describe("First number"),
      y: z.number().describe("Second number"),
    },
    async ({ operation, x, y }) => {
      if (operation === "of") {
        const result = percentOf(x, y);
        return {
          content: [{ type: "text", text: `${x}% of ${y} = ${result}` }],
        };
      } else {
        const result = percentIs(x, y);
        if (result.error) {
          return {
            content: [{ type: "text", text: result.error }],
            isError: true,
          };
        }
        return {
          content: [
            { type: "text", text: `${x} is ${result.result}% of ${y}` },
          ],
        };
      }
    }
  );
}
