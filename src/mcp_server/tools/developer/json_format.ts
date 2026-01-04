import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function jsonFormat(
  json: string,
  minify: boolean = false,
  indent: number = 2
): { result?: string; error?: string } {
  try {
    const parsed = JSON.parse(json);
    const result = minify
      ? JSON.stringify(parsed)
      : JSON.stringify(parsed, null, indent);
    return { result };
  } catch {
    return { error: "Error: Invalid JSON" };
  }
}

export function registerJsonFormatTool(server: McpServer) {
  server.tool(
    "json_format",
    "Pretty-print or minify JSON.",
    {
      json: z.string().describe("JSON string to format"),
      minify: z
        .boolean()
        .default(false)
        .describe("Minify instead of pretty-print (default: false)"),
      indent: z
        .number()
        .int()
        .min(1)
        .max(8)
        .default(2)
        .describe("Indentation spaces (default: 2)"),
    },
    async ({ json, minify, indent }) => {
      const result = jsonFormat(json, minify, indent);
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
