import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHash } from "crypto";

// Pure function for testing
export function hash(
  input: string,
  algorithm: "md5" | "sha1" | "sha256" | "sha512" = "sha256"
): string {
  return createHash(algorithm).update(input).digest("hex");
}

export function registerHashTool(server: McpServer) {
  server.tool(
    "hash",
    "Generate a hash of the input string.",
    {
      input: z.string().describe("The string to hash"),
      algorithm: z
        .enum(["md5", "sha1", "sha256", "sha512"])
        .default("sha256")
        .describe("Hash algorithm (default: sha256)"),
    },
    async ({ input, algorithm }) => ({
      content: [{ type: "text", text: hash(input, algorithm) }],
    })
  );
}
