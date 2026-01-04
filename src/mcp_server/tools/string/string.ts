import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure functions for testing
export function reverse(text: string): string {
  return text.split("").reverse().join("");
}

export function wordCount(text: string): {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
} {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const lines = text.split(/\r?\n/).length;
  return { words, characters, charactersNoSpaces, lines };
}

export function uppercase(text: string): string {
  return text.toUpperCase();
}

export function lowercase(text: string): string {
  return text.toLowerCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function registerReverseTool(server: McpServer) {
  server.tool(
    "reverse",
    "Reverse a string.",
    {
      text: z.string().describe("The string to reverse"),
    },
    async ({ text }) => ({
      content: [{ type: "text", text: reverse(text) }],
    })
  );
}

export function registerWordCountTool(server: McpServer) {
  server.tool(
    "word_count",
    "Count words, characters, and lines in text.",
    {
      text: z.string().describe("The text to analyze"),
    },
    async ({ text }) => {
      const result = wordCount(text);
      return {
        content: [
          {
            type: "text",
            text: `Words: ${result.words}\nCharacters: ${result.characters}\nCharacters (no spaces): ${result.charactersNoSpaces}\nLines: ${result.lines}`,
          },
        ],
      };
    }
  );
}

export function registerUppercaseTool(server: McpServer) {
  server.tool(
    "uppercase",
    "Convert text to uppercase.",
    {
      text: z.string().describe("The text to convert"),
    },
    async ({ text }) => ({
      content: [{ type: "text", text: uppercase(text) }],
    })
  );
}

export function registerLowercaseTool(server: McpServer) {
  server.tool(
    "lowercase",
    "Convert text to lowercase.",
    {
      text: z.string().describe("The text to convert"),
    },
    async ({ text }) => ({
      content: [{ type: "text", text: lowercase(text) }],
    })
  );
}

export function registerSlugifyTool(server: McpServer) {
  server.tool(
    "slugify",
    "Convert text to a URL-friendly slug.",
    {
      text: z.string().describe("The text to slugify"),
    },
    async ({ text }) => ({
      content: [{ type: "text", text: slugify(text) }],
    })
  );
}
