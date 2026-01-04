/**
 * Integration Tests for Math Tool Handlers
 *
 * @module tests/mcp_server/tools/math/handlers
 * @see {@link src/mcp_server/tools/math}
 *
 * Testing the actual MCP tool handler functions
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

describe("Math Tool Handlers", () => {
  describe("add tool handler", () => {
    it("should register and execute add tool", async () => {
      const { registerAddTool } = await import(
        "../../../../src/mcp_server/tools/math/add.js"
      );
      const server = createMockServer();
      registerAddTool(server as any);

      expect(server.tool).toHaveBeenCalled();
      const tool = server.tools.get("add");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ a: 5, b: 3 });
      expect(result.content[0].text).toBe("8");
    });

    it("should handle negative numbers", async () => {
      const { registerAddTool } = await import(
        "../../../../src/mcp_server/tools/math/add.js"
      );
      const server = createMockServer();
      registerAddTool(server as any);

      const tool = server.tools.get("add");
      const result = await tool!.handler({ a: -5, b: 3 });
      expect(result.content[0].text).toBe("-2");
    });

    it("should handle decimals", async () => {
      const { registerAddTool } = await import(
        "../../../../src/mcp_server/tools/math/add.js"
      );
      const server = createMockServer();
      registerAddTool(server as any);

      const tool = server.tools.get("add");
      const result = await tool!.handler({ a: 0.1, b: 0.2 });
      expect(parseFloat(result.content[0].text)).toBeCloseTo(0.3);
    });
  });

  describe("subtract tool handler", () => {
    it("should register and execute subtract tool", async () => {
      const { registerSubtractTool } = await import(
        "../../../../src/mcp_server/tools/math/subtract.js"
      );
      const server = createMockServer();
      registerSubtractTool(server as any);

      const tool = server.tools.get("subtract");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ a: 10, b: 3 });
      expect(result.content[0].text).toBe("7");
    });

    it("should handle negative results", async () => {
      const { registerSubtractTool } = await import(
        "../../../../src/mcp_server/tools/math/subtract.js"
      );
      const server = createMockServer();
      registerSubtractTool(server as any);

      const tool = server.tools.get("subtract");
      const result = await tool!.handler({ a: 3, b: 10 });
      expect(result.content[0].text).toBe("-7");
    });
  });

  describe("multiply tool handler", () => {
    it("should register and execute multiply tool", async () => {
      const { registerMultiplyTool } = await import(
        "../../../../src/mcp_server/tools/math/multiply.js"
      );
      const server = createMockServer();
      registerMultiplyTool(server as any);

      const tool = server.tools.get("multiply");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ a: 4, b: 5 });
      expect(result.content[0].text).toBe("20");
    });

    it("should handle zero", async () => {
      const { registerMultiplyTool } = await import(
        "../../../../src/mcp_server/tools/math/multiply.js"
      );
      const server = createMockServer();
      registerMultiplyTool(server as any);

      const tool = server.tools.get("multiply");
      const result = await tool!.handler({ a: 100, b: 0 });
      expect(result.content[0].text).toBe("0");
    });
  });

  describe("divide tool handler", () => {
    it("should register and execute divide tool", async () => {
      const { registerDivideTool } = await import(
        "../../../../src/mcp_server/tools/math/divide.js"
      );
      const server = createMockServer();
      registerDivideTool(server as any);

      const tool = server.tools.get("divide");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ a: 20, b: 4 });
      expect(result.content[0].text).toBe("5");
    });

    it("should return error for division by zero", async () => {
      const { registerDivideTool } = await import(
        "../../../../src/mcp_server/tools/math/divide.js"
      );
      const server = createMockServer();
      registerDivideTool(server as any);

      const tool = server.tools.get("divide");
      const result = await tool!.handler({ a: 10, b: 0 });
      expect(result.isError).toBe(true);
    });
  });

  describe("power tool handler", () => {
    it("should register and execute power tool", async () => {
      const { registerPowerTool } = await import(
        "../../../../src/mcp_server/tools/math/power.js"
      );
      const server = createMockServer();
      registerPowerTool(server as any);

      const tool = server.tools.get("power");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ base: 2, exponent: 3 });
      expect(result.content[0].text).toBe("8");
    });

    it("should handle zero exponent", async () => {
      const { registerPowerTool } = await import(
        "../../../../src/mcp_server/tools/math/power.js"
      );
      const server = createMockServer();
      registerPowerTool(server as any);

      const tool = server.tools.get("power");
      const result = await tool!.handler({ base: 5, exponent: 0 });
      expect(result.content[0].text).toBe("1");
    });
  });

  describe("modulo tool handler", () => {
    it("should register and execute modulo tool", async () => {
      const { registerModuloTool } = await import(
        "../../../../src/mcp_server/tools/math/modulo.js"
      );
      const server = createMockServer();
      registerModuloTool(server as any);

      const tool = server.tools.get("modulo");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ a: 17, b: 5 });
      expect(result.content[0].text).toBe("2");
    });

    it("should return error for modulo by zero", async () => {
      const { registerModuloTool } = await import(
        "../../../../src/mcp_server/tools/math/modulo.js"
      );
      const server = createMockServer();
      registerModuloTool(server as any);

      const tool = server.tools.get("modulo");
      const result = await tool!.handler({ a: 10, b: 0 });
      expect(result.isError).toBe(true);
    });
  });

  describe("sqrt tool handler", () => {
    it("should register and execute sqrt tool", async () => {
      const { registerSqrtTool } = await import(
        "../../../../src/mcp_server/tools/math/sqrt.js"
      );
      const server = createMockServer();
      registerSqrtTool(server as any);

      const tool = server.tools.get("sqrt");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ n: 16 });
      expect(result.content[0].text).toBe("4");
    });

    it("should return error for negative input", async () => {
      const { registerSqrtTool } = await import(
        "../../../../src/mcp_server/tools/math/sqrt.js"
      );
      const server = createMockServer();
      registerSqrtTool(server as any);

      const tool = server.tools.get("sqrt");
      const result = await tool!.handler({ n: -4 });
      expect(result.isError).toBe(true);
    });
  });

  describe("abs tool handler", () => {
    it("should register and execute abs tool", async () => {
      const { registerAbsTool } = await import(
        "../../../../src/mcp_server/tools/math/abs.js"
      );
      const server = createMockServer();
      registerAbsTool(server as any);

      const tool = server.tools.get("abs");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ n: -15 });
      expect(result.content[0].text).toBe("15");
    });

    it("should handle positive numbers", async () => {
      const { registerAbsTool } = await import(
        "../../../../src/mcp_server/tools/math/abs.js"
      );
      const server = createMockServer();
      registerAbsTool(server as any);

      const tool = server.tools.get("abs");
      const result = await tool!.handler({ n: 15 });
      expect(result.content[0].text).toBe("15");
    });
  });

  describe("round/floor/ceil tool handlers", () => {
    it("should register and execute round tool", async () => {
      const { registerRoundTool } = await import(
        "../../../../src/mcp_server/tools/math/round.js"
      );
      const server = createMockServer();
      registerRoundTool(server as any);

      const tool = server.tools.get("round");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ n: 4.6 });
      expect(result.content[0].text).toBe("5");
    });

    it("should round down for .4", async () => {
      const { registerRoundTool } = await import(
        "../../../../src/mcp_server/tools/math/round.js"
      );
      const server = createMockServer();
      registerRoundTool(server as any);

      const tool = server.tools.get("round");
      const result = await tool!.handler({ n: 4.4 });
      expect(result.content[0].text).toBe("4");
    });

    it("should register and execute floor tool", async () => {
      const { registerFloorTool } = await import(
        "../../../../src/mcp_server/tools/math/round.js"
      );
      const server = createMockServer();
      registerFloorTool(server as any);

      const tool = server.tools.get("floor");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ n: 4.9 });
      expect(result.content[0].text).toBe("4");
    });

    it("should register and execute ceil tool", async () => {
      const { registerCeilTool } = await import(
        "../../../../src/mcp_server/tools/math/round.js"
      );
      const server = createMockServer();
      registerCeilTool(server as any);

      const tool = server.tools.get("ceil");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ n: 4.1 });
      expect(result.content[0].text).toBe("5");
    });
  });

  describe("min/max tool handlers", () => {
    it("should register and execute min tool", async () => {
      const { registerMinTool } = await import(
        "../../../../src/mcp_server/tools/math/minmax.js"
      );
      const server = createMockServer();
      registerMinTool(server as any);

      const tool = server.tools.get("min");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ numbers: [5, 2, 8, 1, 9] });
      expect(result.content[0].text).toBe("1");
    });

    it("should register and execute max tool", async () => {
      const { registerMaxTool } = await import(
        "../../../../src/mcp_server/tools/math/minmax.js"
      );
      const server = createMockServer();
      registerMaxTool(server as any);

      const tool = server.tools.get("max");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ numbers: [5, 2, 8, 1, 9] });
      expect(result.content[0].text).toBe("9");
    });
  });

  describe("factorial tool handler", () => {
    it("should register and execute factorial tool", async () => {
      const { registerFactorialTool } = await import(
        "../../../../src/mcp_server/tools/math/factorial.js"
      );
      const server = createMockServer();
      registerFactorialTool(server as any);

      const tool = server.tools.get("factorial");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ n: 5 });
      expect(result.content[0].text).toBe("120");
    });

    it("should handle factorial of 0", async () => {
      const { registerFactorialTool } = await import(
        "../../../../src/mcp_server/tools/math/factorial.js"
      );
      const server = createMockServer();
      registerFactorialTool(server as any);

      const tool = server.tools.get("factorial");
      const result = await tool!.handler({ n: 0 });
      expect(result.content[0].text).toBe("1");
    });
  });

  describe("logarithm tool handlers", () => {
    it("should register and execute log tool", async () => {
      const { registerLogTool } = await import(
        "../../../../src/mcp_server/tools/math/logarithm.js"
      );
      const server = createMockServer();
      registerLogTool(server as any);

      const tool = server.tools.get("log");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ n: 100 });
      expect(result.content[0].text).toBe("2");
    });

    it("should return error for base 1", async () => {
      const { registerLogTool } = await import(
        "../../../../src/mcp_server/tools/math/logarithm.js"
      );
      const server = createMockServer();
      registerLogTool(server as any);

      const tool = server.tools.get("log");
      const result = await tool!.handler({ n: 100, base: 1 });
      expect(result.isError).toBe(true);
    });

    it("should register and execute ln tool", async () => {
      const { registerLnTool } = await import(
        "../../../../src/mcp_server/tools/math/logarithm.js"
      );
      const server = createMockServer();
      registerLnTool(server as any);

      const tool = server.tools.get("ln");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ n: Math.E });
      expect(parseFloat(result.content[0].text)).toBeCloseTo(1);
    });

    it("should handle ln of e squared", async () => {
      const { registerLnTool } = await import(
        "../../../../src/mcp_server/tools/math/logarithm.js"
      );
      const server = createMockServer();
      registerLnTool(server as any);

      const tool = server.tools.get("ln");
      const result = await tool!.handler({ n: Math.E * Math.E });
      expect(parseFloat(result.content[0].text)).toBeCloseTo(2);
    });
  });

  describe("trigonometry tool handlers", () => {
    it("should register and execute sin tool", async () => {
      const { registerSinTool } = await import(
        "../../../../src/mcp_server/tools/math/trigonometry.js"
      );
      const server = createMockServer();
      registerSinTool(server as any);

      const tool = server.tools.get("sin");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ angle: 0, unit: "radians" });
      expect(result.content[0].text).toBe("0");
    });

    it("should handle degrees for sin", async () => {
      const { registerSinTool } = await import(
        "../../../../src/mcp_server/tools/math/trigonometry.js"
      );
      const server = createMockServer();
      registerSinTool(server as any);

      const tool = server.tools.get("sin");
      const result = await tool!.handler({ angle: 90, unit: "degrees" });
      expect(parseFloat(result.content[0].text)).toBeCloseTo(1);
    });

    it("should register and execute cos tool", async () => {
      const { registerCosTool } = await import(
        "../../../../src/mcp_server/tools/math/trigonometry.js"
      );
      const server = createMockServer();
      registerCosTool(server as any);

      const tool = server.tools.get("cos");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ angle: 0, unit: "radians" });
      expect(result.content[0].text).toBe("1");
    });

    it("should handle degrees for cos", async () => {
      const { registerCosTool } = await import(
        "../../../../src/mcp_server/tools/math/trigonometry.js"
      );
      const server = createMockServer();
      registerCosTool(server as any);

      const tool = server.tools.get("cos");
      const result = await tool!.handler({ angle: 180, unit: "degrees" });
      expect(parseFloat(result.content[0].text)).toBeCloseTo(-1);
    });

    it("should register and execute tan tool", async () => {
      const { registerTanTool } = await import(
        "../../../../src/mcp_server/tools/math/trigonometry.js"
      );
      const server = createMockServer();
      registerTanTool(server as any);

      const tool = server.tools.get("tan");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ angle: 0, unit: "radians" });
      expect(result.content[0].text).toBe("0");
    });

    it("should handle degrees for tan", async () => {
      const { registerTanTool } = await import(
        "../../../../src/mcp_server/tools/math/trigonometry.js"
      );
      const server = createMockServer();
      registerTanTool(server as any);

      const tool = server.tools.get("tan");
      const result = await tool!.handler({ angle: 45, unit: "degrees" });
      expect(parseFloat(result.content[0].text)).toBeCloseTo(1);
    });
  });

  describe("percent tool handler", () => {
    it("should register and execute percent tool for percentOf", async () => {
      const { registerPercentTool } = await import(
        "../../../../src/mcp_server/tools/math/percent.js"
      );
      const server = createMockServer();
      registerPercentTool(server as any);

      const tool = server.tools.get("percent");
      expect(tool).toBeDefined();

      const result = await tool!.handler({
        operation: "of",
        x: 25,
        y: 200,
      });
      expect(result.content[0].text).toBe("25% of 200 = 50");
    });

    it("should execute percent tool for percentIs", async () => {
      const { registerPercentTool } = await import(
        "../../../../src/mcp_server/tools/math/percent.js"
      );
      const server = createMockServer();
      registerPercentTool(server as any);

      const tool = server.tools.get("percent");
      const result = await tool!.handler({
        operation: "is",
        x: 50,
        y: 200,
      });
      expect(result.content[0].text).toBe("50 is 25% of 200");
    });

    it("should return error for percentIs with y=0", async () => {
      const { registerPercentTool } = await import(
        "../../../../src/mcp_server/tools/math/percent.js"
      );
      const server = createMockServer();
      registerPercentTool(server as any);

      const tool = server.tools.get("percent");
      const result = await tool!.handler({
        operation: "is",
        x: 50,
        y: 0,
      });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain(
        "Cannot calculate percentage of zero"
      );
    });
  });

  describe("average tool handler", () => {
    it("should register and execute average tool", async () => {
      const { registerAverageTool } = await import(
        "../../../../src/mcp_server/tools/math/average.js"
      );
      const server = createMockServer();
      registerAverageTool(server as any);

      const tool = server.tools.get("average");
      expect(tool).toBeDefined();

      const result = await tool!.handler({ numbers: [2, 4, 6, 8, 10] });
      expect(result.content[0].text).toBe("6");
    });

    it("should handle single number", async () => {
      const { registerAverageTool } = await import(
        "../../../../src/mcp_server/tools/math/average.js"
      );
      const server = createMockServer();
      registerAverageTool(server as any);

      const tool = server.tools.get("average");
      const result = await tool!.handler({ numbers: [5] });
      expect(result.content[0].text).toBe("5");
    });
  });
});
