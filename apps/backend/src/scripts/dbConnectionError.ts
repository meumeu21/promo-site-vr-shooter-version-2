import { env } from "../config/env";
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};
const extractErrorCode = (error: unknown): string | null => {
  if (!isObject(error)) {
    return null;
  }
  const code = error.code;
  return typeof code === "string" ? code : null;
};
const isConnectionIssue = (errorCode: string | null): boolean => {
  return errorCode !== null && ["ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN"].includes(errorCode);
};
export const printDbConnectionHint = (commandName: "db:seed" | "db:reset" | "db:reseed", error: unknown): void => {
  const errorCode = extractErrorCode(error);
  if (!isConnectionIssue(errorCode)) {
    return;
  }
  const rawUrl = env.databaseUrlRaw || "(empty)";
  const resolvedUrl = env.databaseUrl || "(empty)";
  console.error(`[${commandName}] Database is unreachable (${errorCode}). Check that Postgres is running and DATABASE_URL is reachable from current environment.`);
  console.error(`[${commandName}] DATABASE_URL(raw): ${rawUrl}`);
  console.error(`[${commandName}] DATABASE_URL(resolved): ${resolvedUrl}`);
  console.error(`[${commandName}] Local host hint: for docker-compose use localhost:37883 from host machine; inside docker network use db:5432.`);
};
