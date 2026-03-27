import { createClient } from "redis";
import { env } from "../config/env";
import { logError, logInfo, logWarn } from "../utils/logger";
type RateLimitRedisClient = {
  eval: (script: string, options: {
    keys: string[];
    arguments: string[];
  }) => Promise<unknown>;
  quit: () => Promise<unknown>;
  on: (event: "error", listener: (error: unknown) => void) => void;
  connect: () => Promise<unknown>;
};
export const createRateLimitRedisClient = async (): Promise<RateLimitRedisClient | null> => {
  if (!env.redisUrl) {
    logWarn("rate_limit_redis_disabled", "REDIS_URL is not set. Public limiter uses fail-open, admin login limiter uses fail-closed.");
    return null;
  }
  const client = createClient({
    url: env.redisUrl,
    socket: {
      connectTimeout: env.redisConnectTimeoutMs
    }
  });
  client.on("error", (error: unknown) => {
    logError("rate_limit_redis_error", "Redis client error for backend rate limiters", {
      error: error instanceof Error ? error.message : String(error)
    });
  });
  try {
    await client.connect();
    logInfo("rate_limit_redis_connected", "Redis connected for backend rate limiters");
    return client;
  } catch (error) {
    logError("rate_limit_redis_connect_failed", "Redis unavailable. Public limiter switches to fail-open and admin login limiter to fail-closed.", {
      error: error instanceof Error ? error.message : String(error)
    });
    try {
      await client.quit();
    } catch {}
    return null;
  }
};
