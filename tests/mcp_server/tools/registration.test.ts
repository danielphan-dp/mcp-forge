/**
 * Tests for Category Tool Registration
 *
 * @module tests/mcp_server/tools/registration
 * @see {@link src/mcp_server/tools}
 *
 * Testing individual category registration functions
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all individual tool registrations for math
vi.mock("../../../src/mcp_server/tools/math/add.js", () => ({
  registerAddTool: vi.fn(),
  add: (a: number, b: number) => a + b,
}));
vi.mock("../../../src/mcp_server/tools/math/subtract.js", () => ({
  registerSubtractTool: vi.fn(),
  subtract: (a: number, b: number) => a - b,
}));
vi.mock("../../../src/mcp_server/tools/math/multiply.js", () => ({
  registerMultiplyTool: vi.fn(),
  multiply: (a: number, b: number) => a * b,
}));
vi.mock("../../../src/mcp_server/tools/math/divide.js", () => ({
  registerDivideTool: vi.fn(),
  divide: (a: number, b: number) => (b !== 0 ? a / b : NaN),
}));
vi.mock("../../../src/mcp_server/tools/math/power.js", () => ({
  registerPowerTool: vi.fn(),
  power: (base: number, exp: number) => Math.pow(base, exp),
}));
vi.mock("../../../src/mcp_server/tools/math/modulo.js", () => ({
  registerModuloTool: vi.fn(),
  modulo: (a: number, b: number) => a % b,
}));
vi.mock("../../../src/mcp_server/tools/math/sqrt.js", () => ({
  registerSqrtTool: vi.fn(),
  sqrt: (n: number) => Math.sqrt(n),
}));
vi.mock("../../../src/mcp_server/tools/math/abs.js", () => ({
  registerAbsTool: vi.fn(),
  abs: (n: number) => Math.abs(n),
}));
vi.mock("../../../src/mcp_server/tools/math/round.js", () => ({
  registerRoundTool: vi.fn(),
  registerFloorTool: vi.fn(),
  registerCeilTool: vi.fn(),
  round: (n: number) => Math.round(n),
}));
vi.mock("../../../src/mcp_server/tools/math/minmax.js", () => ({
  registerMinTool: vi.fn(),
  registerMaxTool: vi.fn(),
  min: (...nums: number[]) => Math.min(...nums),
  max: (...nums: number[]) => Math.max(...nums),
}));
vi.mock("../../../src/mcp_server/tools/math/factorial.js", () => ({
  registerFactorialTool: vi.fn(),
  factorial: (n: number) => (n <= 1 ? 1 : n * n),
}));
vi.mock("../../../src/mcp_server/tools/math/logarithm.js", () => ({
  registerLogTool: vi.fn(),
  registerLnTool: vi.fn(),
  log: (n: number) => Math.log10(n),
}));
vi.mock("../../../src/mcp_server/tools/math/trigonometry.js", () => ({
  registerSinTool: vi.fn(),
  registerCosTool: vi.fn(),
  registerTanTool: vi.fn(),
  sin: (n: number) => Math.sin(n),
}));
vi.mock("../../../src/mcp_server/tools/math/percent.js", () => ({
  registerPercentTool: vi.fn(),
  percentOf: (percent: number, value: number) => (percent / 100) * value,
}));
vi.mock("../../../src/mcp_server/tools/math/average.js", () => ({
  registerAverageTool: vi.fn(),
  average: (...nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length,
}));

// Mock string tools
vi.mock("../../../src/mcp_server/tools/string/string.js", () => ({
  registerReverseTool: vi.fn(),
  registerWordCountTool: vi.fn(),
  registerUppercaseTool: vi.fn(),
  registerLowercaseTool: vi.fn(),
  registerSlugifyTool: vi.fn(),
  reverse: (s: string) => s.split("").reverse().join(""),
}));

// Mock datetime tools
vi.mock("../../../src/mcp_server/tools/datetime/datetime.js", () => ({
  registerTimestampTool: vi.fn(),
  registerDateDiffTool: vi.fn(),
  registerFormatDateTool: vi.fn(),
  getCurrentTimestamp: () => Math.floor(Date.now() / 1000),
}));

// Mock developer tools
vi.mock("../../../src/mcp_server/tools/developer/json_format.js", () => ({
  registerJsonFormatTool: vi.fn(),
  jsonFormat: (json: string) => JSON.stringify(JSON.parse(json), null, 2),
}));
vi.mock("../../../src/mcp_server/tools/developer/url_encode.js", () => ({
  registerUrlEncodeTool: vi.fn(),
  registerUrlDecodeTool: vi.fn(),
  urlEncode: (s: string) => encodeURIComponent(s),
}));
vi.mock("../../../src/mcp_server/tools/developer/base64.js", () => ({
  registerBase64EncodeTool: vi.fn(),
  registerBase64DecodeTool: vi.fn(),
  base64Encode: (s: string) => btoa(s),
}));

// Mock utility tools
vi.mock("../../../src/mcp_server/tools/utility/random.js", () => ({
  registerRandomTool: vi.fn(),
  random: () => Math.random(),
}));
vi.mock("../../../src/mcp_server/tools/utility/uuid.js", () => ({
  registerUuidTool: vi.fn(),
  generateUuid: () => "mock-uuid",
}));
vi.mock("../../../src/mcp_server/tools/utility/base_convert.js", () => ({
  registerBaseConvertTool: vi.fn(),
  baseConvert: (num: string, from: number, to: number) =>
    parseInt(num, from).toString(to),
}));
vi.mock("../../../src/mcp_server/tools/utility/hash.js", () => ({
  registerHashTool: vi.fn(),
  hash: (s: string) => `hashed:${s}`,
}));

describe("Category Tool Registration", () => {
  const mockServer = { tool: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerMathTools", () => {
    it("should register all math tools", async () => {
      const { registerMathTools } = await import(
        "../../../src/mcp_server/tools/math/index.js"
      );
      const { registerAddTool } = await import(
        "../../../src/mcp_server/tools/math/add.js"
      );
      const { registerSubtractTool } = await import(
        "../../../src/mcp_server/tools/math/subtract.js"
      );
      const { registerMultiplyTool } = await import(
        "../../../src/mcp_server/tools/math/multiply.js"
      );
      const { registerDivideTool } = await import(
        "../../../src/mcp_server/tools/math/divide.js"
      );

      registerMathTools(mockServer as any);

      expect(registerAddTool).toHaveBeenCalledWith(mockServer);
      expect(registerSubtractTool).toHaveBeenCalledWith(mockServer);
      expect(registerMultiplyTool).toHaveBeenCalledWith(mockServer);
      expect(registerDivideTool).toHaveBeenCalledWith(mockServer);
    });

    it("should register advanced math tools", async () => {
      const { registerMathTools } = await import(
        "../../../src/mcp_server/tools/math/index.js"
      );
      const { registerAbsTool } = await import(
        "../../../src/mcp_server/tools/math/abs.js"
      );
      const { registerFactorialTool } = await import(
        "../../../src/mcp_server/tools/math/factorial.js"
      );
      const { registerAverageTool } = await import(
        "../../../src/mcp_server/tools/math/average.js"
      );

      registerMathTools(mockServer as any);

      expect(registerAbsTool).toHaveBeenCalledWith(mockServer);
      expect(registerFactorialTool).toHaveBeenCalledWith(mockServer);
      expect(registerAverageTool).toHaveBeenCalledWith(mockServer);
    });

    it("should register trigonometry tools", async () => {
      const { registerMathTools } = await import(
        "../../../src/mcp_server/tools/math/index.js"
      );
      const { registerSinTool, registerCosTool, registerTanTool } =
        await import("../../../src/mcp_server/tools/math/trigonometry.js");

      registerMathTools(mockServer as any);

      expect(registerSinTool).toHaveBeenCalledWith(mockServer);
      expect(registerCosTool).toHaveBeenCalledWith(mockServer);
      expect(registerTanTool).toHaveBeenCalledWith(mockServer);
    });

    it("should register rounding tools", async () => {
      const { registerMathTools } = await import(
        "../../../src/mcp_server/tools/math/index.js"
      );
      const { registerRoundTool, registerFloorTool, registerCeilTool } =
        await import("../../../src/mcp_server/tools/math/round.js");

      registerMathTools(mockServer as any);

      expect(registerRoundTool).toHaveBeenCalledWith(mockServer);
      expect(registerFloorTool).toHaveBeenCalledWith(mockServer);
      expect(registerCeilTool).toHaveBeenCalledWith(mockServer);
    });
  });

  describe("registerStringTools", () => {
    it("should register all string tools", async () => {
      const { registerStringTools } = await import(
        "../../../src/mcp_server/tools/string/index.js"
      );
      const {
        registerReverseTool,
        registerWordCountTool,
        registerUppercaseTool,
        registerLowercaseTool,
        registerSlugifyTool,
      } = await import("../../../src/mcp_server/tools/string/string.js");

      registerStringTools(mockServer as any);

      expect(registerReverseTool).toHaveBeenCalledWith(mockServer);
      expect(registerWordCountTool).toHaveBeenCalledWith(mockServer);
      expect(registerUppercaseTool).toHaveBeenCalledWith(mockServer);
      expect(registerLowercaseTool).toHaveBeenCalledWith(mockServer);
      expect(registerSlugifyTool).toHaveBeenCalledWith(mockServer);
    });
  });

  describe("registerDateTimeTools", () => {
    it("should register all datetime tools", async () => {
      const { registerDateTimeTools } = await import(
        "../../../src/mcp_server/tools/datetime/index.js"
      );
      const {
        registerTimestampTool,
        registerDateDiffTool,
        registerFormatDateTool,
      } = await import("../../../src/mcp_server/tools/datetime/datetime.js");

      registerDateTimeTools(mockServer as any);

      expect(registerTimestampTool).toHaveBeenCalledWith(mockServer);
      expect(registerDateDiffTool).toHaveBeenCalledWith(mockServer);
      expect(registerFormatDateTool).toHaveBeenCalledWith(mockServer);
    });
  });

  describe("registerDeveloperTools", () => {
    it("should register all developer tools", async () => {
      const { registerDeveloperTools } = await import(
        "../../../src/mcp_server/tools/developer/index.js"
      );
      const { registerJsonFormatTool } = await import(
        "../../../src/mcp_server/tools/developer/json_format.js"
      );
      const { registerUrlEncodeTool, registerUrlDecodeTool } = await import(
        "../../../src/mcp_server/tools/developer/url_encode.js"
      );
      const { registerBase64EncodeTool, registerBase64DecodeTool } =
        await import("../../../src/mcp_server/tools/developer/base64.js");

      registerDeveloperTools(mockServer as any);

      expect(registerJsonFormatTool).toHaveBeenCalledWith(mockServer);
      expect(registerUrlEncodeTool).toHaveBeenCalledWith(mockServer);
      expect(registerUrlDecodeTool).toHaveBeenCalledWith(mockServer);
      expect(registerBase64EncodeTool).toHaveBeenCalledWith(mockServer);
      expect(registerBase64DecodeTool).toHaveBeenCalledWith(mockServer);
    });
  });

  describe("registerUtilityTools", () => {
    it("should register all utility tools", async () => {
      const { registerUtilityTools } = await import(
        "../../../src/mcp_server/tools/utility/index.js"
      );
      const { registerRandomTool } = await import(
        "../../../src/mcp_server/tools/utility/random.js"
      );
      const { registerUuidTool } = await import(
        "../../../src/mcp_server/tools/utility/uuid.js"
      );
      const { registerBaseConvertTool } = await import(
        "../../../src/mcp_server/tools/utility/base_convert.js"
      );
      const { registerHashTool } = await import(
        "../../../src/mcp_server/tools/utility/hash.js"
      );

      registerUtilityTools(mockServer as any);

      expect(registerRandomTool).toHaveBeenCalledWith(mockServer);
      expect(registerUuidTool).toHaveBeenCalledWith(mockServer);
      expect(registerBaseConvertTool).toHaveBeenCalledWith(mockServer);
      expect(registerHashTool).toHaveBeenCalledWith(mockServer);
    });
  });
});
