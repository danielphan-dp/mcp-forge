import express, { type NextFunction, type Request, type Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { createMcpServer } from "../mcp_server/index.js";
import { config, type LogLevel } from "../config/index.js";
import { InMemoryEventStore } from "./event_store.js";
import { SessionStore, type SessionEntry } from "./session_store.js";
import { metricsHandler, metricsMiddleware } from "../observability/metrics.js";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < LOG_LEVELS[config.logLevel]) return;
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

function setCorsHeaders(res: Response, origin: string | null) {
  if (!config.enableCors) return;
  if (config.allowAllOrigins) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "content-type,authorization,x-api-key,x-request-id,mcp-session-id,mcp-protocol-version"
  );
  res.setHeader("Access-Control-Max-Age", "600");
}

function originGuard(req: Request, res: Response, next: NextFunction) {
  const origin = req.get("origin");
  if (req.method === "OPTIONS") {
    if (origin) {
      const allowed =
        config.allowAllOrigins ||
        config.allowedOriginsNormalized.includes(origin.toLowerCase());
      if (!allowed) {
        res.status(403).json({ error: "Origin not allowed" });
        return;
      }
      setCorsHeaders(res, origin);
    }
    res.sendStatus(204);
    return;
  }

  if (!origin) {
    next();
    return;
  }

  const normalizedOrigin = origin.toLowerCase();
  const allowed =
    config.allowAllOrigins ||
    config.allowedOriginsNormalized.includes(normalizedOrigin);
  if (!allowed) {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }

  setCorsHeaders(res, origin);
  next();
}

function apiKeyGuard(req: Request, res: Response, next: NextFunction) {
  if (!config.apiKey) {
    next();
    return;
  }

  if (req.method === "OPTIONS") {
    next();
    return;
  }

  const header = req.get("authorization");
  const bearer = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : undefined;
  const apiKeyHeader = req.get("x-api-key");

  if (bearer === config.apiKey || apiKeyHeader === config.apiKey) {
    next();
    return;
  }

  res.setHeader("WWW-Authenticate", "Bearer");
  res.status(401).json({ error: "Unauthorized" });
}

function metricsApiKeyGuard(req: Request, res: Response, next: NextFunction) {
  if (!config.metricsApiKey) {
    next();
    return;
  }

  const header = req.get("authorization");
  const bearer = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : undefined;
  const apiKeyHeader = req.get("x-api-key");

  if (bearer === config.metricsApiKey || apiKeyHeader === config.metricsApiKey) {
    next();
    return;
  }

  res.setHeader("WWW-Authenticate", "Bearer");
  res.status(401).json({ error: "Unauthorized" });
}

const supportedProtocolVersions = new Set(
  config.protocolVersions.map((version) => version.trim()).filter(Boolean)
);
const defaultProtocolVersion = supportedProtocolVersions.has("2025-03-26")
  ? "2025-03-26"
  : config.protocolVersions[0];

function protocolVersionGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.get("mcp-protocol-version");
  if (!header) {
    if (config.requireProtocolVersionHeader) {
      res.status(400).json({ error: "Missing MCP-Protocol-Version" });
      return;
    }
    if (defaultProtocolVersion) {
      res.setHeader("mcp-protocol-version", defaultProtocolVersion);
    }
    next();
    return;
  }

  if (!supportedProtocolVersions.has(header)) {
    res.status(400).json({ error: "Unsupported MCP-Protocol-Version" });
    return;
  }

  res.setHeader("mcp-protocol-version", header);
  next();
}

const rateLimitState = new Map<string, { count: number; resetAt: number }>();
let rateLimitSweepTimer: NodeJS.Timeout | undefined;

function startRateLimitSweep() {
  if (!config.rateLimit || rateLimitSweepTimer) return;
  const sweepInterval = Math.max(config.rateLimit.windowMs, 1000);
  rateLimitSweepTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitState.entries()) {
      if (entry.resetAt <= now) {
        rateLimitState.delete(key);
      }
    }
  }, sweepInterval);
  rateLimitSweepTimer.unref();
}

