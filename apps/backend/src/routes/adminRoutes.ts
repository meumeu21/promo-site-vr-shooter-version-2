import { Router } from "express";
import { adminLogin, importCompletedMatchRecord } from "../controllers/adminController";
import { requireAdminAuth, requireAdminRole } from "../middleware/auth";
import { adminLoginRateLimit } from "../middleware/rateLimit";
export const adminRoutes = Router();
adminRoutes.post("/login", adminLoginRateLimit, adminLogin);
adminRoutes.post("/matches", requireAdminAuth, requireAdminRole("operator"), importCompletedMatchRecord);
