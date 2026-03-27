import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
const REQUEST_ID_HEADER = "x-request-id";
interface RequestContextStore {
  requestId: string;
}
const requestContextStorage = new AsyncLocalStorage<RequestContextStore>();
const extractRequestIdFromHeader = (headerValue: string | string[] | undefined): string | null => {
  if (Array.isArray(headerValue)) {
    const first = headerValue[0]?.trim();
    return first ? first : null;
  }
  if (typeof headerValue !== "string") {
    return null;
  }
  const trimmed = headerValue.trim();
  return trimmed ? trimmed : null;
};
export const getRequestIdFromContext = (): string | undefined => {
  return requestContextStorage.getStore()?.requestId;
};
export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = extractRequestIdFromHeader(req.headers[REQUEST_ID_HEADER]) ?? randomUUID();
  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  requestContextStorage.run({
    requestId
  }, () => {
    next();
  });
};
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
