/**
 * Tests for Math tools - Pure function unit tests
 *
 * @module tests/mcp_server/tools/math
 * @see {@link src/mcp_server/tools/math}
 *
 * These tests import and test the actual source functions
 */
import { describe, it, expect } from "vitest";

// Import actual functions from source files
import { add } from "../../../../src/mcp_server/tools/math/add.js";
import { subtract } from "../../../../src/mcp_server/tools/math/subtract.js";
import { multiply } from "../../../../src/mcp_server/tools/math/multiply.js";
import { divide } from "../../../../src/mcp_server/tools/math/divide.js";
import { power } from "../../../../src/mcp_server/tools/math/power.js";
import { modulo } from "../../../../src/mcp_server/tools/math/modulo.js";
import { sqrt } from "../../../../src/mcp_server/tools/math/sqrt.js";
import { abs } from "../../../../src/mcp_server/tools/math/abs.js";
import {
  round,
  floor,
  ceil,
} from "../../../../src/mcp_server/tools/math/round.js";
import { min, max } from "../../../../src/mcp_server/tools/math/minmax.js";
import { factorial } from "../../../../src/mcp_server/tools/math/factorial.js";
import { log, ln } from "../../../../src/mcp_server/tools/math/logarithm.js";
import {
  sin,
  cos,
  tan,
} from "../../../../src/mcp_server/tools/math/trigonometry.js";
import {
  percentOf,
  percentIs,
} from "../../../../src/mcp_server/tools/math/percent.js";
import { average } from "../../../../src/mcp_server/tools/math/average.js";

// ============ Tests ============