function rateLimitGuard(req: Request, res: Response, next: NextFunction) {
  if (!config.rateLimit) {
    next();
    return;
  }

  if (req.method === "OPTIONS") {
    next();
    return;
  }

  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = config.rateLimit.windowMs;
  const max = config.rateLimit.max;
  const entry = rateLimitState.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitState.set(key, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (entry.count >= max) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", retryAfterSeconds.toString());
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  entry.count += 1;
  next();
}

function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", config.trustProxy);

app.use(securityHeaders);
app.use((req, res, next) => {
  const requestId = req.get("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", requestId);

  const start = performance.now();
  res.on("finish", () => {
    const durationMs = Math.round((performance.now() - start) * 1000) / 1000;
    log("info", "request.completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
    });
  });

  res.on("close", () => {
    if (!res.writableEnded) {
      log("warn", "request.aborted", {
        requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
      });
    }
  });

  next();
});

if (config.metricsEnabled) {
  app.use(metricsMiddleware);
}

app.use(
  express.json({
    limit: config.requestBodyLimit,
    type: ["application/json", "application/*+json"],
  })
);

let ready = false;
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/readyz", (_req, res) => {
  if (!ready) {
    res.status(503).json({ status: "starting" });
    return;
  }
  res.status(200).json({ status: "ready" });
});

if (config.metricsEnabled) {
  app.get(config.metricsPath, metricsApiKeyGuard, metricsHandler);
}

const eventStore =
  config.eventStore === "memory"
    ? new InMemoryEventStore({
        maxEvents: config.eventStoreMaxEvents,
        ttlMs: config.eventStoreTtlMs,
        sweepIntervalMs: config.eventStoreSweepIntervalMs,
      })
    : undefined;

