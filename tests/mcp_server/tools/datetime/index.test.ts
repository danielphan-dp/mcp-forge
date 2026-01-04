/**
 * Tests for DateTime Tools
 *
 * @module tests/mcp_server/tools/datetime/index
 * @see {@link src/mcp_server/tools/datetime/datetime}
 *
 * Testing timestamp conversion, date difference, and date formatting
 * utility functions for the DateTime tools module.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCurrentTimestamp,
  timestampToDate,
  dateToTimestamp,
  dateDiff,
  formatDate,
} from "../../../../src/mcp_server/tools/datetime/datetime.js";

// ============ Tests ============

describe("DateTime Tools", () => {
  describe("getCurrentTimestamp", () => {
    it("should return current Unix timestamp", () => {
      const before = Math.floor(Date.now() / 1000);
      const timestamp = getCurrentTimestamp();
      const after = Math.floor(Date.now() / 1000);

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it("should return a number", () => {
      expect(typeof getCurrentTimestamp()).toBe("number");
    });

    it("should return an integer", () => {
      const timestamp = getCurrentTimestamp();
      expect(Number.isInteger(timestamp)).toBe(true);
    });
  });

  describe("timestampToDate", () => {
    it("should convert Unix timestamp to ISO date", () => {
      // 2024-01-01T00:00:00.000Z
      const result = timestampToDate(1704067200);
      expect(result.result).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should handle timestamp 0 (Unix epoch)", () => {
      const result = timestampToDate(0);
      expect(result.result).toBe("1970-01-01T00:00:00.000Z");
    });

    it("should handle negative timestamps (before Unix epoch)", () => {
      const result = timestampToDate(-86400);
      expect(result.result).toBe("1969-12-31T00:00:00.000Z");
    });

    it("should return error for NaN", () => {
      const result = timestampToDate(NaN);
      expect(result.error).toBe("Error: Invalid timestamp");
    });

    it("should return error for Infinity", () => {
      const result = timestampToDate(Infinity);
      expect(result.error).toBe("Error: Invalid timestamp");
    });
  });

  describe("dateToTimestamp", () => {
    it("should convert ISO date to Unix timestamp", () => {
      const result = dateToTimestamp("2024-01-01T00:00:00.000Z");
      expect(result.result).toBe(1704067200);
    });

    it("should handle date-only format", () => {
      const result = dateToTimestamp("2024-01-01");
      expect(result.result).toBeDefined();
    });

    it("should handle various date formats", () => {
      const result = dateToTimestamp("January 1, 2024");
      expect(result.result).toBeDefined();
    });

    it("should return error for invalid date", () => {
      const result = dateToTimestamp("not a date");
      expect(result.error).toBe("Error: Invalid date format");
    });

    it("should return error for empty string", () => {
      const result = dateToTimestamp("");
      expect(result.error).toBe("Error: Invalid date format");
    });
  });

  describe("round-trip timestamp conversion", () => {
    it("should convert timestamp to date and back", () => {
      const originalTimestamp = 1704067200;
      const dateResult = timestampToDate(originalTimestamp);
      const timestampResult = dateToTimestamp(dateResult.result!);
      expect(timestampResult.result).toBe(originalTimestamp);
    });
  });

  describe("dateDiff", () => {
    it("should calculate difference in days", () => {
      const result = dateDiff(
        "2024-01-01T00:00:00Z",
        "2024-01-10T00:00:00Z",
        "days"
      );
      expect(result.result).toBe(9);
    });

    it("should calculate difference in hours", () => {
      const result = dateDiff(
        "2024-01-01T00:00:00Z",
        "2024-01-01T12:00:00Z",
        "hours"
      );
      expect(result.result).toBe(12);
    });

    it("should calculate difference in minutes", () => {
      const result = dateDiff(
        "2024-01-01T00:00:00Z",
        "2024-01-01T01:30:00Z",
        "minutes"
      );
      expect(result.result).toBe(90);
    });

    it("should calculate difference in seconds", () => {
      const result = dateDiff(
        "2024-01-01T00:00:00Z",
        "2024-01-01T00:01:00Z",
        "seconds"
      );
      expect(result.result).toBe(60);
    });

    it("should calculate difference in weeks", () => {
      const result = dateDiff(
        "2024-01-01T00:00:00Z",
        "2024-01-15T00:00:00Z",
        "weeks"
      );
      expect(result.result).toBe(2);
    });

    it("should return absolute difference (order doesn't matter)", () => {
      const result1 = dateDiff("2024-01-01", "2024-01-10", "days");
      const result2 = dateDiff("2024-01-10", "2024-01-01", "days");
      expect(result1.result).toBe(result2.result);
    });

    it("should return error for invalid date1", () => {
      const result = dateDiff("invalid", "2024-01-01", "days");
      expect(result.error).toBe("Error: Invalid date format");
    });

    it("should return error for invalid date2", () => {
      const result = dateDiff("2024-01-01", "invalid", "days");
      expect(result.error).toBe("Error: Invalid date format");
    });

    it("should handle same date", () => {
      const result = dateDiff("2024-01-01", "2024-01-01", "days");
      expect(result.result).toBe(0);
    });
  });

  describe("formatDate", () => {
    const testDate = "2024-06-15T14:30:00.000Z";

    it("should format as ISO", () => {
      const result = formatDate(testDate, "iso");
      expect(result.result).toBe("2024-06-15T14:30:00.000Z");
    });

    it("should format as UTC", () => {
      const result = formatDate(testDate, "utc");
      expect(result.result).toContain("Sat, 15 Jun 2024");
    });

    it("should format as local", () => {
      const result = formatDate(testDate, "local", "en-US");
      expect(result.result).toBeDefined();
      expect(typeof result.result).toBe("string");
    });

    it("should format as date only", () => {
      const result = formatDate(testDate, "date", "en-US");
      expect(result.result).toBeDefined();
    });

    it("should format as time only", () => {
      const result = formatDate(testDate, "time", "en-US");
      expect(result.result).toBeDefined();
    });

    it("should return error for invalid date", () => {
      const result = formatDate("invalid date", "iso");
      expect(result.error).toBe("Error: Invalid date format");
    });

    it("should use current date when date is undefined", () => {
      const result = formatDate(undefined, "iso");
      expect(result.result).toBeDefined();
      expect(result.result).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
  });

  describe("formatDate relative", () => {
    beforeEach(() => {
      // Mock Date to have consistent test results
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return 'today' for current date", () => {
      const result = formatDate("2024-06-15T10:00:00.000Z", "relative");
      expect(result.result).toBe("today");
    });

    it("should return 'yesterday' for previous day", () => {
      const result = formatDate("2024-06-14T10:00:00.000Z", "relative");
      expect(result.result).toBe("yesterday");
    });

    it("should return 'tomorrow' for next day", () => {
      const result = formatDate("2024-06-16T10:00:00.000Z", "relative");
      expect(result.result).toBe("tomorrow");
    });

    it("should return 'X days ago' for past dates", () => {
      const result = formatDate("2024-06-10T10:00:00.000Z", "relative");
      expect(result.result).toBe("5 days ago");
    });

    it("should return 'in X days' for future dates", () => {
      const result = formatDate("2024-06-20T10:00:00.000Z", "relative");
      expect(result.result).toBe("in 5 days");
    });
  });
});
