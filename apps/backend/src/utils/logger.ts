import { getRequestIdFromContext } from "../middleware/requestContext";
type LogLevel = "INFO" | "WARN" | "ERROR";
interface LogMeta {
  [key: string]: unknown;
}
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: "backend";
  event: string;
  message: string;
  meta?: LogMeta;
}
const withRequestContextMeta = (meta?: LogMeta): LogMeta | undefined => {
  const requestId = getRequestIdFromContext();
  if (!requestId) {
    return meta;
  }
  if (!meta) {
    return {
      requestId
    };
  }
  if (meta.requestId) {
    return meta;
  }
  return {
    ...meta,
    requestId
  };
};
const emit = (entry: LogEntry): void => {
  const payload = JSON.stringify(entry);
  if (entry.level === "ERROR") {
    console.error(payload);
    return;
  }
  console.log(payload);
};
export const logInfo = (event: string, message: string, meta?: LogMeta): void => {
  emit({
    timestamp: new Date().toISOString(),
    level: "INFO",
    service: "backend",
    event,
    message,
    meta: withRequestContextMeta(meta)
  });
};
export const logWarn = (event: string, message: string, meta?: LogMeta): void => {
  emit({
    timestamp: new Date().toISOString(),
    level: "WARN",
    service: "backend",
    event,
    message,
    meta: withRequestContextMeta(meta)
  });
};
export const logError = (event: string, message: string, meta?: LogMeta): void => {
  emit({
    timestamp: new Date().toISOString(),
    level: "ERROR",
    service: "backend",
    event,
    message,
    meta: withRequestContextMeta(meta)
  });
};
