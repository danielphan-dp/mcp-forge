import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure function for testing
export function baseConvert(
  value: string,
  fromBase: "2" | "8" | "10" | "16",
  toBase: "2" | "8" | "10" | "16"
): { result?: string; error?: string } {
  try {
    const trimmed = value.trim();
    const hasSign = trimmed.startsWith("-") || trimmed.startsWith("+");
    const sign = trimmed.startsWith("-") ? "-" : "";
    let unsigned = hasSign ? trimmed.slice(1) : trimmed;

    if (fromBase === "16" && unsigned.toLowerCase().startsWith("0x")) {
      unsigned = unsigned.slice(2);
    } else if (fromBase === "8" && unsigned.toLowerCase().startsWith("0o")) {
      unsigned = unsigned.slice(2);
    } else if (fromBase === "2" && unsigned.toLowerCase().startsWith("0b")) {
      unsigned = unsigned.slice(2);
    }

    const patterns: Record<string, RegExp> = {
      "2": /^[01]+$/i,
      "8": /^[0-7]+$/i,
      "10": /^\d+$/i,
      "16": /^[0-9a-f]+$/i,
    };

    if (!unsigned || !patterns[fromBase].test(unsigned)) {
      return { error: `Error: Invalid value "${value}" for base ${fromBase}` };
    }

    const decimal = parseInt(`${sign}${unsigned}`, parseInt(fromBase));
    if (isNaN(decimal)) {
      return { error: `Error: Invalid value "${value}" for base ${fromBase}` };
    }
    const result = decimal.toString(parseInt(toBase));
    const prefix =
      toBase === "2"
        ? "0b"
        : toBase === "8"
        ? "0o"
        : toBase === "16"
        ? "0x"
        : "";
    return { result: `${prefix}${result.toUpperCase()}` };
  } catch {
    return { error: "Error: Conversion failed" };
  }
}

export function registerBaseConvertTool(server: McpServer) {
  server.tool(
    "base_convert",
    "Convert a number between different bases (binary, octal, decimal, hex).",
    {
      value: z.string().describe("The value to convert"),
      fromBase: z
        .enum(["2", "8", "10", "16"])
        .describe("Source base: 2 (binary), 8 (octal), 10 (decimal), 16 (hex)"),
      toBase: z
        .enum(["2", "8", "10", "16"])
        .describe("Target base: 2 (binary), 8 (octal), 10 (decimal), 16 (hex)"),
    },
    async ({ value, fromBase, toBase }) => {
      const result = baseConvert(value, fromBase, toBase);
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