async function disposeSession(entry: SessionEntry, reason: string) {
  log("info", "session.closed", { sessionId: entry.sessionId, reason });
  try {
    await entry.transport.close();
  } catch (error) {
    log("warn", "session.transport.close.failed", {
      sessionId: entry.sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  try {
    await entry.server.close();
  } catch (error) {
    log("warn", "session.server.close.failed", {
      sessionId: entry.sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const sessionStore =
  config.sessionMode === "stateful"
    ? new SessionStore({
        ttlMs: config.sessionTtlMs,
        maxSessions: config.maxSessions,
        sweepIntervalMs: config.sessionSweepIntervalMs,
        onEvict: disposeSession,
      })
    : null;

const createTransport = (onInitialized?: (sessionId: string) => void) =>
  new StreamableHTTPServerTransport({
    sessionIdGenerator:
      config.sessionMode === "stateful" ? () => randomUUID() : undefined,
    enableJsonResponse: config.enableJsonResponse,
    retryInterval: config.retryIntervalMs > 0 ? config.retryIntervalMs : undefined,
    eventStore,
    onsessioninitialized: onInitialized,
    onsessionclosed: async (sessionId) => {
      if (sessionStore) {
        sessionStore.delete(sessionId, "client_delete");
      }
    },
    enableDnsRebindingProtection: config.enableDnsRebindingProtection,
    allowedHosts: config.allowedHosts.length ? config.allowedHosts : undefined,
    allowedOrigins: config.allowedOrigins.length ? config.allowedOrigins : undefined,
  });

const mcpRouter = express.Router();
mcpRouter.use(originGuard);
mcpRouter.use(rateLimitGuard);
mcpRouter.use(apiKeyGuard);
mcpRouter.use(protocolVersionGuard);

function jsonRpcError(res: Response, message: string, code = -32000) {
  res.status(400).json({
    jsonrpc: "2.0",
    error: { code, message },
    id: null,
  });
}

async function handleStatefulPost(req: Request, res: Response) {
  const sessionId = req.get("mcp-session-id")?.trim();
  if (sessionId) {
    const entry = sessionStore?.get(sessionId);
    if (!entry) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    await entry.transport.handleRequest(req, res, req.body);
    return;
  }

  if (!isInitializeRequest(req.body)) {
    jsonRpcError(res, "Bad Request: No valid session ID provided");
    return;
  }

  if (!sessionStore?.hasCapacity()) {
    res.status(503).json({ error: "Server is at session capacity" });
    return;
  }

  const server = createMcpServer();
  const now = Date.now();
  const entry: SessionEntry = {
    sessionId: "",
    server,
    transport: createTransport((newSessionId) => {
      entry.sessionId = newSessionId;
      entry.lastSeenAt = Date.now();
      if (!sessionStore?.set(entry)) {
        log("error", "session.store.full", { sessionId: newSessionId });
        void disposeSession(entry, "capacity");
      }
    }),
    createdAt: now,
    lastSeenAt: now,
  };

  entry.transport.onclose = () => {
    if (entry.sessionId) {
      sessionStore?.delete(entry.sessionId, "transport_closed");
    }
  };

  entry.transport.onerror = (error) => {
    log("error", "mcp.transport.error", {
      sessionId: entry.sessionId,
      error: error.message,
    });
  };

  try {
    await server.connect(entry.transport);
    await entry.transport.handleRequest(req, res, req.body);
  } catch (error) {
    log("error", "mcp.request.error", {
      error: error instanceof Error ? error.message : "unknown",
    });

    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

async function handleStatefulGet(req: Request, res: Response) {
  const sessionId = req.get("mcp-session-id")?.trim();
  if (!sessionId) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  const entry = sessionStore?.get(sessionId);
  if (!entry) {
    res.status(404).send("Invalid or missing session ID");
    return;
  }
  await entry.transport.handleRequest(req, res);
}

async function handleStatefulDelete(req: Request, res: Response) {
  const sessionId = req.get("mcp-session-id")?.trim();
  if (!sessionId) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  const entry = sessionStore?.get(sessionId);
  if (!entry) {
    res.status(404).send("Invalid or missing session ID");
    return;
  }
  await entry.transport.handleRequest(req, res);
}

async function handleStatelessPost(req: Request, res: Response) {
  const server = createMcpServer();
  const transport = createTransport();
  transport.onerror = (error) => {
    log("error", "mcp.transport.error", {
      error: error.message,
    });
  };

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    log("error", "mcp.request.error", {
      error: error instanceof Error ? error.message : "unknown",
    });

    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  } finally {
    try {
      await transport.close();
    } catch {
      // Ignore close errors for stateless transports.
    }
    try {
      await server.close();
    } catch {
      // Ignore close errors for stateless servers.
    }
  }
}

mcpRouter.post("/", async (req, res) => {
  if (config.sessionMode === "stateless") {
    await handleStatelessPost(req, res);
  } else {
    await handleStatefulPost(req, res);
  }
});

mcpRouter.get("/", async (req, res) => {
  if (config.sessionMode === "stateless") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.sendStatus(405);
    return;
  }
  await handleStatefulGet(req, res);
});

mcpRouter.delete("/", async (req, res) => {
  if (config.sessionMode === "stateless") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.sendStatus(405);
    return;
  }
  await handleStatefulDelete(req, res);
});

app.use("/mcp", mcpRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;

  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  if (err && typeof err === "object" && "status" in err) {
    const status = Number((err as { status?: number }).status ?? 500);
    if (status === 413) {
      res.status(413).json({ error: "Payload too large" });
      return;
    }
  }

  log("error", "request.error", {
    error: err instanceof Error ? err.message : "unknown",
  });

  res.status(500).json({ error: "Internal server error" });
});

startRateLimitSweep();

const server = app.listen(config.port, config.host, () => {
  ready = true;
  log("info", "server.started", {
    host: config.host,
    port: config.port,
    environment: config.environment,
  });
});

const shutdownSignals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

const shutdown = async (signal: NodeJS.Signals) => {
  log("warn", "server.shutdown", { signal });
  ready = false;

  const timeout = setTimeout(() => {
    log("error", "server.shutdown.timeout", {
      timeoutMs: config.shutdownTimeoutMs,
    });
    process.exit(1);
  }, config.shutdownTimeoutMs);
  timeout.unref();

  try {
    if (sessionStore) {
      await sessionStore.closeAll("shutdown");
    }
    eventStore?.stop();
    if (rateLimitSweepTimer) {
      clearInterval(rateLimitSweepTimer);
      rateLimitSweepTimer = undefined;
    }

    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    log("info", "server.shutdown.complete");
    process.exit(0);
  } catch (error) {
    log("error", "server.shutdown.error", {
      error: error instanceof Error ? error.message : "unknown",
    });
    process.exit(1);
  }
};

shutdownSignals.forEach((signal) => {
  process.on(signal, () => {
    void shutdown(signal);
  });
});

process.on("unhandledRejection", (reason) => {
  log("error", "process.unhandledRejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

process.on("uncaughtException", (err) => {
  log("error", "process.uncaughtException", { error: err.message });
  process.exit(1);
});
