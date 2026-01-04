import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

export function registerPowerTool(server: McpServer) {
  server.tool(
    "power",
    "Raise a number to a power (exponentiation).",
    {
      base: z.number().describe("The base number"),
      exponent: z.number().describe("The exponent"),
    },
    async ({ base, exponent }) => ({
      content: [{ type: "text", text: String(power(base, exponent)) }],
    })
  );
}
