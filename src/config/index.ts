import { z } from "zod";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type SessionMode = "stateful" | "stateless";
export type EventStoreMode = "memory" | "none";

export type RateLimitConfig = {
  windowMs: number;
  max: number;
};

export type Config = {
  environment: string;
  host: string;
  port: number;
  requestBodyLimit: string;
  trustProxy: boolean;
  apiKey?: string;
  allowAllOrigins: boolean;
  allowedOrigins: string[];
  allowedOriginsNormalized: string[];
  allowedHosts: string[];
  enableCors: boolean;
  enableDnsRebindingProtection: boolean;
  rateLimit?: RateLimitConfig | null;
  logLevel: LogLevel;
  shutdownTimeoutMs: number;
  sessionMode: SessionMode;
  maxSessions: number;
  sessionTtlMs: number;
  sessionSweepIntervalMs: number;
  eventStore: EventStoreMode;
  eventStoreMaxEvents: number;
  eventStoreTtlMs: number;
  eventStoreSweepIntervalMs: number;
  enableJsonResponse: boolean;
  retryIntervalMs: number;
  protocolVersions: string[];
  requireProtocolVersionHeader: boolean;
  metricsEnabled: boolean;
  metricsPath: string;
  metricsApiKey?: string;
};

const truthy = new Set(["1", "true", "yes", "on"]);

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return truthy.has(value.trim().toLowerCase());
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeList(value: string[] | undefined): string[] {
  if (!value) return [];
  return value.map((entry) => entry.toLowerCase());
}

const logLevels = ["debug", "info", "warn", "error"] as const;
const sessionModes = ["stateful", "stateless"] as const;
const eventStoreModes = ["memory", "none"] as const;

const environment = process.env.NODE_ENV ?? "development";
const host = process.env.HOST ?? "127.0.0.1";
const port = parseNumber(process.env.PORT, 3000);

const loopbackHosts = ["127.0.0.1", "localhost", "[::1]"];
const isLoopback = loopbackHosts.includes(host);

const allowedOriginsRaw = process.env.MCP_ALLOWED_ORIGINS?.trim() ?? "";
const allowAllOrigins = allowedOriginsRaw === "*";
const allowedOriginsList = allowAllOrigins ? [] : parseList(allowedOriginsRaw);
const allowedOrigins = allowedOriginsList;
const allowedOriginsNormalized = normalizeList(allowedOriginsList);

const allowedHostsRaw = process.env.MCP_ALLOWED_HOSTS?.trim() ?? "";
const allowedHosts = allowedHostsRaw.length
  ? parseList(allowedHostsRaw)
  : isLoopback
  ? loopbackHosts.flatMap((entry) => [entry, `${entry}:${port}`])
  : host !== "0.0.0.0"
  ? [host, `${host}:${port}`]
  : [];

const enableDnsRebindingProtection = parseBool(
  process.env.MCP_DNS_REBINDING_PROTECTION,
  allowedHosts.length > 0
);

const rateLimitMax = parseNumber(process.env.RATE_LIMIT_MAX, 0);
const rateLimitWindowMs = parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000);

const sessionModeRaw = process.env.MCP_SESSION_MODE?.trim().toLowerCase();
const sessionMode: SessionMode =
  sessionModeRaw === "stateless" ? "stateless" : "stateful";
const maxSessions = parseNumber(process.env.MCP_MAX_SESSIONS, 1000);
const sessionTtlMs = parseNumber(
  process.env.MCP_SESSION_TTL_MS,
  60 * 60 * 1000
);
const sessionSweepIntervalMs = parseNumber(
  process.env.MCP_SESSION_SWEEP_INTERVAL_MS,
  60 * 1000
);

const eventStoreRaw = process.env.MCP_EVENT_STORE?.trim().toLowerCase();
const eventStore: EventStoreMode =
  eventStoreRaw === "memory" ? "memory" : "none";
const eventStoreMaxEvents = parseNumber(
  process.env.MCP_EVENT_STORE_MAX_EVENTS,
  10_000
);
const eventStoreTtlMs = parseNumber(
  process.env.MCP_EVENT_STORE_TTL_MS,
  15 * 60 * 1000
);
const eventStoreSweepIntervalMs = parseNumber(
  process.env.MCP_EVENT_STORE_SWEEP_INTERVAL_MS,
  60 * 1000
);

