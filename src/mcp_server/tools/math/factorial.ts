import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function registerFactorialTool(server: McpServer) {
  server.tool(
    "factorial",
    "Calculate the factorial of a non-negative integer.",
    {
      n: z
        .number()
        .int()
        .min(0)
        .max(170)
        .describe("Non-negative integer (max 170 to avoid overflow)"),
    },
    async ({ n }) => ({
      content: [{ type: "text", text: String(factorial(n)) }],
    })
  );
}
