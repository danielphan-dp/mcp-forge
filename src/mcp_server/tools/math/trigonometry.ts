import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure functions for testing
export function sin(
  angle: number,
  unit: "radians" | "degrees" = "radians"
): number {
  const radians = unit === "degrees" ? (angle * Math.PI) / 180 : angle;
  return Math.sin(radians);
}

export function cos(
  angle: number,
  unit: "radians" | "degrees" = "radians"
): number {
  const radians = unit === "degrees" ? (angle * Math.PI) / 180 : angle;
  return Math.cos(radians);
}

export function tan(
  angle: number,
  unit: "radians" | "degrees" = "radians"
): number {
  const radians = unit === "degrees" ? (angle * Math.PI) / 180 : angle;
  return Math.tan(radians);
}

export function registerSinTool(server: McpServer) {
  server.tool(
    "sin",
    "Calculate sine of an angle.",
    {
      angle: z.number().describe("The angle"),
      unit: z
        .enum(["radians", "degrees"])
        .default("radians")
        .describe("Angle unit (default: radians)"),
    },
    async ({ angle, unit }) => ({
      content: [{ type: "text", text: String(sin(angle, unit)) }],
    })
  );
}

export function registerCosTool(server: McpServer) {
  server.tool(
    "cos",
    "Calculate cosine of an angle.",
    {
      angle: z.number().describe("The angle"),
      unit: z
        .enum(["radians", "degrees"])
        .default("radians")
        .describe("Angle unit (default: radians)"),
    },
    async ({ angle, unit }) => ({
      content: [{ type: "text", text: String(cos(angle, unit)) }],
    })
  );
}

export function registerTanTool(server: McpServer) {
  server.tool(
    "tan",
    "Calculate tangent of an angle.",
    {
      angle: z.number().describe("The angle"),
      unit: z
        .enum(["radians", "degrees"])
        .default("radians")
        .describe("Angle unit (default: radians)"),
    },
    async ({ angle, unit }) => ({
      content: [{ type: "text", text: String(tan(angle, unit)) }],
    })
  );
}
