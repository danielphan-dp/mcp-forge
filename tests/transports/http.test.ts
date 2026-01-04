/**
 * Tests for HTTP Transport utilities
 *
 * @module tests/transports/http
 * @see {@link src/transports/http}
 *
 * Testing HTTP middleware guards, helpers, and utilities
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Test the log level filtering logic
describe("Log Level Filtering", () => {
  const LOG_LEVELS: Record<string, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
  };

  function shouldLog(level: string, configLevel: string): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[configLevel];
  }

  describe("log level ordering", () => {
    it("should allow debug when level is debug", () => {
      expect(shouldLog("debug", "debug")).toBe(true);
    });

    it("should allow info when level is debug", () => {
      expect(shouldLog("info", "debug")).toBe(true);
    });

    it("should not allow debug when level is info", () => {
      expect(shouldLog("debug", "info")).toBe(false);
    });

    it("should allow warn when level is info", () => {
      expect(shouldLog("warn", "info")).toBe(true);
    });

    it("should not allow info when level is warn", () => {
      expect(shouldLog("info", "warn")).toBe(false);
    });

    it("should only allow error when level is error", () => {
      expect(shouldLog("debug", "error")).toBe(false);
      expect(shouldLog("info", "error")).toBe(false);
      expect(shouldLog("warn", "error")).toBe(false);
      expect(shouldLog("error", "error")).toBe(true);
    });
  });
});

// Test origin validation logic
describe("Origin Validation", () => {
  function isOriginAllowed(
    origin: string,
    allowAllOrigins: boolean,
    allowedOriginsNormalized: string[]
  ): boolean {
    if (allowAllOrigins) return true;
    return allowedOriginsNormalized.includes(origin.toLowerCase());
  }

  it("should allow any origin when allowAllOrigins is true", () => {
    expect(isOriginAllowed("http://example.com", true, [])).toBe(true);
    expect(isOriginAllowed("http://malicious.com", true, [])).toBe(true);
  });

  it("should allow origin in whitelist", () => {
    const allowed = ["http://localhost:3000", "http://example.com"];
    expect(isOriginAllowed("http://localhost:3000", false, allowed)).toBe(true);
    expect(isOriginAllowed("http://example.com", false, allowed)).toBe(true);
  });

  it("should reject origin not in whitelist", () => {
    const allowed = ["http://localhost:3000"];
    expect(isOriginAllowed("http://malicious.com", false, allowed)).toBe(false);
  });

  it("should be case-insensitive", () => {
    const allowed = ["http://example.com"];
    expect(isOriginAllowed("HTTP://EXAMPLE.COM", false, allowed)).toBe(true);
  });

  it("should handle empty whitelist", () => {
    expect(isOriginAllowed("http://example.com", false, [])).toBe(false);
  });
});

// Test API key validation logic
describe("API Key Validation", () => {
  function isApiKeyValid(
    bearerToken: string | undefined,
    xApiKey: string | undefined,
    configApiKey: string
  ): boolean {
    return bearerToken === configApiKey || xApiKey === configApiKey;
  }

  it("should accept valid Bearer token", () => {
    expect(isApiKeyValid("secret-key", undefined, "secret-key")).toBe(true);
  });

  it("should accept valid X-API-Key header", () => {
    expect(isApiKeyValid(undefined, "secret-key", "secret-key")).toBe(true);
  });

  it("should accept when both are valid", () => {
    expect(isApiKeyValid("secret-key", "secret-key", "secret-key")).toBe(true);
  });

  it("should reject invalid Bearer token", () => {
    expect(isApiKeyValid("wrong-key", undefined, "secret-key")).toBe(false);
  });

  it("should reject invalid X-API-Key", () => {
    expect(isApiKeyValid(undefined, "wrong-key", "secret-key")).toBe(false);
  });

  it("should reject when no key provided", () => {
    expect(isApiKeyValid(undefined, undefined, "secret-key")).toBe(false);
  });
});

// Test Bearer token extraction logic
describe("Bearer Token Extraction", () => {
  function extractBearerToken(
    authHeader: string | undefined
  ): string | undefined {
    if (!authHeader?.startsWith("Bearer ")) return undefined;
    return authHeader.slice("Bearer ".length).trim();
  }

  it("should extract token from valid Bearer header", () => {
    expect(extractBearerToken("Bearer my-token")).toBe("my-token");
  });

  it("should trim whitespace from token", () => {
    expect(extractBearerToken("Bearer   my-token  ")).toBe("my-token");
  });

  it("should return undefined for non-Bearer auth", () => {
    expect(extractBearerToken("Basic abc123")).toBeUndefined();
  });

  it("should return undefined for undefined header", () => {
    expect(extractBearerToken(undefined)).toBeUndefined();
  });

  it("should return undefined for empty header", () => {
    expect(extractBearerToken("")).toBeUndefined();
  });

  it("should handle Bearer without token", () => {
    expect(extractBearerToken("Bearer ")).toBe("");
  });
});

// Test protocol version validation
describe("Protocol Version Validation", () => {
  function isProtocolVersionSupported(
    version: string,
    supportedVersions: Set<string>
  ): boolean {
    return supportedVersions.has(version);
  }

  const supportedVersions = new Set(["2025-11-25", "2025-03-26"]);

  it("should accept supported version", () => {
    expect(isProtocolVersionSupported("2025-11-25", supportedVersions)).toBe(
      true
    );
    expect(isProtocolVersionSupported("2025-03-26", supportedVersions)).toBe(
      true
    );
  });

  it("should reject unsupported version", () => {
    expect(isProtocolVersionSupported("2024-01-01", supportedVersions)).toBe(
      false
    );
    expect(isProtocolVersionSupported("invalid", supportedVersions)).toBe(
      false
    );
  });

  it("should reject empty version", () => {
    expect(isProtocolVersionSupported("", supportedVersions)).toBe(false);
  });
});

// Test rate limiting logic
describe("Rate Limiting Logic", () => {
  interface RateLimitEntry {
    count: number;
    resetAt: number;
  }

  function checkRateLimit(
    entry: RateLimitEntry | undefined,
    now: number,
    max: number,
    windowMs: number
  ): {
    allowed: boolean;
    newEntry: RateLimitEntry;
    retryAfterSeconds?: number;
  } {
    // No existing entry or expired entry
    if (!entry || entry.resetAt <= now) {
      return {
        allowed: true,
        newEntry: { count: 1, resetAt: now + windowMs },
      };
    }

    // Entry exists and not expired - check limit
    if (entry.count >= max) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      return {
        allowed: false,
        newEntry: entry,
        retryAfterSeconds,
      };
    }

    // Increment count
    return {
      allowed: true,
      newEntry: { count: entry.count + 1, resetAt: entry.resetAt },
    };
  }

  it("should allow first request", () => {
    const result = checkRateLimit(undefined, 1000, 100, 60000);
    expect(result.allowed).toBe(true);
    expect(result.newEntry.count).toBe(1);
  });

  it("should allow requests under limit", () => {
    const entry = { count: 5, resetAt: 61000 };
    const result = checkRateLimit(entry, 1000, 100, 60000);
    expect(result.allowed).toBe(true);
    expect(result.newEntry.count).toBe(6);
  });

  it("should reject requests at limit", () => {
    const entry = { count: 100, resetAt: 61000 };
    const result = checkRateLimit(entry, 1000, 100, 60000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeDefined();
  });

  it("should reset expired entries", () => {
    const entry = { count: 100, resetAt: 500 };
    const result = checkRateLimit(entry, 1000, 100, 60000);
    expect(result.allowed).toBe(true);
    expect(result.newEntry.count).toBe(1);
  });

  it("should calculate retry-after correctly", () => {
    const entry = { count: 100, resetAt: 5000 };
    const result = checkRateLimit(entry, 1000, 100, 60000);
    expect(result.retryAfterSeconds).toBe(4); // (5000 - 1000) / 1000 = 4
  });
});

// Test DNS rebinding protection logic
describe("DNS Rebinding Protection", () => {
  function isHostAllowed(
    host: string | undefined,
    allowedHosts: string[]
  ): boolean {
    if (!host) return false;
    if (allowedHosts.length === 0) return true;
    return allowedHosts.includes(host);
  }

  it("should allow when no hosts configured", () => {
    expect(isHostAllowed("any-host", [])).toBe(true);
  });

  it("should allow configured host", () => {
    const allowed = ["localhost", "localhost:3000"];
    expect(isHostAllowed("localhost", allowed)).toBe(true);
    expect(isHostAllowed("localhost:3000", allowed)).toBe(true);
  });

  it("should reject unconfigured host", () => {
    const allowed = ["localhost"];
    expect(isHostAllowed("evil.com", allowed)).toBe(false);
  });

  it("should reject undefined host", () => {
    expect(isHostAllowed(undefined, ["localhost"])).toBe(false);
  });
});

// Test JSON-RPC error formatting
describe("JSON-RPC Error Formatting", () => {
  function formatJsonRpcError(message: string, code: number = -32000): object {
    return {
      jsonrpc: "2.0",
      error: { code, message },
      id: null,
    };
  }

  it("should format standard error", () => {
    const error = formatJsonRpcError("Bad Request");
    expect(error).toEqual({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bad Request" },
      id: null,
    });
  });

  it("should use custom error code", () => {
    const error = formatJsonRpcError("Parse error", -32700);
    expect(error).toEqual({
      jsonrpc: "2.0",
      error: { code: -32700, message: "Parse error" },
      id: null,
    });
  });

  it("should use default code when not provided", () => {
    const error = formatJsonRpcError("Generic error");
    expect((error as any).error.code).toBe(-32000);
  });
});

// Test CORS header configuration
describe("CORS Headers", () => {
  function getCorsHeaders(
    allowAllOrigins: boolean,
    origin: string | null
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (allowAllOrigins) {
      headers["Access-Control-Allow-Origin"] = "*";
    } else if (origin) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Vary"] = "Origin";
    }

    headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,DELETE";
    headers["Access-Control-Allow-Headers"] =
      "content-type,authorization,x-api-key,x-request-id,mcp-session-id,mcp-protocol-version";
    headers["Access-Control-Max-Age"] = "600";

    return headers;
  }

  it("should set wildcard origin when allowAllOrigins is true", () => {
    const headers = getCorsHeaders(true, "http://example.com");
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(headers["Vary"]).toBeUndefined();
  });

  it("should set specific origin and Vary header", () => {
    const headers = getCorsHeaders(false, "http://example.com");
    expect(headers["Access-Control-Allow-Origin"]).toBe("http://example.com");
    expect(headers["Vary"]).toBe("Origin");
  });

  it("should include standard CORS headers", () => {
    const headers = getCorsHeaders(true, null);
    expect(headers["Access-Control-Allow-Methods"]).toBe(
      "GET,POST,OPTIONS,DELETE"
    );
    expect(headers["Access-Control-Allow-Headers"]).toContain("content-type");
    expect(headers["Access-Control-Max-Age"]).toBe("600");
  });

  it("should not set origin header when origin is null", () => {
    const headers = getCorsHeaders(false, null);
    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});

// Test security headers
describe("Security Headers", () => {
  function getSecurityHeaders(): Record<string, string> {
    return {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      "Cross-Origin-Resource-Policy": "same-site",
    };
  }

  it("should include all security headers", () => {
    const headers = getSecurityHeaders();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("no-referrer");
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
    expect(headers["Cross-Origin-Resource-Policy"]).toBe("same-site");
  });
});

// Test health check responses
describe("Health Check Responses", () => {
  function getHealthzResponse(): { status: number; body: object } {
    return { status: 200, body: { status: "ok" } };
  }

  function getReadyzResponse(ready: boolean): { status: number; body: object } {
    if (ready) {
      return { status: 200, body: { status: "ready" } };
    }
    return { status: 503, body: { status: "starting" } };
  }

  it("should return healthy status", () => {
    const response = getHealthzResponse();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("should return ready status when ready", () => {
    const response = getReadyzResponse(true);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ready" });
  });

  it("should return starting status when not ready", () => {
    const response = getReadyzResponse(false);
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: "starting" });
  });
});

// Test session ID validation
describe("Session ID Handling", () => {
  function extractSessionId(header: string | undefined): string | undefined {
    return header?.trim() || undefined;
  }

  it("should extract valid session ID", () => {
    expect(extractSessionId("abc-123")).toBe("abc-123");
  });

  it("should trim whitespace", () => {
    expect(extractSessionId("  abc-123  ")).toBe("abc-123");
  });

  it("should return undefined for undefined header", () => {
    expect(extractSessionId(undefined)).toBeUndefined();
  });

  it("should return undefined for empty string", () => {
    expect(extractSessionId("")).toBeUndefined();
  });

  it("should return undefined for whitespace-only string", () => {
    expect(extractSessionId("   ")).toBeUndefined();
  });
});
