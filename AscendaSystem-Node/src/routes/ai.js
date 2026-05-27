import { Router } from "express";
import { env } from "../config/env.js";
import { requireAuth, requireMentor } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, HttpError } from "../utils/httpError.js";

export const aiRouter = Router();

const activitySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    activities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          suggestedDueDays: { type: "integer" },
          objectives: {
            type: "array",
            items: { type: "string" },
          },
          questions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                prompt: { type: "string" },
                type: {
                  type: "string",
                  enum: ["open_text", "multiple_choice", "checklist", "reflection"],
                },
                options: {
                  type: "array",
                  items: { type: "string" },
                },
                correctAnswer: { type: "string" },
                rubric: { type: "string" },
              },
              required: ["prompt", "type", "options", "correctAnswer", "rubric"],
            },
          },
        },
        required: ["title", "description", "category", "suggestedDueDays", "objectives", "questions"],
      },
    },
  },
  required: ["title", "summary", "activities"],
};

function normalizeGenerationRequest(body = {}) {
  const sourceTitle = String(body.sourceTitle || body.topic || "").trim();
  const sourceText = String(body.sourceText || body.description || "").trim();
  const sourceUrl = String(body.sourceUrl || body.youtubeUrl || "").trim();
  const internId = body.internId || null;
  const activityCount = Math.min(Math.max(Number(body.activityCount || 3), 1), 10);
  const questionCount = Math.min(Math.max(Number(body.questionCount || 5), 1), 20);

  if (!sourceTitle && !sourceText && !sourceUrl) {
    throw badRequest("Provide sourceTitle, sourceText, or sourceUrl");
  }

  return {
    sourceTitle,
    sourceText,
    sourceUrl,
    internId,
    activityCount,
    questionCount,
    language: body.language || "pt-BR",
  };
}

async function callOpenAI(payload) {
  if (!env.openaiApiKey) {
    throw new HttpError(501, "OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.openaiModel,
      input: [
        {
          role: "system",
          content:
            "You generate practical learning activities for an internship mentoring platform. Return only valid JSON that follows the schema.",
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "ascenda_activity_generation",
          strict: true,
          schema: activitySchema,
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new HttpError(response.status, "OpenAI request failed", data);
  }

  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .find((item) => item.type === "output_text")?.text;

  if (!outputText) {
    throw new HttpError(502, "OpenAI response did not include output text", data);
  }

  return JSON.parse(outputText);
}

aiRouter.post(
  "/generate-activities",
  requireAuth,
  requireMentor,
  asyncHandler(async (req, res) => {
    const requestPayload = normalizeGenerationRequest(req.body);
    const result = await callOpenAI(requestPayload);

    const { data: job, error } = await supabaseAdmin
      .from("ai_generation_jobs")
      .insert({
        requested_by: req.user.id,
        intern_id: requestPayload.internId,
        source_kind: requestPayload.sourceUrl ? "youtube" : "text",
        source_title: requestPayload.sourceTitle || requestPayload.sourceUrl || "Untitled source",
        prompt: requestPayload.sourceText || requestPayload.sourceUrl,
        request_payload: requestPayload,
        response_payload: result,
      })
      .select("*")
      .single();

    if (error) {
      throw badRequest(error.message, error);
    }

    res.json({
      data: result,
      job,
    });
  }),
);
