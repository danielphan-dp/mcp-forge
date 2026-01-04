/**
 * Integration Tests for Utility Tool Handlers
 *
 * @module tests/mcp_server/tools/utility/handlers
 * @see {@link src/mcp_server/tools/utility}
 *
 * Testing the actual MCP tool handler functions for utility tools.
 * These tests verify that the tool handlers register correctly and
 * execute properly when invoked through the MCP server interface.
 */
import { describe, it, expect, vi } from "vitest";

// Create a mock server that captures tool registrations
function createMockServer() {
  const tools: Map<
    string,
    {
      description: string;
      schema: any;
      handler: (args: any) => Promise<any>;
    }
  > = new Map();

  return {
    tools,
    tool: vi.fn(
      (
        name: string,
        description: string,
        schema: any,
        handler: (args: any) => Promise<any>
      ) => {
        tools.set(name, { description, schema, handler });
      }
    ),
  };
}

describe("Utility Tool Handlers", () => {
  describe("random tool handler", () => {
    it("should register and execute random tool", async () => {
      const { registerRandomTool } = await import(
        "../../../../src/mcp_server/tools/utility/random.js"
      );
      const server = createMockServer();
      registerRandomTool(server as any);

      const tool = server.tools.get("random");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ min: 1, max: 10 });
      const value = parseInt(result.content[0].text);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    });

    it("should handle float type", async () => {
      const { registerRandomTool } = await import(
        "../../../../src/mcp_server/tools/utility/random.js"
      );
      const server = createMockServer();
      registerRandomTool(server as any);

      const tool = server.tools.get("random");
      const result = await tool!.handler({ min: 0, max: 1, type: "float" });
      const value = parseFloat(result.content[0].text);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    it("should handle default values", async () => {
      const { registerRandomTool } = await import(
        "../../../../src/mcp_server/tools/utility/random.js"
      );
      const server = createMockServer();
      registerRandomTool(server as any);

      const tool = server.tools.get("random");
      const result = await tool!.handler({});
      const value = parseInt(result.content[0].text);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });

    it("should return error when min > max", async () => {
      const { registerRandomTool } = await import(
        "../../../../src/mcp_server/tools/utility/random.js"
      );
      const server = createMockServer();
      registerRandomTool(server as any);

      const tool = server.tools.get("random");
      const result = await tool!.handler({ min: 10, max: 1 });
      expect(result.isError).toBe(true);
    });
  });

  describe("uuid tool handler", () => {
    it("should register and execute uuid tool", async () => {
      const { registerUuidTool } = await import(
        "../../../../src/mcp_server/tools/utility/uuid.js"
      );
      const server = createMockServer();
      registerUuidTool(server as any);

      const tool = server.tools.get("uuid");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ count: 1 });
      const uuid = result.content[0].text;
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should generate multiple UUIDs", async () => {
      const { registerUuidTool } = await import(
        "../../../../src/mcp_server/tools/utility/uuid.js"
      );
      const server = createMockServer();
      registerUuidTool(server as any);

      const tool = server.tools.get("uuid");
      const result = await tool!.handler({ count: 3 });
      const uuids = result.content[0].text.split("\n");
      expect(uuids).toHaveLength(3);
      uuids.forEach((uuid: string) => {
        expect(uuid).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );
      });
    });

    it("should generate unique UUIDs", async () => {
      const { registerUuidTool } = await import(
        "../../../../src/mcp_server/tools/utility/uuid.js"
      );
      const server = createMockServer();
      registerUuidTool(server as any);

      const tool = server.tools.get("uuid");
      const result = await tool!.handler({ count: 5 });
      const uuids = result.content[0].text.split("\n");
      const uniqueUuids = new Set(uuids);
      expect(uniqueUuids.size).toBe(5);
    });
  });

  describe("base_convert tool handler", () => {
    it("should register and execute base_convert tool", async () => {
      const { registerBaseConvertTool } = await import(
        "../../../../src/mcp_server/tools/utility/base_convert.js"
      );
      const server = createMockServer();
      registerBaseConvertTool(server as any);

      const tool = server.tools.get("base_convert");
      expect(tool).toBeDefined();

      const result = await tool!.handler({
        value: "255",
        fromBase: 10,
        toBase: 16,
      });
      expect(result.content[0].text.toLowerCase()).toBe("ff");
    });

    it("should convert binary to decimal", async () => {
      const { registerBaseConvertTool } = await import(
        "../../../../src/mcp_server/tools/utility/base_convert.js"
      );
      const server = createMockServer();
      registerBaseConvertTool(server as any);

      const tool = server.tools.get("base_convert");
      const result = await tool!.handler({
        value: "1010",
        fromBase: 2,
        toBase: 10,
      });
      expect(result.content[0].text).toBe("10");
    });

    it("should convert hex to binary", async () => {
      const { registerBaseConvertTool } = await import(
        "../../../../src/mcp_server/tools/utility/base_convert.js"
      );
      const server = createMockServer();
      registerBaseConvertTool(server as any);

      const tool = server.tools.get("base_convert");
      const result = await tool!.handler({
        value: "F",
        fromBase: 16,
        toBase: 2,
      });
      expect(result.content[0].text).toBe("1111");
    });

    it("should return error for invalid base", async () => {
      const { registerBaseConvertTool } = await import(
        "../../../../src/mcp_server/tools/utility/base_convert.js"
      );
      const server = createMockServer();
      registerBaseConvertTool(server as any);

      const tool = server.tools.get("base_convert");
      const result = await tool!.handler({
        value: "100",
        fromBase: 40,
        toBase: 10,
      });
      expect(result.isError).toBe(true);
    });

    it("should return error for invalid value in base", async () => {
      const { registerBaseConvertTool } = await import(
        "../../../../src/mcp_server/tools/utility/base_convert.js"
      );
      const server = createMockServer();
      registerBaseConvertTool(server as any);

      const tool = server.tools.get("base_convert");
      const result = await tool!.handler({
        value: "ABC",
        fromBase: 10,
        toBase: 16,
      });
      expect(result.isError).toBe(true);
    });
  });

  describe("hash tool handler", () => {
    it("should register and execute hash tool", async () => {
      const { registerHashTool } = await import(
        "../../../../src/mcp_server/tools/utility/hash.js"
      );
      const server = createMockServer();
      registerHashTool(server as any);

      const tool = server.tools.get("hash");
      expect(tool).toBeDefined();

      const result = await tool!.handler({
        input: "hello",
        algorithm: "sha256",
      });
      expect(result.content[0].text).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
      );
    });

    it("should handle md5 algorithm", async () => {
      const { registerHashTool } = await import(
        "../../../../src/mcp_server/tools/utility/hash.js"
      );
      const server = createMockServer();
      registerHashTool(server as any);

      const tool = server.tools.get("hash");
      const result = await tool!.handler({ input: "hello", algorithm: "md5" });
      expect(result.content[0].text).toBe("5d41402abc4b2a76b9719d911017c592");
    });

    it("should handle sha512 algorithm", async () => {
      const { registerHashTool } = await import(
        "../../../../src/mcp_server/tools/utility/hash.js"
      );
      const server = createMockServer();
      registerHashTool(server as any);

      const tool = server.tools.get("hash");
      const result = await tool!.handler({
        input: "hello",
        algorithm: "sha512",
      });
      expect(result.content[0].text).toHaveLength(128); // SHA-512 produces 128 hex chars
    });

    it("should handle empty string", async () => {
      const { registerHashTool } = await import(
        "../../../../src/mcp_server/tools/utility/hash.js"
      );
      const server = createMockServer();
      registerHashTool(server as any);

      const tool = server.tools.get("hash");
      const result = await tool!.handler({ input: "", algorithm: "sha256" });
      expect(result.content[0].text).toBe(
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      );
    });
  });
});
