/**
 * Tests for Developer Tools
 *
 * @module tests/mcp_server/tools/developer/index.test
 * @see {@link src/mcp_server/tools/developer}
 *
 * Testing base64 encoding/decoding, JSON formatting, and URL encoding/decoding
 * functions from the developer tools module.
 */
import { describe, it, expect } from "vitest";

// Import actual functions from source
import {
  base64Encode,
  base64Decode,
} from "../../../../src/mcp_server/tools/developer/base64.js";
import { jsonFormat } from "../../../../src/mcp_server/tools/developer/json_format.js";
import {
  urlEncode,
  urlDecode,
} from "../../../../src/mcp_server/tools/developer/url_encode.js";

// ============ Tests ============

describe("Developer Tools", () => {
  describe("Base64", () => {
    describe("base64Encode", () => {
      it("should encode a simple string", () => {
        expect(base64Encode("Hello, World!")).toBe("SGVsbG8sIFdvcmxkIQ==");
      });

      it("should encode empty string", () => {
        expect(base64Encode("")).toBe("");
      });

      it("should encode string with special characters", () => {
        expect(base64Encode("a!@#$%^&*()")).toBe("YSFAIyQlXiYqKCk=");
      });

      it("should handle unicode characters", () => {
        expect(base64Encode("こんにちは")).toBe("44GT44KT44Gr44Gh44Gv");
      });

      it("should encode URL-safe without padding", () => {
        expect(base64Encode("subjects?_d", true)).toBe("c3ViamVjdHM_X2Q");
      });

      it("should replace + with - and / with _ in URL-safe mode", () => {
        // String that produces + and / in standard base64
        const encoded = base64Encode("ab>?", true);
        expect(encoded).not.toContain("+");
        expect(encoded).not.toContain("/");
        expect(encoded).not.toContain("=");
      });
    });

    describe("base64Decode", () => {
      it("should decode a simple string", () => {
        expect(base64Decode("SGVsbG8sIFdvcmxkIQ==")).toEqual({
          result: "Hello, World!",
        });
      });

      it("should decode empty string", () => {
        expect(base64Decode("")).toEqual({ result: "" });
      });

      it("should decode without padding", () => {
        expect(base64Decode("SGVsbG8")).toEqual({ result: "Hello" });
      });

      it("should decode URL-safe base64", () => {
        expect(base64Decode("c3ViamVjdHM_X2Q", true)).toEqual({
          result: "subjects?_d",
        });
      });

      it("should return error for invalid base64", () => {
        expect(base64Decode("!!invalid!!")).toEqual({
          error: "Error: Invalid Base64 string",
        });
      });

      it("should handle trimming whitespace", () => {
        expect(base64Decode("  SGVsbG8=  ")).toEqual({ result: "Hello" });
      });
    });

    describe("round-trip encoding/decoding", () => {
      it("should encode and decode back to original", () => {
        const original = "Hello, World! 123 こんにちは";
        const encoded = base64Encode(original);
        const decoded = base64Decode(encoded);
        expect(decoded.result).toBe(original);
      });

      it("should work with URL-safe encoding", () => {
        const original = "subjects?_d=test/value";
        const encoded = base64Encode(original, true);
        const decoded = base64Decode(encoded, true);
        expect(decoded.result).toBe(original);
      });
    });
  });

  describe("JSON Format", () => {
    it("should pretty-print JSON with default indent", () => {
      const result = jsonFormat('{"a":1,"b":2}');
      expect(result.result).toBe('{\n  "a": 1,\n  "b": 2\n}');
    });

    it("should pretty-print with custom indent", () => {
      const result = jsonFormat('{"a":1}', false, 4);
      expect(result.result).toBe('{\n    "a": 1\n}');
    });

    it("should minify JSON", () => {
      const result = jsonFormat('{\n  "a": 1,\n  "b": 2\n}', true);
      expect(result.result).toBe('{"a":1,"b":2}');
    });

    it("should handle nested objects", () => {
      const result = jsonFormat('{"a":{"b":{"c":1}}}');
      expect(result.result).toBe(
        '{\n  "a": {\n    "b": {\n      "c": 1\n    }\n  }\n}'
      );
    });

    it("should handle arrays", () => {
      const result = jsonFormat("[1,2,3]");
      expect(result.result).toBe("[\n  1,\n  2,\n  3\n]");
    });

    it("should return error for invalid JSON", () => {
      expect(jsonFormat("{invalid}")).toEqual({ error: "Error: Invalid JSON" });
    });

    it("should return error for empty input", () => {
      expect(jsonFormat("")).toEqual({ error: "Error: Invalid JSON" });
    });

    it("should handle JSON with strings, numbers, booleans, null", () => {
      const result = jsonFormat(
        '{"str":"hello","num":42,"bool":true,"nil":null}'
      );
      expect(result.error).toBeUndefined();
      expect(result.result).toContain('"str": "hello"');
      expect(result.result).toContain('"num": 42');
      expect(result.result).toContain('"bool": true');
      expect(result.result).toContain('"nil": null');
    });
  });

  describe("URL Encoding", () => {
    describe("urlEncode", () => {
      it("should encode special characters with encodeURIComponent", () => {
        expect(urlEncode("hello world")).toBe("hello%20world");
        expect(urlEncode("a=b&c=d")).toBe("a%3Db%26c%3Dd");
      });

      it("should encode with encodeURI (less aggressive)", () => {
        expect(urlEncode("http://example.com/path?q=test", false)).toBe(
          "http://example.com/path?q=test"
        );
      });

      it("should handle empty string", () => {
        expect(urlEncode("")).toBe("");
      });

      it("should encode unicode characters", () => {
        expect(urlEncode("こんにちは")).toBe(
          "%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF"
        );
      });

      it("should not encode unreserved characters", () => {
        expect(urlEncode("abc123-_.~")).toBe("abc123-_.~");
      });
    });

    describe("urlDecode", () => {
      it("should decode encoded characters", () => {
        expect(urlDecode("hello%20world")).toEqual({ result: "hello world" });
      });

      it("should decode with decodeURI", () => {
        expect(urlDecode("hello%20world", false)).toEqual({
          result: "hello world",
        });
      });

      it("should handle empty string", () => {
        expect(urlDecode("")).toEqual({ result: "" });
      });

      it("should decode unicode", () => {
        expect(
          urlDecode("%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF")
        ).toEqual({ result: "こんにちは" });
      });

      it("should return error for invalid encoding", () => {
        expect(urlDecode("%GG")).toEqual({
          error: "Error: Invalid encoded string",
        });
      });

      it("should handle incomplete percent encoding", () => {
        expect(urlDecode("%E")).toEqual({
          error: "Error: Invalid encoded string",
        });
      });
    });

    describe("round-trip encoding/decoding", () => {
      it("should encode and decode back to original", () => {
        const original = "Hello, World! 123 @#$%^&*()";
        const encoded = urlEncode(original);
        const decoded = urlDecode(encoded);
        expect(decoded.result).toBe(original);
      });

      it("should work with unicode", () => {
        const original = "日本語テスト";
        const encoded = urlEncode(original);
        const decoded = urlDecode(encoded);
        expect(decoded.result).toBe(original);
      });
    });
  });
});
