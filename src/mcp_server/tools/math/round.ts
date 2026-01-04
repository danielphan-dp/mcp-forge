import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure functions for testing
export function round(n: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

export function floor(n: number): number {
  return Math.floor(n);
}

export function ceil(n: number): number {
  return Math.ceil(n);
}

export function registerRoundTool(server: McpServer) {
  server.tool(
    "round",
    "Round a number to the nearest integer or specified decimal places.",
    {
      n: z.number().describe("The number to round"),
      decimals: z
        .number()
        .int()
        .min(0)
        .default(0)
        .describe("Number of decimal places (default: 0)"),
    },
    async ({ n, decimals }) => ({
      content: [{ type: "text", text: String(round(n, decimals)) }],
    })
  );
}

export function registerFloorTool(server: McpServer) {
  server.tool(
    "floor",
    "Round a number down to the nearest integer.",
    {
      n: z.number().describe("The number to floor"),
    },
    async ({ n }) => ({
      content: [{ type: "text", text: String(floor(n)) }],
    })
  );
}

export function registerCeilTool(server: McpServer) {
  server.tool(
    "ceil",
    "Round a number up to the nearest integer.",
    {
      n: z.number().describe("The number to ceil"),
    },
    async ({ n }) => ({
      content: [{ type: "text", text: String(ceil(n)) }],
    })
  );
}
