import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
    },
    profile: req.profile,
  });
});
