import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
const envFilePath = process.env.ENV_FILE?.trim();
dotenv.config(envFilePath ? {
  path: path.resolve(process.cwd(), envFilePath)
} : undefined);
const LOCAL_DB_PORT_FALLBACK = 5432;
const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const toString = (value: string | undefined, fallback: string): string => {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
};
const requireEnv = (value: string | undefined, name: string): string => {
  if (!value?.trim()) {
    throw new Error(`${name} is required`);
  }
  return value;
};
const requireEnvForRuntime = (value: string | undefined, name: string, fallbackForTest: string): string => {
  if (value?.trim()) {
    return value;
  }
  if ((process.env.NODE_ENV ?? "development") === "test") {
    return fallbackForTest;
  }
  throw new Error(`${name} is required`);
};
const isRunningInsideContainer = (): boolean => {
  return process.env.RUNNING_IN_DOCKER === "true" || existsSync("/.dockerenv");
};
const resolveDatabaseUrl = (rawDatabaseUrl: string): string => {
  if (!rawDatabaseUrl.trim()) {
    return rawDatabaseUrl;
  }
  try {
    const parsed = new URL(rawDatabaseUrl);
    if (parsed.hostname === "db" && !isRunningInsideContainer()) {
      parsed.hostname = "localhost";
      if (!parsed.port || parsed.port === "5432") {
        parsed.port = String(toNumber(process.env.DATABASE_LOCAL_PORT ?? process.env.DB_HOST_PORT, LOCAL_DB_PORT_FALLBACK));
      }
    }
    return parsed.toString();
  } catch {
    return rawDatabaseUrl;
  }
};
const databaseUrlRaw = process.env.DATABASE_URL ?? "";
const databaseUrl = resolveDatabaseUrl(databaseUrlRaw);
export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 4000),
  databaseUrl,
  databaseUrlRaw,
  jwtSecret: requireEnv(process.env.JWT_SECRET, "JWT_SECRET"),
  adminViewerLogin: process.env.ADMIN_VIEWER_LOGIN ?? "viewer",
  adminViewerPassword: requireEnv(process.env.ADMIN_VIEWER_PASSWORD, "ADMIN_VIEWER_PASSWORD"),
  adminOperatorLogin: process.env.ADMIN_OPERATOR_LOGIN ?? "operator",
  adminOperatorPassword: requireEnv(process.env.ADMIN_OPERATOR_PASSWORD, "ADMIN_OPERATOR_PASSWORD"),
  apiVersion: toString(process.env.API_VERSION, "1.0.0"),
  historyIngestToken: requireEnv(process.env.HISTORY_INGEST_TOKEN, "HISTORY_INGEST_TOKEN"),
  publicRateLimitWindowMs: toNumber(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS, 60_000),
  publicRateLimitMax: toNumber(process.env.PUBLIC_RATE_LIMIT_MAX, 20),
  adminLoginRateLimitWindowMs: toNumber(process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS, 60_000),
  adminLoginRateLimitMax: toNumber(process.env.ADMIN_LOGIN_RATE_LIMIT_MAX, 5),
  adminLoginRateLimitRedisPrefix: toString(process.env.ADMIN_LOGIN_RATE_LIMIT_REDIS_PREFIX, "rate-limit:admin-login"),
  publicRateLimitRedisPrefix: toString(process.env.PUBLIC_RATE_LIMIT_REDIS_PREFIX, "rate-limit:public"),
  redisUrl: requireEnvForRuntime(process.env.REDIS_URL, "REDIS_URL", "redis://localhost:6379"),
  redisConnectTimeoutMs: toNumber(process.env.REDIS_CONNECT_TIMEOUT_MS, 2_000)
};
