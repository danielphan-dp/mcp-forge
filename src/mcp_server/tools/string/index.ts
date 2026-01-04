import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  registerReverseTool,
  registerWordCountTool,
  registerUppercaseTool,
  registerLowercaseTool,
  registerSlugifyTool,
} from "./string.js";

export function registerStringTools(server: McpServer) {
  registerReverseTool(server);
  registerWordCountTool(server);
  registerUppercaseTool(server);
  registerLowercaseTool(server);
  registerSlugifyTool(server);
}
