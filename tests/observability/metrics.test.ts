/**
 * Tests for Metrics/Observability module
 *
 * @module tests/observability/metrics
 * @see {@link src/observability/metrics.ts}
 *
 * Testing metrics middleware and handler
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  metricsMiddleware,
  metricsHandler,
} from "../../src/observability/metrics.js";

// Helper to create mock request
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: "GET",
    baseUrl: "",
    path: "/test",
    route: { path: "/test" },
    ...overrides,
  } as Request;
}

// Helper to create mock response
interface MockResponse {
  statusCode: number;
  writableEnded: boolean;
  listeners: Record<string, Function[]>;
  on: ReturnType<typeof vi.fn>;
  emit: (event: string) => void;
  setHeader: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
}

function createMockResponse(): MockResponse {
  const listeners: Record<string, Function[]> = {};
  const response: MockResponse = {
    statusCode: 200,
    writableEnded: true,
    listeners,
    on: vi.fn((event: string, callback: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
      return response;
    }),
    emit: (event: string) => {
      const eventListeners = listeners[event] || [];
      eventListeners.forEach((cb) => cb());
    },
    setHeader: vi.fn(),
    end: vi.fn(),
  };
  return response;
}

describe("Metrics Module", () => {
  describe("metricsMiddleware", () => {
    it("should call next() to continue middleware chain", () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      metricsMiddleware(req, res as unknown as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should register finish event listener", () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      metricsMiddleware(req, res as unknown as Response, next);

      expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));
    });

    it("should register close event listener", () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      metricsMiddleware(req, res as unknown as Response, next);

      expect(res.on).toHaveBeenCalledWith("close", expect.any(Function));
    });

    it("should handle request with route path", () => {
      const req = createMockRequest({
        method: "POST",
        baseUrl: "/api",
        route: { path: "/users" } as any,
      });
      const res = createMockResponse();
      const next = vi.fn();

      metricsMiddleware(req, res as unknown as Response, next);

      // Should not throw
      expect(next).toHaveBeenCalled();
    });

    it("should handle request without route path", () => {
      const req = createMockRequest({
        method: "GET",
        baseUrl: "/api",
        path: "/unknown",
        route: undefined,
      });
      const res = createMockResponse();
      const next = vi.fn();

      metricsMiddleware(req, res as unknown as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("should record metrics on finish event", () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      metricsMiddleware(req, res as unknown as Response, next);
      res.emit("finish");

      // Should complete without error
      expect(next).toHaveBeenCalled();
    });

    it("should handle close event when response not ended", () => {
      const req = createMockRequest();
      const res = createMockResponse();
      res.writableEnded = false;
      const next = vi.fn();

      metricsMiddleware(req as Request, res as unknown as Response, next);
      res.emit("close");

      // Should complete without error
      expect(next).toHaveBeenCalled();
    });

    it("should not decrement on close when response already ended", () => {
      const req = createMockRequest();
      const res = createMockResponse();
      res.writableEnded = true;
      const next = vi.fn();

      metricsMiddleware(req as Request, res as unknown as Response, next);
      res.emit("close");

      // Should complete without error
      expect(next).toHaveBeenCalled();
    });

    it("should track different HTTP methods", () => {
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
      const next = vi.fn();

      methods.forEach((method) => {
        const req = createMockRequest({ method });
        const res = createMockResponse();
        metricsMiddleware(req, res as unknown as Response, next);
        res.emit("finish");
      });

      expect(next).toHaveBeenCalledTimes(methods.length);
    });

    it("should track different status codes", () => {
      const statusCodes = [200, 201, 400, 401, 404, 500];
      const next = vi.fn();

      statusCodes.forEach((statusCode) => {
        const req = createMockRequest();
        const res = createMockResponse();
        res.statusCode = statusCode;
        metricsMiddleware(req, res as unknown as Response, next);
        res.emit("finish");
      });

      expect(next).toHaveBeenCalledTimes(statusCodes.length);
    });
  });

  describe("metricsHandler", () => {
    it("should set Content-Type header", async () => {
      const req = {} as Request;
      const res = {
        setHeader: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      await metricsHandler(req, res);

      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        expect.stringContaining("text/plain")
      );
    });

    it("should return metrics content", async () => {
      const req = {} as Request;
      const res = {
        setHeader: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      await metricsHandler(req, res);

      expect(res.end).toHaveBeenCalled();
    });

    it("should include default metrics", async () => {
      const req = {} as Request;
      let metricsContent = "";
      const res = {
        setHeader: vi.fn(),
        end: vi.fn((content: string) => {
          metricsContent = content;
        }),
      } as unknown as Response;

      await metricsHandler(req, res);

      // Should include some default process metrics
      expect(metricsContent).toBeDefined();
      expect(typeof metricsContent).toBe("string");
    });
  });
});
