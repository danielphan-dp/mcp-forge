/**
 * Integration Tests for Developer Tool Handlers
 *
 * @module tests/mcp_server/tools/developer/handlers.test
 * @see {@link src/mcp_server/tools/developer}
 *
 * Testing the actual MCP tool handler functions for developer tools including
 * JSON formatting, URL encoding/decoding, and Base64 encoding/decoding.
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

describe("Developer Tool Handlers", () => {
  describe("json_format tool handler", () => {
    it("should register and execute json_format tool", async () => {
      const { registerJsonFormatTool } = await import(
        "../../../../src/mcp_server/tools/developer/json_format.js"
      );
      const server = createMockServer();
      registerJsonFormatTool(server as any);

      const tool = server.tools.get("json_format");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ json: '{"a":1,"b":2}' });
      expect(result.content[0].text).toContain('"a": 1');
      expect(result.content[0].text).toContain('"b": 2');
    });

    it("should handle nested objects", async () => {
      const { registerJsonFormatTool } = await import(
        "../../../../src/mcp_server/tools/developer/json_format.js"
      );
      const server = createMockServer();
      registerJsonFormatTool(server as any);

      const tool = server.tools.get("json_format");
      const result = await tool!.handler({
        json: '{"outer":{"inner":"value"}}',
      });
      expect(result.content[0].text).toContain('"outer"');
      expect(result.content[0].text).toContain('"inner"');
    });

    it("should return error for invalid JSON", async () => {
      const { registerJsonFormatTool } = await import(
        "../../../../src/mcp_server/tools/developer/json_format.js"
      );
      const server = createMockServer();
      registerJsonFormatTool(server as any);

      const tool = server.tools.get("json_format");
      const result = await tool!.handler({ json: "not valid json" });
      expect(result.isError).toBe(true);
    });

    it("should handle arrays", async () => {
      const { registerJsonFormatTool } = await import(
        "../../../../src/mcp_server/tools/developer/json_format.js"
      );
      const server = createMockServer();
      registerJsonFormatTool(server as any);

      const tool = server.tools.get("json_format");
      const result = await tool!.handler({ json: "[1,2,3]" });
      expect(result.content[0].text).toContain("1");
      expect(result.content[0].text).toContain("2");
      expect(result.content[0].text).toContain("3");
    });
  });

  describe("url_encode tool handler", () => {
    it("should register and execute url_encode tool", async () => {
      const { registerUrlEncodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/url_encode.js"
      );
      const server = createMockServer();
      registerUrlEncodeTool(server as any);

      const tool = server.tools.get("url_encode");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ text: "hello world" });
      expect(result.content[0].text).toBe("hello%20world");
    });

    it("should encode special characters", async () => {
      const { registerUrlEncodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/url_encode.js"
      );
      const server = createMockServer();
      registerUrlEncodeTool(server as any);

      const tool = server.tools.get("url_encode");
      const result = await tool!.handler({ text: "a=1&b=2" });
      expect(result.content[0].text).toBe("a%3D1%26b%3D2");
    });

    it("should handle empty string", async () => {
      const { registerUrlEncodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/url_encode.js"
      );
      const server = createMockServer();
      registerUrlEncodeTool(server as any);

      const tool = server.tools.get("url_encode");
      const result = await tool!.handler({ text: "" });
      expect(result.content[0].text).toBe("");
    });
  });

  describe("url_decode tool handler", () => {
    it("should register and execute url_decode tool", async () => {
      const { registerUrlDecodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/url_encode.js"
      );
      const server = createMockServer();
      registerUrlDecodeTool(server as any);

      const tool = server.tools.get("url_decode");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ text: "hello%20world" });
      expect(result.content[0].text).toBe("hello world");
    });

    it("should decode special characters", async () => {
      const { registerUrlDecodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/url_encode.js"
      );
      const server = createMockServer();
      registerUrlDecodeTool(server as any);

      const tool = server.tools.get("url_decode");
      const result = await tool!.handler({ text: "a%3D1%26b%3D2" });
      expect(result.content[0].text).toBe("a=1&b=2");
    });

    it("should return error for invalid encoding", async () => {
      const { registerUrlDecodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/url_encode.js"
      );
      const server = createMockServer();
      registerUrlDecodeTool(server as any);

      const tool = server.tools.get("url_decode");
      const result = await tool!.handler({ text: "%ZZ" });
      expect(result.isError).toBe(true);
    });
  });

  describe("base64_encode tool handler", () => {
    it("should register and execute base64_encode tool", async () => {
      const { registerBase64EncodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/base64.js"
      );
      const server = createMockServer();
      registerBase64EncodeTool(server as any);

      const tool = server.tools.get("base64_encode");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ text: "hello world" });
      expect(result.content[0].text).toBe("aGVsbG8gd29ybGQ=");
    });

    it("should handle empty string", async () => {
      const { registerBase64EncodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/base64.js"
      );
      const server = createMockServer();
      registerBase64EncodeTool(server as any);

      const tool = server.tools.get("base64_encode");
      const result = await tool!.handler({ text: "" });
      expect(result.content[0].text).toBe("");
    });

    it("should handle unicode characters", async () => {
      const { registerBase64EncodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/base64.js"
      );
      const server = createMockServer();
      registerBase64EncodeTool(server as any);

      const tool = server.tools.get("base64_encode");
      const result = await tool!.handler({ text: "héllo" });
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe("base64_decode tool handler", () => {
    it("should register and execute base64_decode tool", async () => {
      const { registerBase64DecodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/base64.js"
      );
      const server = createMockServer();
      registerBase64DecodeTool(server as any);

      const tool = server.tools.get("base64_decode");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ text: "aGVsbG8gd29ybGQ=" });
      expect(result.content[0].text).toBe("hello world");
    });

    it("should handle empty string", async () => {
      const { registerBase64DecodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/base64.js"
      );
      const server = createMockServer();
      registerBase64DecodeTool(server as any);

      const tool = server.tools.get("base64_decode");
      const result = await tool!.handler({ text: "" });
      expect(result.content[0].text).toBe("");
    });

    it("should return error for invalid base64", async () => {
      const { registerBase64DecodeTool } = await import(
        "../../../../src/mcp_server/tools/developer/base64.js"
      );
      const server = createMockServer();
      registerBase64DecodeTool(server as any);

      const tool = server.tools.get("base64_decode");
      const result = await tool!.handler({ text: "!!invalid!!" });
      expect(result.isError).toBe(true);
    });
  });
});
