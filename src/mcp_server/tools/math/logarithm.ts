import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure functions for testing
export function log(
  n: number,
  base: number = 10
): { result?: number; error?: string } {
  if (base === 1) {
    return { error: "Error: Base cannot be 1" };
  }
  return { result: Math.log(n) / Math.log(base) };
}

export function ln(n: number): number {
  return Math.log(n);
}

export function registerLogTool(server: McpServer) {
  server.tool(
    "log",
    "Calculate logarithm with specified base (default base 10).",
    {
      n: z.number().positive().describe("The number to calculate logarithm of"),
      base: z
        .number()
        .positive()
        .default(10)
        .describe("The base of the logarithm (default: 10)"),
    },
    async ({ n, base }) => {
      const result = log(n, base);
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

export function registerLnTool(server: McpServer) {
  server.tool(
    "ln",
    "Calculate natural logarithm (base e).",
    {
      n: z
        .number()
        .positive()
        .describe("The number to calculate natural logarithm of"),
    },
    async ({ n }) => ({
      content: [{ type: "text", text: String(ln(n)) }],
    })
  );
}
