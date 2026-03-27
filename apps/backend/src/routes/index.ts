import { Router } from "express";
import { adminRoutes } from "./adminRoutes";
import { matchHistoryRoutes } from "./matchHistoryRoutes";
import { mockHistoryIngestRoutes } from "./mockHistoryIngestRoutes";
export const apiRoutes = Router();
apiRoutes.use("/matches", matchHistoryRoutes);
apiRoutes.use("/history-ingest", mockHistoryIngestRoutes);
apiRoutes.use("/admin", adminRoutes);
