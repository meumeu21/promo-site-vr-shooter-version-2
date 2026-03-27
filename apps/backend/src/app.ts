import express from "express";
import { apiRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestContextMiddleware } from "./middleware/requestContext";
import { pool } from "./db/pool";
import { env } from "./config/env";
import { logInfo } from "./utils/logger";
import { getRateLimitReadiness } from "./middleware/rateLimit";
interface EndpointCounter {
  count: number;
}
interface EndpointStatusCounter {
  count: number;
}
interface EndpointLatencyStats {
  count: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
}
interface EndpointLatencyAccumulator {
  count: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
  samplesMs: number[];
}
export const LATENCY_SAMPLES_LIMIT = 512;
const DYNAMIC_SEGMENT_PATTERNS: RegExp[] = [/^\d+$/, /^[0-9a-f]{24}$/i, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, /^[A-Za-z0-9_-]{16,}$/];
export const normalizeEndpointPath = (url: string): string => {
  const withoutQuery = url.split("?")[0] ?? url;
  const normalized = (withoutQuery || "/").split("/").map((segment, index) => {
    if (index === 0 || segment.length === 0) {
      return segment;
    }
    return DYNAMIC_SEGMENT_PATTERNS.some(pattern => pattern.test(segment)) ? ":id" : segment;
  }).join("/");
  return normalized || "/";
};
export const pushBoundedLatencySample = (samples: number[], valueMs: number): number => {
  samples.push(valueMs);
  if (samples.length > LATENCY_SAMPLES_LIMIT) {
    samples.splice(0, samples.length - LATENCY_SAMPLES_LIMIT);
  }
  return samples.length;
};
const computePercentile = (samples: number[], percentile: number): number => {
  if (samples.length === 0) {
    return 0;
  }
  const sorted = [...samples].sort((left, right) => left - right);
  const rank = Math.min(sorted.length - 1, Math.max(0, Math.ceil(percentile / 100 * sorted.length) - 1));
  return Number(sorted[rank].toFixed(2));
};
export const createApp = () => {
  const app = express();
  const startedAtMs = Date.now();
  const metrics = {
    totalRequests: 0,
    totalErrors: 0,
    requestsByEndpointMethodStatusClass: new Map<string, EndpointStatusCounter>(),
    requestCountByEndpointMethod: new Map<string, EndpointCounter>(),
    latencyByEndpoint: new Map<string, EndpointLatencyAccumulator>(),
    latencyByEndpointMethod: new Map<string, EndpointLatencyAccumulator>()
  };
  app.disable("x-powered-by");
  app.use(requestContextMiddleware);
  app.use(express.json({
    limit: "1mb"
  }));
  app.use((req, res, next) => {
    metrics.totalRequests += 1;
    const normalizedEndpoint = normalizeEndpointPath(req.originalUrl || req.url);
    const endpointMethodKey = `${req.method} ${normalizedEndpoint}`;
    const startedHrTime = process.hrtime.bigint();
    const existingEndpointMethodCounter = metrics.requestCountByEndpointMethod.get(endpointMethodKey) ?? {
      count: 0
    };
    existingEndpointMethodCounter.count += 1;
    metrics.requestCountByEndpointMethod.set(endpointMethodKey, existingEndpointMethodCounter);
    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedHrTime) / 1_000_000;
      const statusClass = `${Math.floor(res.statusCode / 100)}xx`;
      const endpointMethodStatusKey = `${endpointMethodKey} ${statusClass}`;
      const existingStatusCounter = metrics.requestsByEndpointMethodStatusClass.get(endpointMethodStatusKey) ?? {
        count: 0
      };
      existingStatusCounter.count += 1;
      metrics.requestsByEndpointMethodStatusClass.set(endpointMethodStatusKey, existingStatusCounter);
      if (res.statusCode >= 400) {
        metrics.totalErrors += 1;
      }
      const endpointLatency = metrics.latencyByEndpoint.get(normalizedEndpoint) ?? {
        count: 0,
        totalMs: 0,
        minMs: Number.POSITIVE_INFINITY,
        maxMs: 0,
        samplesMs: []
      };
      endpointLatency.count += 1;
      endpointLatency.totalMs += durationMs;
      endpointLatency.minMs = Math.min(endpointLatency.minMs, durationMs);
      endpointLatency.maxMs = Math.max(endpointLatency.maxMs, durationMs);
      pushBoundedLatencySample(endpointLatency.samplesMs, durationMs);
      metrics.latencyByEndpoint.set(normalizedEndpoint, endpointLatency);
      const endpointMethodLatency = metrics.latencyByEndpointMethod.get(endpointMethodKey) ?? {
        count: 0,
        totalMs: 0,
        minMs: Number.POSITIVE_INFINITY,
        maxMs: 0,
        samplesMs: []
      };
      endpointMethodLatency.count += 1;
      endpointMethodLatency.totalMs += durationMs;
      endpointMethodLatency.minMs = Math.min(endpointMethodLatency.minMs, durationMs);
      endpointMethodLatency.maxMs = Math.max(endpointMethodLatency.maxMs, durationMs);
      pushBoundedLatencySample(endpointMethodLatency.samplesMs, durationMs);
      metrics.latencyByEndpointMethod.set(endpointMethodKey, endpointMethodLatency);
    });
    next();
  });
  const buildLatencyStatsByEndpoint = (): Record<string, EndpointLatencyStats> => {
    const result: Record<string, EndpointLatencyStats> = {};
    for (const [endpoint, accumulator] of metrics.latencyByEndpoint.entries()) {
      if (accumulator.count === 0) {
        continue;
      }
      result[endpoint] = {
        count: accumulator.count,
        minMs: Number(accumulator.minMs.toFixed(2)),
        maxMs: Number(accumulator.maxMs.toFixed(2)),
        avgMs: Number((accumulator.totalMs / accumulator.count).toFixed(2)),
        p50Ms: computePercentile(accumulator.samplesMs, 50),
        p95Ms: computePercentile(accumulator.samplesMs, 95)
      };
    }
    return result;
  };
  const buildLatencyStatsByEndpointMethod = (): Record<string, EndpointLatencyStats> => {
    const result: Record<string, EndpointLatencyStats> = {};
    for (const [endpointMethod, accumulator] of metrics.latencyByEndpointMethod.entries()) {
      if (accumulator.count === 0) {
        continue;
      }
      result[endpointMethod] = {
        count: accumulator.count,
        minMs: Number(accumulator.minMs.toFixed(2)),
        maxMs: Number(accumulator.maxMs.toFixed(2)),
        avgMs: Number((accumulator.totalMs / accumulator.count).toFixed(2)),
        p50Ms: computePercentile(accumulator.samplesMs, 50),
        p95Ms: computePercentile(accumulator.samplesMs, 95)
      };
    }
    return result;
  };
  const buildRequestCounters = (): Record<string, EndpointStatusCounter> => {
    return Object.fromEntries(metrics.requestsByEndpointMethodStatusClass.entries());
  };
  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "backend"
    });
  });
  app.get("/readiness", async (_req, res) => {
    const limiterReadiness = getRateLimitReadiness();
    try {
      await pool.query("SELECT 1");
      const degraded = !limiterReadiness.adminLoginReady;
      res.status(degraded ? 503 : 200).json({
        ok: !degraded,
        degraded,
        service: "backend",
        dbReady: true,
        redisReady: limiterReadiness.redisReady,
        authSensitiveReady: limiterReadiness.adminLoginReady,
        publicRateLimitReady: limiterReadiness.publicRateLimitReady
      });
    } catch {
      res.status(503).json({
        ok: false,
        degraded: false,
        service: "backend",
        dbReady: false,
        redisReady: limiterReadiness.redisReady,
        authSensitiveReady: limiterReadiness.adminLoginReady,
        publicRateLimitReady: limiterReadiness.publicRateLimitReady
      });
    }
  });
  app.get("/api/meta", (_req, res) => {
    res.json({
      service: "backend",
      apiVersion: env.apiVersion,
      uptimeSec: Math.floor((Date.now() - startedAtMs) / 1000),
      now: new Date().toISOString()
    });
  });
  app.get("/api/metrics", (_req, res) => {
    res.json({
      service: "backend",
      totalRequests: metrics.totalRequests,
      totalErrors: metrics.totalErrors,
      requestsByEndpointMethodStatusClass: buildRequestCounters(),
      latencyByEndpoint: buildLatencyStatsByEndpoint(),
      latencyByEndpointMethod: buildLatencyStatsByEndpointMethod()
    });
  });
  app.use("/api", apiRoutes);
  app.use("/api/v1", apiRoutes);
  app.get("/api/v1/meta", (_req, res) => {
    res.json({
      service: "backend",
      apiVersion: env.apiVersion,
      uptimeSec: Math.floor((Date.now() - startedAtMs) / 1000),
      now: new Date().toISOString()
    });
  });
  app.get("/api/v1/metrics", (_req, res) => {
    res.json({
      service: "backend",
      totalRequests: metrics.totalRequests,
      totalErrors: metrics.totalErrors,
      requestsByEndpointMethodStatusClass: buildRequestCounters(),
      latencyByEndpoint: buildLatencyStatsByEndpoint(),
      latencyByEndpointMethod: buildLatencyStatsByEndpointMethod()
    });
  });
  app.use(notFoundHandler);
  app.use(errorHandler);
  logInfo("app_ready", "Express application composed");
  return app;
};
