/**
 * Integration Tests for String Tool Handlers
 *
 * @module tests/mcp_server/tools/string/handlers
 * @see {@link src/mcp_server/tools/string/string}
 *
 * Integration tests for the MCP tool handler functions that wrap
 * string manipulation operations for the Model Context Protocol server.
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

describe("String Tool Handlers", () => {
  describe("reverse tool handler", () => {
    it("should register and execute reverse tool", async () => {
      const { registerReverseTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerReverseTool(server as any);

      const tool = server.tools.get("reverse");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ text: "hello" });
      expect(result.content[0].text).toBe("olleh");
    });

    it("should handle empty string", async () => {
      const { registerReverseTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerReverseTool(server as any);

      const tool = server.tools.get("reverse");
      const result = await tool!.handler({ text: "" });
      expect(result.content[0].text).toBe("");
    });

    it("should handle palindrome", async () => {
      const { registerReverseTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerReverseTool(server as any);

      const tool = server.tools.get("reverse");
      const result = await tool!.handler({ text: "racecar" });
      expect(result.content[0].text).toBe("racecar");
    });
  });

  describe("word_count tool handler", () => {
    it("should register and execute word_count tool", async () => {
      const { registerWordCountTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerWordCountTool(server as any);

      const tool = server.tools.get("word_count");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ text: "hello world foo bar" });
      expect(result.content[0].text).toContain("Words: 4");
    });

    it("should handle empty string", async () => {
      const { registerWordCountTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerWordCountTool(server as any);

      const tool = server.tools.get("word_count");
      const result = await tool!.handler({ text: "" });
      expect(result.content[0].text).toContain("Words: 0");
    });

    it("should handle multiple spaces", async () => {
      const { registerWordCountTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerWordCountTool(server as any);

      const tool = server.tools.get("word_count");
      const result = await tool!.handler({ text: "hello   world" });
      expect(result.content[0].text).toContain("Words: 2");
    });
  });

  describe("uppercase tool handler", () => {
    it("should register and execute uppercase tool", async () => {
      const { registerUppercaseTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerUppercaseTool(server as any);

      const tool = server.tools.get("uppercase");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ text: "hello world" });
      expect(result.content[0].text).toBe("HELLO WORLD");
    });

    it("should handle already uppercase", async () => {
      const { registerUppercaseTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerUppercaseTool(server as any);

      const tool = server.tools.get("uppercase");
      const result = await tool!.handler({ text: "HELLO" });
      expect(result.content[0].text).toBe("HELLO");
    });
  });

  describe("lowercase tool handler", () => {
    it("should register and execute lowercase tool", async () => {
      const { registerLowercaseTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerLowercaseTool(server as any);

      const tool = server.tools.get("lowercase");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ text: "HELLO WORLD" });
      expect(result.content[0].text).toBe("hello world");
    });

    it("should handle mixed case", async () => {
      const { registerLowercaseTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerLowercaseTool(server as any);

      const tool = server.tools.get("lowercase");
      const result = await tool!.handler({ text: "HeLLo WoRLD" });
      expect(result.content[0].text).toBe("hello world");
    });
  });

  describe("slugify tool handler", () => {
    it("should register and execute slugify tool", async () => {
      const { registerSlugifyTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerSlugifyTool(server as any);

      const tool = server.tools.get("slugify");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ text: "Hello World!" });
      expect(result.content[0].text).toBe("hello-world");
    });

    it("should handle special characters", async () => {
      const { registerSlugifyTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerSlugifyTool(server as any);

      const tool = server.tools.get("slugify");
      const result = await tool!.handler({
        text: "This is a Test! @#$% String",
      });
      expect(result.content[0].text).toBe("this-is-a-test-string");
    });

    it("should handle multiple spaces", async () => {
      const { registerSlugifyTool } = await import(
        "../../../../src/mcp_server/tools/string/string.js"
      );
      const server = createMockServer();
      registerSlugifyTool(server as any);

      const tool = server.tools.get("slugify");
      const result = await tool!.handler({ text: "hello    world" });
      expect(result.content[0].text).toBe("hello-world");
    });
  });
});
