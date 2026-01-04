import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure functions for testing
export function base64Encode(text: string, urlSafe: boolean = false): string {
  let result = Buffer.from(text).toString("base64");
  if (urlSafe) {
    result = result.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return result;
}

export function base64Decode(
  text: string,
  urlSafe: boolean = false
): { result?: string; error?: string } {
  try {
    let input = text.trim();
    if (urlSafe) {
      input = input.replace(/-/g, "+").replace(/_/g, "/");
    }

    const stripped = input.replace(/=+$/, "");
    const hasInvalidChars = !/^[A-Za-z0-9+/]*$/.test(stripped);
    if (hasInvalidChars || input.length % 4 === 1) {
      return { error: "Error: Invalid Base64 string" };
    }

    const padding = input.length % 4;
    if (padding) {
      input += "=".repeat(4 - padding);
    }
    const result = Buffer.from(input, "base64").toString("utf8");
    return { result };
  } catch {
    return { error: "Error: Invalid Base64 string" };
  }
}

export function registerBase64EncodeTool(server: McpServer) {
  server.tool(
    "base64_encode",
    "Encode a string to Base64.",
    {
      text: z.string().describe("The string to encode"),
      urlSafe: z
        .boolean()
        .default(false)
        .describe("Use URL-safe Base64 (default: false)"),
    },
    async ({ text, urlSafe }) => ({
      content: [{ type: "text", text: base64Encode(text, urlSafe) }],
    })
  );
}

export function registerBase64DecodeTool(server: McpServer) {
  server.tool(
    "base64_decode",
    "Decode a Base64 string.",
    {
      text: z.string().describe("The Base64 string to decode"),
      urlSafe: z
        .boolean()
        .default(false)
        .describe("Input is URL-safe Base64 (default: false)"),
    },
    async ({ text, urlSafe }) => {
      const result = base64Decode(text, urlSafe);
      if (result.error) {
        return {
          content: [{ type: "text", text: result.error }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: result.result! }],
      };
    }
  );
}
