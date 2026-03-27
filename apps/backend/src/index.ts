import { env } from "./config/env";
import { createApp } from "./app";
import { logError, logInfo } from "./utils/logger";
import { createRateLimitRedisClient } from "./redis/client";
import { closeDbPool } from "./db/pool";
import { setAdminLoginRateLimitRedisClient, setPublicRateLimitRedisClient } from "./middleware/rateLimit";
import { runMigrations } from "./db/migrate";
const bootstrap = async (): Promise<void> => {
  await runMigrations();
  const redisClient = await createRateLimitRedisClient();
  setPublicRateLimitRedisClient(redisClient);
  setAdminLoginRateLimitRedisClient(redisClient);
  const app = createApp();
  const server = app.listen(env.port, () => {
    logInfo("startup", "Backend listening", {
      port: env.port,
      nodeEnv: env.nodeEnv
    });
  });
  let shutdownPromise: Promise<void> | null = null;
  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (shutdownPromise) {
      return shutdownPromise;
    }
    shutdownPromise = (async () => {
      logInfo("shutdown_start", "Backend graceful shutdown started", {
        signal
      });
      await new Promise<void>(resolve => {
        server.close(() => {
          resolve();
        });
      });
      if (redisClient) {
        try {
          await redisClient.quit();
        } catch (error) {
          logError("rate_limit_redis_shutdown_error", "Failed to close Redis connection during backend shutdown", {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      try {
        await closeDbPool();
      } catch (error) {
        logError("db_pool_shutdown_error", "Failed to close DB pool during backend shutdown", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
      logInfo("shutdown_complete", "Backend graceful shutdown completed");
    })();
    return shutdownPromise;
  };
  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
};
void bootstrap();
