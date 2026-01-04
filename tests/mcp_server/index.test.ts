/**
 * Tests for MCP Server creation
 *
 * @module tests/mcp_server
 * @see {@link src/mcp_server/index.ts}
 *
 * Testing createMcpServer function
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dependencies before importing
vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => {
  const MockMcpServer = vi.fn(function (this: any, config: any) {
    this.tool = vi.fn();
    this.connect = vi.fn();
    this.config = config;
    return this;
  });
  return {
    McpServer: MockMcpServer,
  };
});

vi.mock("../../src/mcp_server/tools/index.js", () => ({
  registerTools: vi.fn(),
}));

describe("MCP Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createMcpServer", () => {
    it("should create an MCP server instance", async () => {
      const { createMcpServer } = await import("../../src/mcp_server/index.js");
      const { McpServer } = await import(
        "@modelcontextprotocol/sdk/server/mcp.js"
      );

      const server = createMcpServer();

      expect(McpServer).toHaveBeenCalledTimes(1);
      expect(server).toBeDefined();
    });

    it("should configure server with correct name and version", async () => {
      const { createMcpServer } = await import("../../src/mcp_server/index.js");
      const { McpServer } = await import(
        "@modelcontextprotocol/sdk/server/mcp.js"
      );

      createMcpServer();

      expect(McpServer).toHaveBeenCalledWith({
        name: "example-mcp",
        version: "1.0.0",
      });
    });

    it("should register tools on the server", async () => {
      const { createMcpServer } = await import("../../src/mcp_server/index.js");
      const { registerTools } = await import(
        "../../src/mcp_server/tools/index.js"
      );

      const server = createMcpServer();

      expect(registerTools).toHaveBeenCalledTimes(1);
      expect(registerTools).toHaveBeenCalledWith(server);
    });

    it("should return the configured server", async () => {
      const { createMcpServer } = await import("../../src/mcp_server/index.js");
      const { McpServer } = await import(
        "@modelcontextprotocol/sdk/server/mcp.js"
      );

      const server = createMcpServer();
      const MockedMcpServer = McpServer as unknown as ReturnType<typeof vi.fn>;

      expect(server).toBe(MockedMcpServer.mock.results[0].value);
    });
  });
});
