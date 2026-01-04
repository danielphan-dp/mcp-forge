import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMathTools } from "./math/index.js";
import { registerUtilityTools } from "./utility/index.js";
import { registerStringTools } from "./string/index.js";
import { registerDateTimeTools } from "./datetime/index.js";
import { registerDeveloperTools } from "./developer/index.js";

export function registerTools(server: McpServer) {
  registerMathTools(server);
  registerUtilityTools(server);
  registerStringTools(server);
  registerDateTimeTools(server);
  registerDeveloperTools(server);
}
