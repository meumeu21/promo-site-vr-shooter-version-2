import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError";
import { logError, logWarn } from "../utils/logger";
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    error: "Not Found"
  });
};
export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof HttpError) {
    logWarn("http_error", error.message, {
      method: req.method,
      path: req.path,
      statusCode: error.statusCode
    });
    res.status(error.statusCode).json({
      error: error.message
    });
    return;
  }
  logError("unhandled_error", "Unhandled server error", {
    method: req.method,
    path: req.path,
    error: error instanceof Error ? error.message : String(error)
  });
  res.status(500).json({
    error: "Internal Server Error"
  });
};
