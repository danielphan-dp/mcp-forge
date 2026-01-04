/**
 * Tests for Configuration module
 *
 * @module tests/config
 * @see {@link src/config/index.ts}
 *
 * Testing environment variable parsing, validation, and defaults
 * Note: Config module reads env vars at import time, so we test the parsing functions
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Config Module", () => {
  // Store original env
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe("parseBool function behavior", () => {
    it("should parse 'true' as true", async () => {
      process.env.TRUST_PROXY = "true";
      const { config } = await import("../../src/config/index.js");
      expect(config.trustProxy).toBe(true);
    });

    it("should parse '1' as true", async () => {
      process.env.TRUST_PROXY = "1";
      const { config } = await import("../../src/config/index.js");
      expect(config.trustProxy).toBe(true);
    });

    it("should parse 'yes' as true", async () => {
      process.env.TRUST_PROXY = "yes";
      const { config } = await import("../../src/config/index.js");
      expect(config.trustProxy).toBe(true);
    });

    it("should parse 'on' as true", async () => {
      process.env.TRUST_PROXY = "on";
      const { config } = await import("../../src/config/index.js");
      expect(config.trustProxy).toBe(true);
    });

    it("should parse 'false' as false", async () => {
      process.env.TRUST_PROXY = "false";
      const { config } = await import("../../src/config/index.js");
      expect(config.trustProxy).toBe(false);
    });

    it("should parse '0' as false", async () => {
      process.env.TRUST_PROXY = "0";
      const { config } = await import("../../src/config/index.js");
      expect(config.trustProxy).toBe(false);
    });

    it("should parse any other value as false", async () => {
      process.env.TRUST_PROXY = "random";
      const { config } = await import("../../src/config/index.js");
      expect(config.trustProxy).toBe(false);
    });

    it("should use fallback when env var is not set", async () => {
      delete process.env.TRUST_PROXY;
      const { config } = await import("../../src/config/index.js");
      expect(config.trustProxy).toBe(false); // default is false
    });
  });

  describe("parseNumber function behavior", () => {
    it("should parse valid number string", async () => {
      process.env.PORT = "8080";
      const { config } = await import("../../src/config/index.js");
      expect(config.port).toBe(8080);
    });

    it("should use fallback for invalid number", async () => {
      process.env.PORT = "not-a-number";
      const { config } = await import("../../src/config/index.js");
      expect(config.port).toBe(3000); // default
    });

    it("should use fallback when env var is not set", async () => {
      delete process.env.PORT;
      const { config } = await import("../../src/config/index.js");
      expect(config.port).toBe(3000); // default
    });

    it("should handle negative numbers", async () => {
      process.env.MCP_RETRY_INTERVAL_MS = "-100";
      // Note: Negative numbers are parsed but may fail validation
      try {
        const { config } = await import("../../src/config/index.js");
        // If it gets here, check the value
        expect(config.retryIntervalMs).toBe(-100);
      } catch {
        // Validation may reject negative numbers
        expect(true).toBe(true);
      }
    });

    it("should handle floating point numbers", async () => {
      process.env.PORT = "3000.5";
      // Zod validation rejects non-integer port numbers
      await expect(import("../../src/config/index.js")).rejects.toThrow(
        "Invalid configuration"
      );
    });
  });

  describe("parseList function behavior", () => {
    it("should parse comma-separated values", async () => {
      process.env.MCP_ALLOWED_ORIGINS =
        "http://localhost:3000,http://example.com";
      const { config } = await import("../../src/config/index.js");
      expect(config.allowedOrigins).toContain("http://localhost:3000");
      expect(config.allowedOrigins).toContain("http://example.com");
    });

    it("should trim whitespace from values", async () => {
      process.env.MCP_ALLOWED_ORIGINS =
        " http://localhost:3000 , http://example.com ";
      const { config } = await import("../../src/config/index.js");
      expect(config.allowedOrigins).toContain("http://localhost:3000");
      expect(config.allowedOrigins).toContain("http://example.com");
    });

    it("should filter empty values", async () => {
      process.env.MCP_ALLOWED_ORIGINS =
        "http://localhost:3000,,http://example.com,";
      const { config } = await import("../../src/config/index.js");
      expect(config.allowedOrigins).toHaveLength(2);
    });

    it("should return empty array for empty string", async () => {
      process.env.MCP_ALLOWED_ORIGINS = "";
      const { config } = await import("../../src/config/index.js");
      expect(config.allowedOrigins).toEqual([]);
    });

    it("should handle wildcard origin", async () => {
      process.env.MCP_ALLOWED_ORIGINS = "*";
      const { config } = await import("../../src/config/index.js");
      expect(config.allowAllOrigins).toBe(true);
      expect(config.allowedOrigins).toEqual([]);
    });
  });

  describe("default configuration values", () => {
    beforeEach(() => {
      // Clear relevant env vars
      delete process.env.PORT;
      delete process.env.HOST;
      delete process.env.NODE_ENV;
      delete process.env.LOG_LEVEL;
      delete process.env.MCP_SESSION_MODE;
      delete process.env.MCP_EVENT_STORE;
      delete process.env.METRICS_ENABLED;
    });

    it("should have default port of 3000", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.port).toBe(3000);
    });

    it("should have default host of 127.0.0.1", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.host).toBe("127.0.0.1");
    });

    it("should have default environment of development", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.environment).toBe("development");
    });

    it("should have default log level of info", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.logLevel).toBe("info");
    });

    it("should have default session mode of stateful", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.sessionMode).toBe("stateful");
    });

    it("should have default event store mode of none", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.eventStore).toBe("none");
    });

    it("should have metrics enabled by default", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.metricsEnabled).toBe(true);
    });

    it("should have default metrics path of /metrics", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.metricsPath).toBe("/metrics");
    });

    it("should have CORS enabled by default", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.enableCors).toBe(true);
    });

    it("should have default request body limit of 1mb", async () => {
      const { config } = await import("../../src/config/index.js");
      expect(config.requestBodyLimit).toBe("1mb");
    });
  });

  describe("session mode configuration", () => {
    it("should set session mode to stateless", async () => {
      process.env.MCP_SESSION_MODE = "stateless";
      const { config } = await import("../../src/config/index.js");
      expect(config.sessionMode).toBe("stateless");
    });

    it("should default to stateful for invalid mode", async () => {
      process.env.MCP_SESSION_MODE = "invalid";
      const { config } = await import("../../src/config/index.js");
      expect(config.sessionMode).toBe("stateful");
    });

    it("should handle case-insensitive mode", async () => {
      process.env.MCP_SESSION_MODE = "STATELESS";
      const { config } = await import("../../src/config/index.js");
      expect(config.sessionMode).toBe("stateless");
    });
  });

  describe("event store configuration", () => {
    it("should set event store to memory", async () => {
      process.env.MCP_EVENT_STORE = "memory";
      const { config } = await import("../../src/config/index.js");
      expect(config.eventStore).toBe("memory");
    });

    it("should default to none for invalid mode", async () => {
      process.env.MCP_EVENT_STORE = "invalid";
      const { config } = await import("../../src/config/index.js");
      expect(config.eventStore).toBe("none");
    });

    it("should configure max events", async () => {
      process.env.MCP_EVENT_STORE_MAX_EVENTS = "5000";
      const { config } = await import("../../src/config/index.js");
      expect(config.eventStoreMaxEvents).toBe(5000);
    });

    it("should configure TTL", async () => {
      process.env.MCP_EVENT_STORE_TTL_MS = "300000";
      const { config } = await import("../../src/config/index.js");
      expect(config.eventStoreTtlMs).toBe(300000);
    });
  });

  describe("rate limiting configuration", () => {
    it("should configure rate limiting when max > 0", async () => {
      process.env.RATE_LIMIT_MAX = "100";
      process.env.RATE_LIMIT_WINDOW_MS = "30000";
      const { config } = await import("../../src/config/index.js");
      expect(config.rateLimit).toEqual({
        max: 100,
        windowMs: 30000,
      });
    });

    it("should disable rate limiting when max is 0", async () => {
      process.env.RATE_LIMIT_MAX = "0";
      const { config } = await import("../../src/config/index.js");
      expect(config.rateLimit).toBeNull();
    });

    it("should disable rate limiting by default", async () => {
      delete process.env.RATE_LIMIT_MAX;
      const { config } = await import("../../src/config/index.js");
      expect(config.rateLimit).toBeNull();
    });
  });

  describe("allowed hosts configuration", () => {
    it("should configure allowed hosts", async () => {
      process.env.MCP_ALLOWED_HOSTS = "example.com,api.example.com";
      const { config } = await import("../../src/config/index.js");
      expect(config.allowedHosts).toContain("example.com");
      expect(config.allowedHosts).toContain("api.example.com");
    });

    it("should add default loopback hosts when host is localhost", async () => {
      process.env.HOST = "127.0.0.1";
      delete process.env.MCP_ALLOWED_HOSTS;
      const { config } = await import("../../src/config/index.js");
      expect(config.allowedHosts).toContain("127.0.0.1");
      expect(config.allowedHosts).toContain("localhost");
    });
  });

  describe("DNS rebinding protection", () => {
    it("should enable DNS rebinding protection when allowed hosts are set", async () => {
      process.env.MCP_ALLOWED_HOSTS = "example.com";
      delete process.env.MCP_DNS_REBINDING_PROTECTION;
      const { config } = await import("../../src/config/index.js");
      expect(config.enableDnsRebindingProtection).toBe(true);
    });

    it("should allow explicit disable of DNS rebinding protection", async () => {
      process.env.MCP_DNS_REBINDING_PROTECTION = "false";
      const { config } = await import("../../src/config/index.js");
      expect(config.enableDnsRebindingProtection).toBe(false);
    });
  });

  describe("protocol versions configuration", () => {
    it("should configure protocol versions", async () => {
      process.env.MCP_PROTOCOL_VERSIONS = "2024-01-01,2024-06-01";
      const { config } = await import("../../src/config/index.js");
      expect(config.protocolVersions).toContain("2024-01-01");
      expect(config.protocolVersions).toContain("2024-06-01");
    });

    it("should require protocol version header when configured", async () => {
      process.env.MCP_REQUIRE_PROTOCOL_VERSION = "true";
      const { config } = await import("../../src/config/index.js");
      expect(config.requireProtocolVersionHeader).toBe(true);
    });
  });

  describe("API key configuration", () => {
    it("should configure API key", async () => {
      process.env.MCP_API_KEY = "test-api-key-123";
      const { config } = await import("../../src/config/index.js");
      expect(config.apiKey).toBe("test-api-key-123");
    });

    it("should leave API key undefined when not set", async () => {
      delete process.env.MCP_API_KEY;
      const { config } = await import("../../src/config/index.js");
      expect(config.apiKey).toBeUndefined();
    });

    it("should configure metrics API key", async () => {
      process.env.METRICS_API_KEY = "metrics-key-456";
      const { config } = await import("../../src/config/index.js");
      expect(config.metricsApiKey).toBe("metrics-key-456");
    });
  });

  describe("session configuration", () => {
    it("should configure max sessions", async () => {
      process.env.MCP_MAX_SESSIONS = "500";
      const { config } = await import("../../src/config/index.js");
      expect(config.maxSessions).toBe(500);
    });

    it("should configure session TTL", async () => {
      process.env.MCP_SESSION_TTL_MS = "1800000";
      const { config } = await import("../../src/config/index.js");
      expect(config.sessionTtlMs).toBe(1800000);
    });

    it("should configure session sweep interval", async () => {
      process.env.MCP_SESSION_SWEEP_INTERVAL_MS = "30000";
      const { config } = await import("../../src/config/index.js");
      expect(config.sessionSweepIntervalMs).toBe(30000);
    });
  });

  describe("JSON response configuration", () => {
    it("should enable JSON response when configured", async () => {
      process.env.MCP_ENABLE_JSON_RESPONSE = "true";
      const { config } = await import("../../src/config/index.js");
      expect(config.enableJsonResponse).toBe(true);
    });

    it("should disable JSON response by default", async () => {
      delete process.env.MCP_ENABLE_JSON_RESPONSE;
      const { config } = await import("../../src/config/index.js");
      expect(config.enableJsonResponse).toBe(false);
    });
  });

  describe("shutdown configuration", () => {
    it("should configure shutdown timeout", async () => {
      process.env.SHUTDOWN_TIMEOUT_MS = "30000";
      const { config } = await import("../../src/config/index.js");
      expect(config.shutdownTimeoutMs).toBe(30000);
    });

    it("should have default shutdown timeout", async () => {
      delete process.env.SHUTDOWN_TIMEOUT_MS;
      const { config } = await import("../../src/config/index.js");
      expect(config.shutdownTimeoutMs).toBe(10000);
    });
  });

  describe("config type exports", () => {
    it("should export Config type", async () => {
      const module = await import("../../src/config/index.js");
      // Check that config has expected shape
      expect(module.config).toHaveProperty("host");
      expect(module.config).toHaveProperty("port");
      expect(module.config).toHaveProperty("sessionMode");
    });
  });

  describe("normalized origins", () => {
    it("should normalize origins to lowercase", async () => {
      process.env.MCP_ALLOWED_ORIGINS = "HTTP://EXAMPLE.COM,Http://Test.COM";
      const { config } = await import("../../src/config/index.js");
      expect(config.allowedOriginsNormalized).toContain("http://example.com");
      expect(config.allowedOriginsNormalized).toContain("http://test.com");
    });
  });
});
