import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { HttpError } from "../errors/httpError";
import { logWarn } from "../utils/logger";
const RATE_LIMIT_LUA = `
local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local maxRequests = tonumber(ARGV[2])

local current = tonumber(redis.call('GET', key) or '0')

if current == 0 then
  redis.call('SET', key, 1, 'PX', windowMs)
  return {1, windowMs, 0}
end

local ttlMs = tonumber(redis.call('PTTL', key))
if ttlMs < 0 then
  ttlMs = windowMs
  redis.call('PEXPIRE', key, windowMs)
end

if current >= maxRequests then
  return {current, ttlMs, 1}
end

local nextCount = tonumber(redis.call('INCR', key))
ttlMs = tonumber(redis.call('PTTL', key))
if ttlMs < 0 then
  ttlMs = windowMs
  redis.call('PEXPIRE', key, windowMs)
end

return {nextCount, ttlMs, 0}
`;
type RateLimitRedisClient = {
  eval: (script: string, options: {
    keys: string[];
    arguments: string[];
  }) => Promise<unknown>;
};
type RedisUnavailableStrategy = "allow" | "deny";
export interface RateLimitReadiness {
  redisReady: boolean;
  publicRateLimitReady: boolean;
  adminLoginReady: boolean;
}
interface RateLimitConfig {
  redisPrefix: string;
  windowMs: number;
  maxRequests: number;
  tooManyErrorMessage: string;
  redisUnavailableErrorMessage: string;
  redisUnavailableStatusCode: number;
  redisUnavailableStrategy: RedisUnavailableStrategy;
  logScope: string;
}
const createRateLimit = (redisClient: RateLimitRedisClient | null, config: RateLimitConfig) => {
  const composeKey = (req: Request): string => `${config.redisPrefix}:${req.ip}:${req.path}`;
  const toRetryAfterSeconds = (ttlMs: number): number => {
    const normalizedTtlMs = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : config.windowMs;
    return Math.max(1, Math.ceil(normalizedTtlMs / 1000));
  };
  const onRedisUnavailable = (req: Request, next: NextFunction, error?: unknown): void => {
    if (config.redisUnavailableStrategy === "allow") {
      if (error) {
        logWarn("rate_limit_redis_runtime_unavailable", `Redis call failed for ${config.logScope} rate limiter, request allowed by fail-open strategy`, {
          path: req.path,
          method: req.method,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      next();
      return;
    }
    if (error) {
      logWarn("rate_limit_redis_runtime_unavailable", `Redis call failed for ${config.logScope} rate limiter, request denied`, {
        path: req.path,
        method: req.method,
        error: error instanceof Error ? error.message : String(error)
      });
    } else {
      logWarn("rate_limit_redis_unavailable", `Redis is not available for ${config.logScope} rate limiter, request denied`, {
        path: req.path,
        method: req.method
      });
    }
    next(new HttpError(config.redisUnavailableStatusCode, config.redisUnavailableErrorMessage));
  };
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!redisClient) {
      onRedisUnavailable(req, next);
      return;
    }
    const key = composeKey(req);
    try {
      const rawResult = (await redisClient.eval(RATE_LIMIT_LUA, {
        keys: [key],
        arguments: [String(config.windowMs), String(config.maxRequests)]
      })) as [number, number, number];
      const [ttlMs, blockedFlag] = rawResult;
      if (blockedFlag === 1) {
        res.setHeader("Retry-After", String(toRetryAfterSeconds(ttlMs)));
        next(new HttpError(429, config.tooManyErrorMessage));
        return;
      }
      next();
    } catch (error) {
      onRedisUnavailable(req, next, error);
    }
  };
};
let publicRateLimitRedisClient: RateLimitRedisClient | null = null;
let adminLoginRateLimitRedisClient: RateLimitRedisClient | null = null;
export const createPublicRateLimit = (redisClient: RateLimitRedisClient | null) => createRateLimit(redisClient, {
  redisPrefix: env.publicRateLimitRedisPrefix,
  windowMs: env.publicRateLimitWindowMs,
  maxRequests: env.publicRateLimitMax,
  tooManyErrorMessage: "Too many requests",
  redisUnavailableErrorMessage: "Service temporarily unavailable",
  redisUnavailableStatusCode: 503,
  redisUnavailableStrategy: "allow",
  logScope: "public"
});
export const createAdminLoginRateLimit = (redisClient: RateLimitRedisClient | null) => createRateLimit(redisClient, {
  redisPrefix: env.adminLoginRateLimitRedisPrefix,
  windowMs: env.adminLoginRateLimitWindowMs,
  maxRequests: env.adminLoginRateLimitMax,
  tooManyErrorMessage: "Too many admin login attempts",
  redisUnavailableErrorMessage: "Admin login temporarily unavailable",
  redisUnavailableStatusCode: 503,
  redisUnavailableStrategy: "deny",
  logScope: "admin-login"
});
let publicRateLimitHandler = createPublicRateLimit(publicRateLimitRedisClient);
let adminLoginRateLimitHandler = createAdminLoginRateLimit(adminLoginRateLimitRedisClient);
export const setPublicRateLimitRedisClient = (client: RateLimitRedisClient | null): void => {
  publicRateLimitRedisClient = client;
  publicRateLimitHandler = createPublicRateLimit(publicRateLimitRedisClient);
};
export const setAdminLoginRateLimitRedisClient = (client: RateLimitRedisClient | null): void => {
  adminLoginRateLimitRedisClient = client;
  adminLoginRateLimitHandler = createAdminLoginRateLimit(adminLoginRateLimitRedisClient);
};
export const getRateLimitReadiness = (): RateLimitReadiness => ({
  redisReady: publicRateLimitRedisClient !== null || adminLoginRateLimitRedisClient !== null,
  publicRateLimitReady: publicRateLimitRedisClient !== null,
  adminLoginReady: adminLoginRateLimitRedisClient !== null
});
export const publicRateLimit = (req: Request, res: Response, next: NextFunction): Promise<void> => publicRateLimitHandler(req, res, next);
export const adminLoginRateLimit = (req: Request, res: Response, next: NextFunction): Promise<void> => adminLoginRateLimitHandler(req, res, next);