describe("Math Tools", () => {
  describe("add", () => {
    it("should add two positive numbers", () => {
      expect(add(2, 3)).toBe(5);
    });

    it("should add negative numbers", () => {
      expect(add(-5, 3)).toBe(-2);
    });

    it("should add with zero", () => {
      expect(add(5, 0)).toBe(5);
    });

    it("should add floating point numbers", () => {
      expect(add(1.5, 2.5)).toBe(4);
    });
  });

  describe("subtract", () => {
    it("should subtract two positive numbers", () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it("should handle negative results", () => {
      expect(subtract(3, 5)).toBe(-2);
    });

    it("should subtract with zero", () => {
      expect(subtract(5, 0)).toBe(5);
    });

    it("should subtract floating point numbers", () => {
      expect(subtract(5.5, 2.5)).toBe(3);
    });
  });

  describe("multiply", () => {
    it("should multiply two positive numbers", () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it("should multiply with negative numbers", () => {
      expect(multiply(-3, 4)).toBe(-12);
      expect(multiply(-3, -4)).toBe(12);
    });

    it("should multiply with zero", () => {
      expect(multiply(5, 0)).toBe(0);
    });

    it("should multiply floating point numbers", () => {
      expect(multiply(2.5, 4)).toBe(10);
    });
  });

  describe("divide", () => {
    it("should divide two positive numbers", () => {
      expect(divide(10, 2)).toEqual({ result: 5 });
    });

    it("should return error for division by zero", () => {
      expect(divide(10, 0)).toEqual({ error: "Error: Division by zero" });
    });

    it("should handle negative numbers", () => {
      expect(divide(-10, 2)).toEqual({ result: -5 });
    });

    it("should handle floating point results", () => {
      expect(divide(7, 2)).toEqual({ result: 3.5 });
    });
  });

  describe("power", () => {
    it("should calculate positive exponent", () => {
      expect(power(2, 3)).toBe(8);
    });

    it("should handle zero exponent", () => {
      expect(power(5, 0)).toBe(1);
    });

    it("should handle negative exponent", () => {
      expect(power(2, -1)).toBe(0.5);
    });

    it("should handle fractional exponent", () => {
      expect(power(4, 0.5)).toBe(2);
    });
  });

  describe("modulo", () => {
    it("should calculate modulo of two numbers", () => {
      expect(modulo(10, 3)).toEqual({ result: 1 });
    });

    it("should return error for modulo by zero", () => {
      expect(modulo(10, 0)).toEqual({ error: "Error: Division by zero" });
    });

    it("should handle negative numbers", () => {
      expect(modulo(-10, 3)).toEqual({ result: -1 });
    });
  });

  describe("sqrt", () => {
    it("should calculate square root of positive numbers", () => {
      expect(sqrt(16)).toEqual({ result: 4 });
    });

    it("should handle zero", () => {
      expect(sqrt(0)).toEqual({ result: 0 });
    });

    it("should return error for negative numbers", () => {
      expect(sqrt(-4)).toEqual({
        error: "Error: Cannot calculate square root of negative number",
      });
    });

    it("should handle non-perfect squares", () => {
      expect(sqrt(2)).toEqual({ result: Math.sqrt(2) });
    });
  });

  describe("abs", () => {
    it("should return absolute value of positive number", () => {
      expect(abs(5)).toBe(5);
    });

    it("should return absolute value of negative number", () => {
      expect(abs(-5)).toBe(5);
    });

    it("should handle zero", () => {
      expect(abs(0)).toBe(0);
    });
  });

  describe("round", () => {
    it("should round to nearest integer by default", () => {
      expect(round(4.5)).toBe(5);
      expect(round(4.4)).toBe(4);
    });

    it("should round to specified decimal places", () => {
      expect(round(3.14159, 2)).toBe(3.14);
      expect(round(3.14159, 4)).toBe(3.1416);
    });

    it("should handle negative numbers", () => {
      expect(round(-4.5)).toBe(-4);
    });
  });

  describe("floor", () => {
    it("should floor positive numbers", () => {
      expect(floor(4.9)).toBe(4);
    });

    it("should floor negative numbers", () => {
      expect(floor(-4.1)).toBe(-5);
    });

    it("should not change integers", () => {
      expect(floor(5)).toBe(5);
    });
  });

  describe("ceil", () => {
    it("should ceil positive numbers", () => {
      expect(ceil(4.1)).toBe(5);
    });

    it("should ceil negative numbers", () => {
      expect(ceil(-4.9)).toBe(-4);
    });

    it("should not change integers", () => {
      expect(ceil(5)).toBe(5);
    });
  });

  describe("min", () => {
    it("should find minimum in array", () => {
      expect(min([3, 1, 4, 1, 5])).toBe(1);
    });

    it("should handle negative numbers", () => {
      expect(min([-5, -3, -10])).toBe(-10);
    });

    it("should handle single element", () => {
      expect(min([42])).toBe(42);
    });
  });

  describe("max", () => {
    it("should find maximum in array", () => {
      expect(max([3, 1, 4, 1, 5])).toBe(5);
    });

    it("should handle negative numbers", () => {
      expect(max([-5, -3, -10])).toBe(-3);
    });

    it("should handle single element", () => {
      expect(max([42])).toBe(42);
    });
  });

  describe("factorial", () => {
    it("should calculate factorial of 0", () => {
      expect(factorial(0)).toBe(1);
    });

    it("should calculate factorial of 1", () => {
      expect(factorial(1)).toBe(1);
    });

    it("should calculate factorial of 5", () => {
      expect(factorial(5)).toBe(120);
    });

    it("should calculate factorial of 10", () => {
      expect(factorial(10)).toBe(3628800);
    });
  });

  describe("log", () => {
    it("should calculate log base 10", () => {
      expect(log(100, 10)).toEqual({ result: 2 });
    });

    it("should calculate log base 2", () => {
      expect(log(8, 2)).toEqual({ result: 3 });
    });

    it("should return error for base 1", () => {
      expect(log(10, 1)).toEqual({ error: "Error: Base cannot be 1" });
    });
  });

  describe("ln", () => {
    it("should calculate natural log", () => {
      expect(ln(Math.E)).toBeCloseTo(1);
    });

    it("should calculate ln(1)", () => {
      expect(ln(1)).toBe(0);
    });
  });

  describe("trigonometry", () => {
    describe("sin", () => {
      it("should calculate sin in radians", () => {
        expect(sin(0)).toBe(0);
        expect(sin(Math.PI / 2)).toBeCloseTo(1);
      });

      it("should calculate sin in degrees", () => {
        expect(sin(0, "degrees")).toBe(0);
        expect(sin(90, "degrees")).toBeCloseTo(1);
      });
    });

    describe("cos", () => {
      it("should calculate cos in radians", () => {
        expect(cos(0)).toBe(1);
        expect(cos(Math.PI)).toBeCloseTo(-1);
      });

      it("should calculate cos in degrees", () => {
        expect(cos(0, "degrees")).toBe(1);
        expect(cos(180, "degrees")).toBeCloseTo(-1);
      });
    });

    describe("tan", () => {
      it("should calculate tan in radians", () => {
        expect(tan(0)).toBe(0);
        expect(tan(Math.PI / 4)).toBeCloseTo(1);
      });

      it("should calculate tan in degrees", () => {
        expect(tan(0, "degrees")).toBe(0);
        expect(tan(45, "degrees")).toBeCloseTo(1);
      });
    });
  });

  describe("percent", () => {
    describe("percentOf", () => {
      it("should calculate X% of Y", () => {
        expect(percentOf(10, 200)).toBe(20);
        expect(percentOf(50, 100)).toBe(50);
      });

      it("should handle 0%", () => {
        expect(percentOf(0, 100)).toBe(0);
      });

      it("should handle more than 100%", () => {
        expect(percentOf(150, 100)).toBe(150);
      });
    });

    describe("percentIs", () => {
      it("should calculate what percent X is of Y", () => {
        expect(percentIs(25, 100)).toEqual({ result: 25 });
        expect(percentIs(50, 200)).toEqual({ result: 25 });
      });

      it("should return error for division by zero", () => {
        expect(percentIs(10, 0)).toEqual({
          error: "Error: Cannot calculate percentage of zero",
        });
      });
    });
  });

  describe("average", () => {
    it("should calculate average of numbers", () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });

    it("should handle single number", () => {
      expect(average([42])).toBe(42);
    });

    it("should handle negative numbers", () => {
      expect(average([-5, 5])).toBe(0);
    });

    it("should handle floating point numbers", () => {
      expect(average([1.5, 2.5])).toBe(2);
    });
  });
});
