import { Router } from "express";
import { ingestCompletedMatchRecord } from "../controllers/adminController";
export const mockHistoryIngestRoutes = Router();
mockHistoryIngestRoutes.post("/matches", ingestCompletedMatchRecord);
