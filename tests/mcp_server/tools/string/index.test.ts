/**
 * Tests for String Tools
 *
 * @module tests/mcp_server/tools/string/index
 * @see {@link src/mcp_server/tools/string/string}
 *
 * Unit tests for the core string manipulation functions including
 * reverse, wordCount, uppercase, lowercase, and slugify operations.
 */
import { describe, it, expect } from "vitest";

// Import actual functions from source
import {
  reverse,
  wordCount,
  uppercase,
  lowercase,
  slugify,
} from "../../../../src/mcp_server/tools/string/string.js";

// ============ Tests ============

describe("String Tools", () => {
  describe("reverse", () => {
    it("should reverse a simple string", () => {
      expect(reverse("hello")).toBe("olleh");
    });

    it("should handle empty string", () => {
      expect(reverse("")).toBe("");
    });

    it("should handle single character", () => {
      expect(reverse("a")).toBe("a");
    });

    it("should handle palindrome", () => {
      expect(reverse("radar")).toBe("radar");
    });

    it("should handle string with spaces", () => {
      expect(reverse("hello world")).toBe("dlrow olleh");
    });

    it("should handle special characters", () => {
      expect(reverse("a!b@c")).toBe("c@b!a");
    });

    it("should handle unicode characters", () => {
      expect(reverse("café")).toBe("éfac");
    });
  });

  describe("wordCount", () => {
    it("should count words in simple text", () => {
      const result = wordCount("hello world");
      expect(result.words).toBe(2);
    });

    it("should count characters including spaces", () => {
      const result = wordCount("hello world");
      expect(result.characters).toBe(11);
    });

    it("should count characters without spaces", () => {
      const result = wordCount("hello world");
      expect(result.charactersNoSpaces).toBe(10);
    });

    it("should count lines", () => {
      const result = wordCount("line1\nline2\nline3");
      expect(result.lines).toBe(3);
    });

    it("should handle empty string", () => {
      const result = wordCount("");
      expect(result.words).toBe(0);
      expect(result.characters).toBe(0);
      expect(result.lines).toBe(1);
    });

    it("should handle only whitespace", () => {
      const result = wordCount("   ");
      expect(result.words).toBe(0);
      expect(result.characters).toBe(3);
      expect(result.charactersNoSpaces).toBe(0);
    });

    it("should handle multiple spaces between words", () => {
      const result = wordCount("hello    world");
      expect(result.words).toBe(2);
    });

    it("should handle Windows line endings", () => {
      const result = wordCount("line1\r\nline2");
      expect(result.lines).toBe(2);
    });
  });

  describe("uppercase", () => {
    it("should convert to uppercase", () => {
      expect(uppercase("hello")).toBe("HELLO");
    });

    it("should handle already uppercase", () => {
      expect(uppercase("HELLO")).toBe("HELLO");
    });

    it("should handle mixed case", () => {
      expect(uppercase("Hello World")).toBe("HELLO WORLD");
    });

    it("should handle empty string", () => {
      expect(uppercase("")).toBe("");
    });

    it("should not change numbers and special chars", () => {
      expect(uppercase("abc123!@#")).toBe("ABC123!@#");
    });
  });

  describe("lowercase", () => {
    it("should convert to lowercase", () => {
      expect(lowercase("HELLO")).toBe("hello");
    });

    it("should handle already lowercase", () => {
      expect(lowercase("hello")).toBe("hello");
    });

    it("should handle mixed case", () => {
      expect(lowercase("Hello World")).toBe("hello world");
    });

    it("should handle empty string", () => {
      expect(lowercase("")).toBe("");
    });

    it("should not change numbers and special chars", () => {
      expect(lowercase("ABC123!@#")).toBe("abc123!@#");
    });
  });

  describe("slugify", () => {
    it("should create a slug from simple text", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("Hello    World")).toBe("hello-world");
    });

    it("should remove special characters", () => {
      expect(slugify("Hello, World!")).toBe("hello-world");
    });

    it("should handle underscores", () => {
      expect(slugify("hello_world")).toBe("hello-world");
    });

    it("should trim leading/trailing hyphens", () => {
      expect(slugify("--Hello World--")).toBe("hello-world");
    });

    it("should handle empty string", () => {
      expect(slugify("")).toBe("");
    });

    it("should handle only special characters", () => {
      expect(slugify("!@#$%")).toBe("");
    });

    it("should create URL-friendly slugs", () => {
      expect(slugify("My Blog Post Title (2024)")).toBe(
        "my-blog-post-title-2024"
      );
    });

    it("should handle consecutive special characters", () => {
      expect(slugify("a - b - c")).toBe("a-b-c");
    });
  });
});
