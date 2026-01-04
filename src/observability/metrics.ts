import type { NextFunction, Request, Response } from "express";
import client from "prom-client";

const registry = new client.Registry();

client.collectDefaultMetrics({ register: registry });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

const httpRequestsInFlight = new client.Gauge({
  name: "http_requests_in_flight",
  help: "Number of HTTP requests currently in flight",
  labelNames: ["method", "route"],
  registers: [registry],
});

function routeLabel(req: Request) {
  if (req.route?.path) {
    return `${req.baseUrl}${req.route.path}`;
  }
  return `${req.baseUrl}${req.path}`;
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const route = routeLabel(req);
  httpRequestsInFlight.inc({ method: req.method, route });
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: String(res.statusCode),
      },
      durationSeconds
    );
    httpRequestsInFlight.dec({ method: req.method, route });
  });

  res.on("close", () => {
    if (!res.writableEnded) {
      httpRequestsInFlight.dec({ method: req.method, route });
    }
  });

  next();
}

export async function metricsHandler(_req: Request, res: Response) {
  res.setHeader("Content-Type", registry.contentType);
  res.end(await registry.metrics());
}
