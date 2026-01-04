import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAddTool } from "./add.js";
import { registerSubtractTool } from "./subtract.js";
import { registerMultiplyTool } from "./multiply.js";
import { registerDivideTool } from "./divide.js";
import { registerPowerTool } from "./power.js";
import { registerModuloTool } from "./modulo.js";
import { registerSqrtTool } from "./sqrt.js";
import { registerAbsTool } from "./abs.js";
import {
  registerRoundTool,
  registerFloorTool,
  registerCeilTool,
} from "./round.js";
import { registerMinTool, registerMaxTool } from "./minmax.js";
import { registerFactorialTool } from "./factorial.js";
import { registerLogTool, registerLnTool } from "./logarithm.js";
import {
  registerSinTool,
  registerCosTool,
  registerTanTool,
} from "./trigonometry.js";
import { registerPercentTool } from "./percent.js";
import { registerAverageTool } from "./average.js";

export function registerMathTools(server: McpServer) {
  // Basic operations
  registerAddTool(server);
  registerSubtractTool(server);
  registerMultiplyTool(server);
  registerDivideTool(server);
  registerPowerTool(server);
  registerModuloTool(server);
  registerSqrtTool(server);
  // Advanced operations
  registerAbsTool(server);
  registerRoundTool(server);
  registerFloorTool(server);
  registerCeilTool(server);
  registerMinTool(server);
  registerMaxTool(server);
  registerFactorialTool(server);
  registerLogTool(server);
  registerLnTool(server);
  registerSinTool(server);
  registerCosTool(server);
  registerTanTool(server);
  registerPercentTool(server);
  registerAverageTool(server);
}
