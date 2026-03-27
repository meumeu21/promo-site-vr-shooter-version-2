import { Router } from "express";
import { getHistoryMatchDetail, getHistoryMatches, getGroupedHistoryMatches } from "../controllers/matchHistoryController";
export const matchHistoryRoutes = Router();
matchHistoryRoutes.get("/grouped", getGroupedHistoryMatches);
matchHistoryRoutes.get("/", getHistoryMatches);
matchHistoryRoutes.get("/:id", getHistoryMatchDetail);
