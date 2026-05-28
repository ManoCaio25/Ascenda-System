import { Router } from "express";
import { env } from "../config/env.js";
import { dataAdapter } from "../data/index.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { forbidden, unauthorized } from "../utils/httpError.js";
import {
  assertObject,
  readEmail,
  readPassword,
  readSafeId,
  readString,
} from "../utils/validation.js";

export const authRouter = Router();

function readLoginPayload(body) {
  const payload = assertObject(body);
  const role = readString(payload, "role", { required: false, max: 20 });

  if (role && !["mentor", "intern", "admin"].includes(role)) {
    throw forbidden("Unsupported role");
  }

  return {
    email: readEmail(payload),
    password: readString(payload, "password", {
      required: true,
      min: 1,
      max: 128,
      label: "password",
    }),
    role,
  };
}

function readMentorPayload(body) {
  const payload = assertObject(body);
  return {
    fullName: readString(payload, "fullName", {
      required: true,
      min: 2,
      max: 160,
      label: "fullName",
    }),
    email: readEmail(payload),
    password: readPassword(payload),
    title: readString(payload, "title", {
      required: false,
      max: 120,
      label: "title",
    }),
  };
}

function readInternPayload(body) {
  const payload = assertObject(body);
  return {
    fullName: readString(payload, "fullName", {
      required: true,
      min: 2,
      max: 160,
      label: "fullName",
    }),
    email: readEmail(payload),
    password: readPassword(payload),
    mentorId: readSafeId(payload, "mentorId", { required: false }),
    substituteMentorId: readSafeId(payload, "substituteMentorId", { required: false }),
    track: readString(payload, "track", {
      required: false,
      max: 120,
      label: "track",
    }),
    cohort: readString(payload, "cohort", {
      required: false,
      max: 120,
      label: "cohort",
    }),
  };
}

function assertSignupAllowed(req, kind) {
  const isAdmin = req.profile?.role === "admin";
  const isMentor = req.profile?.role === "mentor";

  if (kind === "mentor" && (env.allowPublicMentorSignup || isAdmin)) {
    return;
  }

  if (kind === "intern" && (env.allowPublicInternSignup || isAdmin || isMentor)) {
    return;
  }

  throw forbidden("Public signup is disabled for this account type");
}

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = readLoginPayload(req.body);
    const result = await dataAdapter.login(payload);
    if (payload.role && result.profile?.role !== payload.role) {
      throw unauthorized("Invalid credentials");
    }
    res.json({ data: result });
  }),
);

authRouter.post(
  "/register-mentor",
  optionalAuth,
  asyncHandler(async (req, res) => {
    assertSignupAllowed(req, "mentor");
    const payload = readMentorPayload(req.body);
    const result = await dataAdapter.createMentor(payload);
    res.status(201).json({ data: result });
  }),
);

authRouter.post(
  "/register-intern",
  optionalAuth,
  asyncHandler(async (req, res) => {
    assertSignupAllowed(req, "intern");
    const payload = readInternPayload(req.body);
    const result = await dataAdapter.createIntern(payload, {
      user: req.user,
      profile: req.profile,
      db: req.db,
    });
    res.status(201).json({ data: result });
  }),
);

authRouter.get(
  "/session",
  requireAuth,
  requireRole("admin", "mentor", "intern"),
  asyncHandler(async (req, res) => {
    res.json({
      data: {
        user: req.user,
        profile: req.profile,
        provider: dataAdapter.provider,
      },
    });
  }),
);
