import { Router } from "express";
import { dataAdapter } from "../data/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertObject, readSafeId } from "../utils/validation.js";

export const internsRouter = Router();

internsRouter.use(requireAuth);

internsRouter.get(
  "/",
  requireRole("admin", "mentor", "intern"),
  asyncHandler(async (req, res) => {
    const interns = await dataAdapter.listInterns({
      user: req.user,
      profile: req.profile,
      db: req.db,
    });
    res.json({ data: interns });
  }),
);

internsRouter.patch(
  "/:id/mentor",
  requireRole("admin", "mentor"),
  asyncHandler(async (req, res) => {
    const payload = assertObject(req.body);
    const mentorId = readSafeId(payload, "mentorId", { required: true });
    const intern = await dataAdapter.updateInternMentor(req.params.id, mentorId, {
      user: req.user,
      profile: req.profile,
      db: req.db,
    });
    res.json({ data: intern });
  }),
);

internsRouter.patch(
  "/:id/substitute-mentor",
  requireRole("admin", "mentor"),
  asyncHandler(async (req, res) => {
    const payload = assertObject(req.body);
    const substituteMentorId = readSafeId(payload, "substituteMentorId", {
      required: false,
    });
    const intern = await dataAdapter.updateInternSubstituteMentor(
      req.params.id,
      substituteMentorId || null,
      {
        user: req.user,
        profile: req.profile,
        db: req.db,
      },
    );
    res.json({ data: intern });
  }),
);
