import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors/httpError";
import { getMatchDetail, listGroupedHistoryMatches, listHistoryMatches } from "../services/matchHistoryService";
export const getGroupedHistoryMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clubLimit = req.query.clubLimit ? parseInt(asString(req.query.clubLimit, "clubLimit"), 10) : undefined;
    const clubOffset = req.query.clubOffset ? parseInt(asString(req.query.clubOffset, "clubOffset"), 10) : undefined;
    const matchLimit = req.query.matchLimit ? parseInt(asString(req.query.matchLimit, "matchLimit"), 10) : undefined;
    const from = req.query.from ? asString(req.query.from, "from") : undefined;
    const to = req.query.to ? asString(req.query.to, "to") : undefined;
    const clubId = req.query.clubId ? asString(req.query.clubId, "clubId") : undefined;
    const clubSlug = req.query.clubSlug ? asString(req.query.clubSlug, "clubSlug") : undefined;
    const result = await listGroupedHistoryMatches({
      clubLimit,
      clubOffset,
      matchLimit,
      from,
      to,
      clubId,
      clubSlug
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
import { asString } from "../validation/common";
import { normalizeHistoryMatchListFilters } from "../validation/matchHistory";
const parseMatchId = (value: string): string => {
  const normalized = asString(value, "id");
  const numericId = Number(normalized);
  if (!Number.isInteger(numericId) || numericId < 1) {
    throw new ValidationError("Invalid match id");
  }
  return normalized;
};
export const getHistoryMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = normalizeHistoryMatchListFilters(req.query);
    const result = await listHistoryMatches(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
export const getHistoryMatchDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseMatchId(req.params.id);
    const data = await getMatchDetail(id);
    res.json({
      data
    });
  } catch (error) {
    next(error);
  }
};
