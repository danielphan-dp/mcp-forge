import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure functions for testing
export function urlEncode(text: string, component: boolean = true): string {
  return component ? encodeURIComponent(text) : encodeURI(text);
}

export function urlDecode(
  text: string,
  component: boolean = true
): { result?: string; error?: string } {
  try {
    const result = component ? decodeURIComponent(text) : decodeURI(text);
    return { result };
  } catch {
    return { error: "Error: Invalid encoded string" };
  }
}

export function registerUrlEncodeTool(server: McpServer) {
  server.tool(
    "url_encode",
    "URL-encode a string.",
    {
      text: z.string().describe("The string to encode"),
      component: z
        .boolean()
        .default(true)
        .describe("Use encodeURIComponent (true) or encodeURI (false)"),
    },
    async ({ text, component }) => ({
      content: [{ type: "text", text: urlEncode(text, component) }],
    })
  );
}

export function registerUrlDecodeTool(server: McpServer) {
  server.tool(
    "url_decode",
    "URL-decode a string.",
    {
      text: z.string().describe("The string to decode"),
      component: z
        .boolean()
        .default(true)
        .describe("Use decodeURIComponent (true) or decodeURI (false)"),
    },
    async ({ text, component }) => {
      const result = urlDecode(text, component);
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
