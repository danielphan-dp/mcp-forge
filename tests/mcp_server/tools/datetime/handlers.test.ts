/**
 * Integration Tests for DateTime Tool Handlers
 *
 * @module tests/mcp_server/tools/datetime/handlers
 * @see {@link src/mcp_server/tools/datetime/datetime}
 *
 * Testing the actual MCP tool handler functions for timestamp conversion,
 * date difference calculation, and date formatting operations.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

describe("DateTime Tool Handlers", () => {
  describe("timestamp tool handler", () => {
    it("should register and execute timestamp tool for now operation", async () => {
      const { registerTimestampTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerTimestampTool(server as any);

      const tool = server.tools.get("timestamp");
      expect(tool).toBeDefined();

      const before = Math.floor(Date.now() / 1000);
      const result = await tool!.handler({ operation: "now" });
      const after = Math.floor(Date.now() / 1000);
      const timestamp = parseInt(result.content[0].text);

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it("should execute timestamp tool for to_date operation", async () => {
      const { registerTimestampTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerTimestampTool(server as any);

      const tool = server.tools.get("timestamp");
      const result = await tool!.handler({
        operation: "to_date",
        value: "1704067200",
      });
      expect(result.content[0].text).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should return error for to_date without value", async () => {
      const { registerTimestampTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerTimestampTool(server as any);

      const tool = server.tools.get("timestamp");
      const result = await tool!.handler({ operation: "to_date" });
      expect(result.isError).toBe(true);
    });

    it("should execute timestamp tool for from_date operation", async () => {
      const { registerTimestampTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerTimestampTool(server as any);

      const tool = server.tools.get("timestamp");
      const result = await tool!.handler({
        operation: "from_date",
        value: "2024-01-01T00:00:00.000Z",
      });
      expect(result.content[0].text).toBe("1704067200");
    });

    it("should return error for from_date without value", async () => {
      const { registerTimestampTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerTimestampTool(server as any);

      const tool = server.tools.get("timestamp");
      const result = await tool!.handler({ operation: "from_date" });
      expect(result.isError).toBe(true);
    });

    it("should return error for invalid date format", async () => {
      const { registerTimestampTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerTimestampTool(server as any);

      const tool = server.tools.get("timestamp");
      const result = await tool!.handler({
        operation: "from_date",
        value: "not-a-date",
      });
      expect(result.isError).toBe(true);
    });

    it("should return error for invalid timestamp", async () => {
      const { registerTimestampTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerTimestampTool(server as any);

      const tool = server.tools.get("timestamp");
      const result = await tool!.handler({
        operation: "to_date",
        value: "not-a-number",
      });
      expect(result.isError).toBe(true);
    });
  });

  describe("date_diff tool handler", () => {
    it("should register and execute date_diff tool", async () => {
      const { registerDateDiffTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerDateDiffTool(server as any);

      const tool = server.tools.get("date_diff");
      expect(tool).toBeDefined();

      const result = await tool!.handler({
        date1: "2024-01-01",
        date2: "2024-01-10",
        unit: "days",
      });
      expect(result.content[0].text).toBe("9 days");
    });

    it("should calculate difference in hours", async () => {
      const { registerDateDiffTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerDateDiffTool(server as any);

      const tool = server.tools.get("date_diff");
      const result = await tool!.handler({
        date1: "2024-01-01T00:00:00Z",
        date2: "2024-01-01T12:00:00Z",
        unit: "hours",
      });
      expect(result.content[0].text).toBe("12 hours");
    });

    it("should return error for invalid dates", async () => {
      const { registerDateDiffTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerDateDiffTool(server as any);

      const tool = server.tools.get("date_diff");
      const result = await tool!.handler({
        date1: "invalid",
        date2: "2024-01-10",
        unit: "days",
      });
      expect(result.isError).toBe(true);
    });
  });

  describe("format_date tool handler", () => {
    it("should register and execute format_date tool", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      expect(tool).toBeDefined();

      const result = await tool!.handler({
        date: "2024-06-15T14:30:00.000Z",
        format: "iso",
      });
      expect(result.content[0].text).toBe("2024-06-15T14:30:00.000Z");
    });

    it("should format as UTC", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "2024-06-15T14:30:00.000Z",
        format: "utc",
      });
      expect(result.content[0].text).toContain("Sat, 15 Jun 2024");
    });

    it("should format as local", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "2024-06-15T14:30:00.000Z",
        format: "local",
        locale: "en-US",
      });
      expect(result.content[0].text).toBeDefined();
    });

    it("should format as date only", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "2024-06-15T14:30:00.000Z",
        format: "date",
        locale: "en-US",
      });
      expect(result.content[0].text).toBeDefined();
    });

    it("should format as time only", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "2024-06-15T14:30:00.000Z",
        format: "time",
        locale: "en-US",
      });
      expect(result.content[0].text).toBeDefined();
    });

    it("should return error for invalid date", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "not-a-date",
        format: "iso",
      });
      expect(result.isError).toBe(true);
    });

    it("should use current date when date is undefined", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({ format: "iso" });
      expect(result.content[0].text).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
  });

  describe("format_date relative format", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should format as relative for today", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "2024-06-15T10:00:00.000Z",
        format: "relative",
      });
      expect(result.content[0].text).toBe("today");
    });

    it("should format as relative for yesterday", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "2024-06-14T10:00:00.000Z",
        format: "relative",
      });
      expect(result.content[0].text).toBe("yesterday");
    });

    it("should format as relative for tomorrow", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "2024-06-16T10:00:00.000Z",
        format: "relative",
      });
      expect(result.content[0].text).toBe("tomorrow");
    });

    it("should format as relative for past dates", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "2024-06-10T10:00:00.000Z",
        format: "relative",
      });
      expect(result.content[0].text).toBe("5 days ago");
    });

    it("should format as relative for future dates", async () => {
      const { registerFormatDateTool } = await import(
        "../../../../src/mcp_server/tools/datetime/datetime.js"
      );
      const server = createMockServer();
      registerFormatDateTool(server as any);

      const tool = server.tools.get("format_date");
      const result = await tool!.handler({
        date: "2024-06-20T10:00:00.000Z",
        format: "relative",
      });
      expect(result.content[0].text).toBe("in 5 days");
    });
  });
});