const enableJsonResponse = parseBool(
  process.env.MCP_ENABLE_JSON_RESPONSE,
  false
);
const retryIntervalMs = parseNumber(process.env.MCP_RETRY_INTERVAL_MS, 0);
const protocolVersions = parseList(
  process.env.MCP_PROTOCOL_VERSIONS ?? "2025-11-25,2025-03-26"
);
const requireProtocolVersionHeader = parseBool(
  process.env.MCP_REQUIRE_PROTOCOL_VERSION,
  false
);
const metricsEnabled = parseBool(process.env.METRICS_ENABLED, true);
const metricsPath = process.env.METRICS_PATH ?? "/metrics";
const metricsApiKey = process.env.METRICS_API_KEY;

const ConfigSchema = z.object({
  environment: z.string(),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  requestBodyLimit: z.string().min(1),
  trustProxy: z.boolean(),
  apiKey: z.string().min(1).optional(),
  allowAllOrigins: z.boolean(),
  allowedOrigins: z.array(z.string()),
  allowedHosts: z.array(z.string()),
  enableCors: z.boolean(),
  enableDnsRebindingProtection: z.boolean(),
  rateLimit: z
    .object({
      windowMs: z.number().int().min(1),
      max: z.number().int().min(1),
    })
    .nullable(),
  logLevel: z.enum(logLevels),
  shutdownTimeoutMs: z.number().int().min(1000),
  sessionMode: z.enum(sessionModes),
  maxSessions: z.number().int().min(0),
  sessionTtlMs: z.number().int().min(0),
  sessionSweepIntervalMs: z.number().int().min(0),
  eventStore: z.enum(eventStoreModes),
  eventStoreMaxEvents: z.number().int().min(0),
  eventStoreTtlMs: z.number().int().min(0),
  eventStoreSweepIntervalMs: z.number().int().min(0),
  enableJsonResponse: z.boolean(),
  retryIntervalMs: z.number().int().min(0),
  protocolVersions: z.array(z.string().min(1)).nonempty(),
  requireProtocolVersionHeader: z.boolean(),
  metricsEnabled: z.boolean(),
  metricsPath: z
    .string()
    .min(1)
    .refine((value) => value.startsWith("/"), {
      message: "METRICS_PATH must start with /",
    }),
  metricsApiKey: z.string().min(1).optional(),
});

const rawConfig = {
  environment,
  host,
  port,
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT ?? "1mb",
  trustProxy: parseBool(process.env.TRUST_PROXY, false),
  apiKey: process.env.MCP_API_KEY || undefined,
  allowAllOrigins,
  allowedOrigins,
  allowedHosts,
  enableCors: parseBool(process.env.ENABLE_CORS, true),
  enableDnsRebindingProtection,
  rateLimit:
    rateLimitMax > 0
      ? {
          windowMs: rateLimitWindowMs,
          max: rateLimitMax,
        }
      : null,
  logLevel: (process.env.LOG_LEVEL ?? "info").toLowerCase(),
  shutdownTimeoutMs: parseNumber(process.env.SHUTDOWN_TIMEOUT_MS, 10_000),
  sessionMode,
  maxSessions,
  sessionTtlMs,
  sessionSweepIntervalMs,
  eventStore,
  eventStoreMaxEvents,
  eventStoreTtlMs,
  eventStoreSweepIntervalMs,
  enableJsonResponse,
  retryIntervalMs,
  protocolVersions,
  requireProtocolVersionHeader,
  metricsEnabled,
  metricsPath,
  metricsApiKey,
};

const parsedConfig = ConfigSchema.safeParse(rawConfig);

if (!parsedConfig.success) {
  console.error("Invalid configuration", parsedConfig.error.format());
  throw new Error("Invalid configuration");
}

export const config: Config = {
  ...parsedConfig.data,
  allowedOriginsNormalized: normalizeList(parsedConfig.data.allowedOrigins),
};
