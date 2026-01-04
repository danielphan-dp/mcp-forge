import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function average(numbers: number[]): number {
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return sum / numbers.length;
}

export function registerAverageTool(server: McpServer) {
  server.tool(
    "average",
    "Calculate the arithmetic mean (average) of a list of numbers.",
    {
      numbers: z.array(z.number()).min(1).describe("Array of numbers"),
    },
    async ({ numbers }) => ({
      content: [{ type: "text", text: String(average(numbers)) }],
    })
  );
}
