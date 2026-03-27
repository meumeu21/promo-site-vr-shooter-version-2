import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ForbiddenError, UnauthorizedError } from "../errors/httpError";
import { AdminRole } from "../types";
export interface AdminJwtPayload {
  sub: string;
  role: AdminRole;
}
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    next(new UnauthorizedError());
    return;
  }
  const token = header.replace("Bearer ", "").trim();
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AdminJwtPayload;
    if (!payload || payload.role !== "viewer" && payload.role !== "operator") {
      throw new Error("Invalid role");
    }
    res.locals.admin = payload;
    next();
  } catch {
    next(new UnauthorizedError());
  }
};
export const requireAdminRole = (requiredRole: AdminRole) => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const payload = res.locals.admin as AdminJwtPayload | undefined;
    if (!payload) {
      next(new UnauthorizedError());
      return;
    }
    if (requiredRole === "operator" && payload.role !== "operator") {
      next(new ForbiddenError("Insufficient role"));
      return;
    }
    next();
  };
};
