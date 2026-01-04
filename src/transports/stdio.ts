import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "../mcp_server/index.js";

async function main() {
  const debug = process.env.MCP_STDIO_DEBUG === "1";
  const debugLog = (...args: unknown[]) => {
    if (debug) console.error(...args);
  };
  process.stdin.resume();
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  debugLog("[stdio] connecting");
  await server.connect(transport);
  debugLog("[stdio] connected");
  // Keep the process alive when stdin is a pipe with no initial traffic.
  const keepAlive = setInterval(() => {}, 1 << 30);
  const clearKeepAlive = () => {
    debugLog("[stdio] stdin closed, clearing keepalive");
    clearInterval(keepAlive);
  };
  process.stdin.on("close", clearKeepAlive);
  process.stdin.on("end", clearKeepAlive);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
