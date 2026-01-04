import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { randomUUID } from "crypto";

// Pure functions for testing
export function generateUuid(): string {
  return randomUUID();
}

export function generateUuids(count: number): string[] {
  return Array.from({ length: count }, () => randomUUID());
}

export function registerUuidTool(server: McpServer) {
  server.tool(
    "uuid",
    "Generate a random UUID (v4).",
    {
      count: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(1)
        .describe("Number of UUIDs to generate (default: 1, max: 100)"),
    },
    async ({ count }) => ({
      content: [{ type: "text", text: generateUuids(count).join("\n") }],
    })
  );
}
