import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  registerTimestampTool,
  registerDateDiffTool,
  registerFormatDateTool,
} from "./datetime.js";

export function registerDateTimeTools(server: McpServer) {
  registerTimestampTool(server);
  registerDateDiffTool(server);
  registerFormatDateTool(server);
}
