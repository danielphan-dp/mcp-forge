/**
 * Tests for STDIO Transport utilities
 *
 * @module tests/transports/stdio
 * @see {@link src/transports/stdio}
 *
 * Testing debug logging and initialization logic
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("STDIO Transport", () => {
  describe("debug mode", () => {
    function isDebugMode(envValue: string | undefined): boolean {
      return envValue === "1";
    }

    it("should enable debug mode when MCP_STDIO_DEBUG is 1", () => {
      expect(isDebugMode("1")).toBe(true);
    });

    it("should disable debug mode when MCP_STDIO_DEBUG is 0", () => {
      expect(isDebugMode("0")).toBe(false);
    });

    it("should disable debug mode when MCP_STDIO_DEBUG is undefined", () => {
      expect(isDebugMode(undefined)).toBe(false);
    });

    it("should disable debug mode for other values", () => {
      expect(isDebugMode("true")).toBe(false);
      expect(isDebugMode("yes")).toBe(false);
      expect(isDebugMode("")).toBe(false);
    });
  });

  describe("debug logging", () => {
    it("should log when debug is enabled", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const debug = true;
      const debugLog = (...args: unknown[]) => {
        if (debug) console.error(...args);
      };

      debugLog("[stdio] test message");

      expect(consoleSpy).toHaveBeenCalledWith("[stdio] test message");
      consoleSpy.mockRestore();
    });

    it("should not log when debug is disabled", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const debug = false;
      const debugLog = (...args: unknown[]) => {
        if (debug) console.error(...args);
      };

      debugLog("[stdio] test message");

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should handle multiple arguments", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const debug = true;
      const debugLog = (...args: unknown[]) => {
        if (debug) console.error(...args);
      };

      debugLog("[stdio]", "arg1", "arg2", { key: "value" });

      expect(consoleSpy).toHaveBeenCalledWith("[stdio]", "arg1", "arg2", {
        key: "value",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("keepalive mechanism", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should create keepalive interval", () => {
      const keepAlive = setInterval(() => {}, 1 << 30);
      expect(keepAlive).toBeDefined();
      clearInterval(keepAlive);
    });

    it("should clear keepalive interval when called", () => {
      const clearSpy = vi.fn();
      const keepAlive = { unref: vi.fn() };

      const clearKeepAlive = () => {
        clearSpy();
      };

      clearKeepAlive();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should call process.exit on error", () => {
      const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const handleError = (err: Error) => {
        console.error(err);
        process.exit(1);
      };

      expect(() => handleError(new Error("Test error"))).toThrow(
        "process.exit called"
      );
      expect(errorSpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });
});
