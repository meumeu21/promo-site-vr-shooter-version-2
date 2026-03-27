import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors/httpError";
import { env } from "../config/env";
import { loginAdmin } from "../services/authService";
import { importCompletedMatch, ingestCompletedMatch } from "../services/matchHistoryService";
import { HistoryIngestMatchRequest } from "../types";
import { asObject, asString } from "../validation/common";
import { normalizeAdminImportedMatch, normalizeImportedMatch } from "../validation/matchHistory";
const requireHistoryIngestToken = (req: Request): void => {
  const token = req.header("x-history-ingest-token")?.trim();
  if (!token || token !== env.historyIngestToken) {
    throw new ValidationError("Invalid history ingest token");
  }
};
export const adminLogin = (req: Request, res: Response): void => {
  const body = asObject(req.body);
  const login = asString(body.login, "login");
  const password = asString(body.password, "password");
  const {
    token,
    role
  } = loginAdmin(login, password);
  res.json({
    token,
    role
  });
};
export const importCompletedMatchRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = normalizeAdminImportedMatch(req.body);
    const data = await importCompletedMatch(payload, {
      source: "admin"
    });
    res.status(201).json({
      data
    });
  } catch (error) {
    next(error);
  }
};
export const ingestCompletedMatchRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    requireHistoryIngestToken(req);
    const payload = normalizeImportedMatch(req.body);
    const ingestPayload: HistoryIngestMatchRequest = {
      ...payload,
      externalMatchId: payload.externalMatchId ?? ""
    };
    const result = await ingestCompletedMatch(ingestPayload);
    res.status(result.imported ? 201 : 200).json({
      data: result.match,
      meta: {
        imported: result.imported
      }
    });
  } catch (error) {
    next(error);
  }
};
export const createRequestLike = (options: {
  headers?: Record<string, string>;
} = {}): Request => {
  const normalizedHeaders = new Map(Object.entries(options.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
  return {
    header(name: string) {
      return normalizedHeaders.get(name.toLowerCase());
    }
  } as Request;
};
export { requireHistoryIngestToken };
