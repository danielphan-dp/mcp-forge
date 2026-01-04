import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerJsonFormatTool } from "./json_format.js";
import { registerUrlEncodeTool, registerUrlDecodeTool } from "./url_encode.js";
import {
  registerBase64EncodeTool,
  registerBase64DecodeTool,
} from "./base64.js";

export function registerDeveloperTools(server: McpServer) {
  registerJsonFormatTool(server);
  registerUrlEncodeTool(server);
  registerUrlDecodeTool(server);
  registerBase64EncodeTool(server);
  registerBase64DecodeTool(server);
}
