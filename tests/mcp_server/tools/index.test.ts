/**
 * Tests for Tool Registration
 *
 * @module tests/mcp_server/tools
 * @see {@link src/mcp_server/tools/index.ts}
 *
 * Testing registerTools function and category registrations
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all tool category registrations
vi.mock("../../../src/mcp_server/tools/math/index.js", () => ({
  registerMathTools: vi.fn(),
}));

vi.mock("../../../src/mcp_server/tools/utility/index.js", () => ({
  registerUtilityTools: vi.fn(),
}));

vi.mock("../../../src/mcp_server/tools/string/index.js", () => ({
  registerStringTools: vi.fn(),
}));

vi.mock("../../../src/mcp_server/tools/datetime/index.js", () => ({
  registerDateTimeTools: vi.fn(),
}));

vi.mock("../../../src/mcp_server/tools/developer/index.js", () => ({
  registerDeveloperTools: vi.fn(),
}));

describe("Tool Registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerTools", () => {
    it("should register all tool categories", async () => {
      const { registerTools } = await import(
        "../../../src/mcp_server/tools/index.js"
      );
      const { registerMathTools } = await import(
        "../../../src/mcp_server/tools/math/index.js"
      );
      const { registerUtilityTools } = await import(
        "../../../src/mcp_server/tools/utility/index.js"
      );
      const { registerStringTools } = await import(
        "../../../src/mcp_server/tools/string/index.js"
      );
      const { registerDateTimeTools } = await import(
        "../../../src/mcp_server/tools/datetime/index.js"
      );
      const { registerDeveloperTools } = await import(
        "../../../src/mcp_server/tools/developer/index.js"
      );

      const mockServer = { tool: vi.fn() };
      registerTools(mockServer as any);

      expect(registerMathTools).toHaveBeenCalledTimes(1);
      expect(registerUtilityTools).toHaveBeenCalledTimes(1);
      expect(registerStringTools).toHaveBeenCalledTimes(1);
      expect(registerDateTimeTools).toHaveBeenCalledTimes(1);
      expect(registerDeveloperTools).toHaveBeenCalledTimes(1);
    });

    it("should pass server to all registration functions", async () => {
      const { registerTools } = await import(
        "../../../src/mcp_server/tools/index.js"
      );
      const { registerMathTools } = await import(
        "../../../src/mcp_server/tools/math/index.js"
      );
      const { registerUtilityTools } = await import(
        "../../../src/mcp_server/tools/utility/index.js"
      );
      const { registerStringTools } = await import(
        "../../../src/mcp_server/tools/string/index.js"
      );
      const { registerDateTimeTools } = await import(
        "../../../src/mcp_server/tools/datetime/index.js"
      );
      const { registerDeveloperTools } = await import(
        "../../../src/mcp_server/tools/developer/index.js"
      );

      const mockServer = { tool: vi.fn(), name: "test-server" };
      registerTools(mockServer as any);

      expect(registerMathTools).toHaveBeenCalledWith(mockServer);
      expect(registerUtilityTools).toHaveBeenCalledWith(mockServer);
      expect(registerStringTools).toHaveBeenCalledWith(mockServer);
      expect(registerDateTimeTools).toHaveBeenCalledWith(mockServer);
      expect(registerDeveloperTools).toHaveBeenCalledWith(mockServer);
    });

    it("should register tools in correct order", async () => {
      const { registerTools } = await import(
        "../../../src/mcp_server/tools/index.js"
      );
      const { registerMathTools } = await import(
        "../../../src/mcp_server/tools/math/index.js"
      );
      const { registerUtilityTools } = await import(
        "../../../src/mcp_server/tools/utility/index.js"
      );
      const { registerStringTools } = await import(
        "../../../src/mcp_server/tools/string/index.js"
      );
      const { registerDateTimeTools } = await import(
        "../../../src/mcp_server/tools/datetime/index.js"
      );
      const { registerDeveloperTools } = await import(
        "../../../src/mcp_server/tools/developer/index.js"
      );

      const callOrder: string[] = [];
      (registerMathTools as ReturnType<typeof vi.fn>).mockImplementation(() => {
        callOrder.push("math");
      });
      (registerUtilityTools as ReturnType<typeof vi.fn>).mockImplementation(
        () => {
          callOrder.push("utility");
        }
      );
      (registerStringTools as ReturnType<typeof vi.fn>).mockImplementation(
        () => {
          callOrder.push("string");
        }
      );
      (registerDateTimeTools as ReturnType<typeof vi.fn>).mockImplementation(
        () => {
          callOrder.push("datetime");
        }
      );
      (registerDeveloperTools as ReturnType<typeof vi.fn>).mockImplementation(
        () => {
          callOrder.push("developer");
        }
      );

      const mockServer = { tool: vi.fn() };
      registerTools(mockServer as any);

      expect(callOrder).toEqual([
        "math",
        "utility",
        "string",
        "datetime",
        "developer",
      ]);
    });
  });
});
