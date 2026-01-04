/**
 * Tests for Utility Tools
 *
 * @module tests/mcp_server/tools/utility/index
 * @see {@link src/mcp_server/tools/utility}
 *
 * Testing hash, UUID, random number, and base conversion functions from source.
 * These tests verify the core utility functions work correctly with various inputs
 * and edge cases.
 */
import { describe, it, expect } from "vitest";

// Import actual functions from source
import { hash } from "../../../../src/mcp_server/tools/utility/hash.js";
import {
  generateUuid,
  generateUuids,
} from "../../../../src/mcp_server/tools/utility/uuid.js";
import { random } from "../../../../src/mcp_server/tools/utility/random.js";
import { baseConvert } from "../../../../src/mcp_server/tools/utility/base_convert.js";

// ============ Tests ============

describe("Utility Tools", () => {
  describe("Hash", () => {
    it("should generate SHA256 hash by default", () => {
      const result = hash("hello");
      expect(result).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
      );
    });

    it("should generate MD5 hash", () => {
      const result = hash("hello", "md5");
      expect(result).toBe("5d41402abc4b2a76b9719d911017c592");
    });

    it("should generate SHA1 hash", () => {
      const result = hash("hello", "sha1");
      expect(result).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
    });

    it("should generate SHA512 hash", () => {
      const result = hash("hello", "sha512");
      expect(result).toBe(
        "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
      );
    });

    it("should handle empty string", () => {
      const result = hash("");
      expect(result).toBe(
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      );
    });

    it("should handle unicode", () => {
      const result = hash("こんにちは", "sha256");
      expect(result).toHaveLength(64);
    });

    it("should produce different hashes for different inputs", () => {
      const hash1 = hash("hello");
      const hash2 = hash("world");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce consistent hashes for same input", () => {
      const hash1 = hash("test");
      const hash2 = hash("test");
      expect(hash1).toBe(hash2);
    });
  });

  describe("UUID", () => {
    it("should generate valid UUID v4 format", () => {
      const uuid = generateUuid();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it("should generate unique UUIDs", () => {
      const uuids = generateUuids(10);
      const uniqueUuids = new Set(uuids);
      expect(uniqueUuids.size).toBe(10);
    });

    it("should generate specified count of UUIDs", () => {
      const uuids = generateUuids(5);
      expect(uuids).toHaveLength(5);
    });

    it("should generate all valid UUIDs in batch", () => {
      const uuids = generateUuids(10);
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      for (const uuid of uuids) {
        expect(uuid).toMatch(uuidRegex);
      }
    });
  });

  describe("Random", () => {
    it("should generate random float between 0 and 1 by default", () => {
      const result = random();
      expect(result.result).toBeGreaterThanOrEqual(0);
      expect(result.result).toBeLessThan(1);
    });

    it("should generate random float in custom range", () => {
      const result = random(10, 20);
      expect(result.result).toBeGreaterThanOrEqual(10);
      expect(result.result).toBeLessThan(20);
    });

    it("should generate random integer in range", () => {
      const result = random(1, 10, true);
      expect(result.result).toBeGreaterThanOrEqual(1);
      expect(result.result).toBeLessThan(10);
      expect(Number.isInteger(result.result)).toBe(true);
    });

    it("should return error when max <= min", () => {
      expect(random(10, 5)).toEqual({
        error: "Error: max must be greater than min",
      });
      expect(random(5, 5)).toEqual({
        error: "Error: max must be greater than min",
      });
    });

    it("should return error when no integers in range", () => {
      expect(random(1.5, 1.9, true)).toEqual({
        error: "Error: No integers exist in the provided range",
      });
    });

    it("should handle negative ranges", () => {
      const result = random(-10, -5);
      expect(result.result).toBeGreaterThanOrEqual(-10);
      expect(result.result).toBeLessThan(-5);
    });
  });

  describe("Base Convert", () => {
    describe("decimal conversions", () => {
      it("should convert decimal to binary", () => {
        expect(baseConvert("10", "10", "2")).toEqual({ result: "0b1010" });
      });

      it("should convert decimal to octal", () => {
        expect(baseConvert("64", "10", "8")).toEqual({ result: "0o100" });
      });

      it("should convert decimal to hex", () => {
        expect(baseConvert("255", "10", "16")).toEqual({ result: "0xFF" });
      });
    });

    describe("binary conversions", () => {
      it("should convert binary to decimal", () => {
        expect(baseConvert("1010", "2", "10")).toEqual({ result: "10" });
      });

      it("should convert binary to hex", () => {
        expect(baseConvert("11111111", "2", "16")).toEqual({ result: "0xFF" });
      });

      it("should handle 0b prefix", () => {
        expect(baseConvert("0b1010", "2", "10")).toEqual({ result: "10" });
      });
    });

    describe("hex conversions", () => {
      it("should convert hex to decimal", () => {
        expect(baseConvert("FF", "16", "10")).toEqual({ result: "255" });
      });

      it("should convert hex to binary", () => {
        expect(baseConvert("A", "16", "2")).toEqual({ result: "0b1010" });
      });

      it("should handle 0x prefix", () => {
        expect(baseConvert("0xFF", "16", "10")).toEqual({ result: "255" });
      });

      it("should handle lowercase hex", () => {
        expect(baseConvert("ff", "16", "10")).toEqual({ result: "255" });
      });
    });

    describe("octal conversions", () => {
      it("should convert octal to decimal", () => {
        expect(baseConvert("100", "8", "10")).toEqual({ result: "64" });
      });

      it("should handle 0o prefix", () => {
        expect(baseConvert("0o100", "8", "10")).toEqual({ result: "64" });
      });
    });

    describe("error cases", () => {
      it("should return error for invalid binary digits", () => {
        const result = baseConvert("102", "2", "10");
        expect(result.error).toContain("Invalid value");
      });

      it("should return error for invalid octal digits", () => {
        const result = baseConvert("189", "8", "10");
        expect(result.error).toContain("Invalid value");
      });

      it("should return error for invalid hex digits", () => {
        const result = baseConvert("GHI", "16", "10");
        expect(result.error).toContain("Invalid value");
      });

      it("should return error for empty value", () => {
        const result = baseConvert("", "10", "2");
        expect(result.error).toContain("Invalid value");
      });
    });

    describe("edge cases", () => {
      it("should handle zero", () => {
        expect(baseConvert("0", "10", "2")).toEqual({ result: "0b0" });
        expect(baseConvert("0", "10", "16")).toEqual({ result: "0x0" });
      });

      it("should handle negative numbers", () => {
        expect(baseConvert("-10", "10", "2")).toEqual({ result: "0b-1010" });
      });

      it("should handle whitespace", () => {
        expect(baseConvert("  10  ", "10", "2")).toEqual({ result: "0b1010" });
      });

      it("should convert same base", () => {
        expect(baseConvert("255", "10", "10")).toEqual({ result: "255" });
      });
    });
  });
});
