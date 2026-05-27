import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/httpError.js";

const ENTITY_TABLES = {
  profiles: "profiles",
  interns: "intern_profiles",
  courses: "courses",
  courseAssignments: "course_assignments",
  tasks: "tasks",
  activities: "activities",
  activityQuestions: "activity_questions",
  activityResponses: "activity_responses",
  vacationRequests: "vacation_requests",
  chatMessages: "chat_messages",
  notifications: "notifications",
  forumCategories: "forum_categories",
  forumTopics: "forum_topics",
  forumReplies: "forum_replies",
  feedbackEntries: "feedback_entries",
  badges: "badges",
  shopItems: "shop_items",
  calendarEvents: "calendar_events",
  learningPaths: "learning_paths",
  contents: "contents",
  aiGenerationJobs: "ai_generation_jobs",
};

const RESERVED_QUERY_KEYS = new Set(["limit", "order", "desc", "select"]);

function resolveTable(entity) {
  const table = ENTITY_TABLES[entity];

  if (!table) {
    throw notFound(`Unknown entity: ${entity}`);
  }

  return table;
}

function parseLimit(value) {
  if (!value) return null;
  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 200) {
    throw badRequest("limit must be an integer between 1 and 200");
  }

  return numeric;
}

export const entitiesRouter = Router();

entitiesRouter.use(requireAuth);

entitiesRouter.get(
  "/:entity",
  asyncHandler(async (req, res) => {
    const table = resolveTable(req.params.entity);
    const limit = parseLimit(req.query.limit);
    const select = req.query.select || "*";
    let query = req.db.from(table).select(select);

    for (const [key, value] of Object.entries(req.query)) {
      if (RESERVED_QUERY_KEYS.has(key) || value === undefined || value === "") {
        continue;
      }
      query = query.eq(key, value);
    }

    if (req.query.order) {
      query = query.order(req.query.order, {
        ascending: req.query.desc !== "true",
      });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw badRequest(error.message, error);
    }

    res.json({ data });
  }),
);

entitiesRouter.get(
  "/:entity/:id",
  asyncHandler(async (req, res) => {
    const table = resolveTable(req.params.entity);
    const { data, error } = await req.db
      .from(table)
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) {
      throw badRequest(error.message, error);
    }

    if (!data) {
      throw notFound();
    }

    res.json({ data });
  }),
);

entitiesRouter.post(
  "/:entity",
  asyncHandler(async (req, res) => {
    const table = resolveTable(req.params.entity);
    const { data, error } = await req.db
      .from(table)
      .insert(req.body)
      .select("*")
      .single();

    if (error) {
      throw badRequest(error.message, error);
    }

    res.status(201).json({ data });
  }),
);

entitiesRouter.patch(
  "/:entity/:id",
  asyncHandler(async (req, res) => {
    const table = resolveTable(req.params.entity);
    const { data, error } = await req.db
      .from(table)
      .update(req.body)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) {
      throw badRequest(error.message, error);
    }

    res.json({ data });
  }),
);

entitiesRouter.delete(
  "/:entity/:id",
  asyncHandler(async (req, res) => {
    const table = resolveTable(req.params.entity);
    const { error } = await req.db.from(table).delete().eq("id", req.params.id);

    if (error) {
      throw badRequest(error.message, error);
    }

    res.status(204).send();
  }),
);
