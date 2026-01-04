import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRandomTool } from "./random.js";
import { registerUuidTool } from "./uuid.js";
import { registerBaseConvertTool } from "./base_convert.js";
import { registerHashTool } from "./hash.js";

export function registerUtilityTools(server: McpServer) {
  registerRandomTool(server);
  registerUuidTool(server);
  registerBaseConvertTool(server);
  registerHashTool(server);
}
