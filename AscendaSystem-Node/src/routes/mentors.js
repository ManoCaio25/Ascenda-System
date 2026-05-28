import { Router } from "express";
import { dataAdapter } from "../data/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const mentorsRouter = Router();

mentorsRouter.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const mentors = await dataAdapter.listMentors({ publicOnly: true });
    res.json({ data: mentors });
  }),
);

mentorsRouter.get(
  "/",
  requireAuth,
  requireRole("admin", "mentor"),
  asyncHandler(async (_req, res) => {
    const mentors = await dataAdapter.listMentors();
    res.json({ data: mentors });
  }),
);
