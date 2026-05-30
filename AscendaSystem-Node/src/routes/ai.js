import { Router } from "express";
import { env } from "../config/env.js";
import { dataAdapter } from "../data/index.js";
import { requireAuth, requireMentor } from "../middleware/auth.js";
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

const questionSchema = {
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
};

const learningPackageSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    difficulty: {
      type: "string",
      enum: ["Basic", "Medium", "Advanced"],
    },
    challenges: {
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
            items: questionSchema,
          },
        },
        required: ["title", "description", "category", "suggestedDueDays", "objectives", "questions"],
      },
    },
    videoLessons: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          searchQuery: { type: "string" },
          estimatedMinutes: { type: "integer" },
          level: {
            type: "string",
            enum: ["Basic", "Medium", "Advanced"],
          },
        },
        required: ["title", "description", "searchQuery", "estimatedMinutes", "level"],
      },
    },
  },
  required: ["title", "summary", "difficulty", "challenges", "videoLessons"],
};

const DIFFICULTY_ALIASES = {
  beginner: "Basic",
  basic: "Basic",
  iniciante: "Basic",
  easy: "Basic",
  intermediate: "Medium",
  medium: "Medium",
  medio: "Medium",
  "médio": "Medium",
  intermediario: "Medium",
  "intermediário": "Medium",
  advanced: "Advanced",
  avancado: "Advanced",
  "avançado": "Advanced",
  hard: "Advanced",
};

function clampInteger(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function normalizeDifficulty(value) {
  const raw = String(value || "Medium").trim();
  if (["Basic", "Medium", "Advanced"].includes(raw)) {
    return raw;
  }
  return DIFFICULTY_ALIASES[raw.toLowerCase()] || "Medium";
}

function truncateSource(value, maxLength = 60000) {
  const text = String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n\n[Source truncated for generation]`;
}

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

function normalizeLearningPackageRequest(body = {}) {
  const sourceTitle = String(body.sourceTitle || body.topic || "").trim();
  const sourceText = truncateSource(body.sourceText || body.textContent || body.description || "");
  const sourceUrl = String(body.sourceUrl || body.youtubeUrl || "").trim();
  const fileName = String(body.fileName || "").trim();
  const internId = body.internId || null;
  const difficulty = normalizeDifficulty(body.difficulty);
  const challengeCount = clampInteger(body.challengeCount ?? body.activityCount, 3, 1, 10);
  const questionCount = clampInteger(body.questionCount ?? body.quizCount, 5, 1, 20);
  const videoLessonCount = clampInteger(body.videoLessonCount, 3, 0, 10);
  const persist = body.persist !== false;

  if (!internId) {
    throw badRequest("internId is required");
  }

  if (!sourceTitle && !sourceText && !sourceUrl && !fileName) {
    throw badRequest("Provide sourceTitle, sourceText, sourceUrl, or fileName");
  }

  return {
    sourceTitle,
    sourceText,
    sourceUrl,
    fileName,
    internId,
    difficulty,
    challengeCount,
    questionCount,
    videoLessonCount,
    language: body.language || "pt-BR",
    persist,
  };
}

async function callOpenAI(payload) {
  if (!env.openaiApiKey) {
    if (env.nodeEnv === "production") {
      throw new HttpError(503, "OPENAI_API_KEY is not configured");
    }
    return buildMockActivityResult(payload);
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

async function callOpenAILearningPackage(payload) {
  if (!env.openaiApiKey) {
    if (env.nodeEnv === "production") {
      throw new HttpError(503, "OPENAI_API_KEY is not configured");
    }
    return buildMockLearningPackageResult(payload);
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
            "You are AscendaIA, an efficient learning designer for an internship mentoring platform. Read the provided source and generate a practical learning package in Brazilian Portuguese unless another language is requested. Respect the exact requested counts. Challenges must be actionable and assessable. Video lessons must be recommendations, expressed as YouTube search queries rather than invented URLs. Return only valid JSON that follows the schema.",
        },
        {
          role: "user",
          content: JSON.stringify({
            sourceTitle: payload.sourceTitle,
            sourceText: payload.sourceText,
            sourceUrl: payload.sourceUrl,
            fileName: payload.fileName,
            internId: payload.internId,
            difficulty: payload.difficulty,
            challengeCount: payload.challengeCount,
            questionCountPerChallenge: payload.questionCount,
            videoLessonCount: payload.videoLessonCount,
            language: payload.language,
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "ascenda_learning_package",
          strict: true,
          schema: learningPackageSchema,
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

function buildMockActivityResult(payload) {
  const source = payload.sourceTitle || payload.sourceUrl || "Tema informado";
  const activities = Array.from({ length: payload.activityCount }, (_, index) => ({
    title: `Atividade ${index + 1}: ${source}`,
    description:
      "Versao mock para desenvolvimento. Quando OPENAI_API_KEY estiver configurada, este conteudo vira uma sugestao gerada pela IA.",
    category: "AI Generated",
    suggestedDueDays: 3 + index * 2,
    objectives: [
      "Compreender os conceitos centrais do tema.",
      "Aplicar o conteudo em uma entrega pratica.",
    ],
    questions: Array.from({ length: payload.questionCount }, (__, questionIndex) => ({
      prompt: `Explique o ponto ${questionIndex + 1} relacionado a ${source}.`,
      type: "reflection",
      options: [],
      correctAnswer: "",
      rubric: "Avaliar clareza, aplicacao pratica e capacidade de justificar decisoes.",
    })),
  }));

  return {
    title: `Plano de atividades: ${source}`,
    summary:
      "Resposta mock criada para validar o fluxo ponta a ponta antes da configuracao da chave OpenAI.",
    activities,
  };
}

function buildMockLearningPackageResult(payload) {
  const source = payload.sourceTitle || payload.fileName || payload.sourceUrl || "Material enviado";
  const challengeCount = payload.challengeCount;
  const questionCount = payload.questionCount;
  const videoLessonCount = payload.videoLessonCount;

  return {
    title: `Trilha AscendaIA: ${source}`,
    summary: `Plano gerado para praticar ${source} em nivel ${payload.difficulty}.`,
    difficulty: payload.difficulty,
    challenges: Array.from({ length: challengeCount }, (_, challengeIndex) => ({
      title: `Desafio ${challengeIndex + 1}: aplicar ${source}`,
      description:
        "Analise o material, extraia os conceitos principais e aplique em uma entrega pratica validavel pelo mentor.",
      category: "project",
      suggestedDueDays: 3 + challengeIndex * 2,
      objectives: [
        "Identificar conceitos centrais do material.",
        "Aplicar os conceitos em um caso pratico.",
        "Explicar as decisoes tomadas com clareza.",
      ],
      questions: Array.from({ length: questionCount }, (__, questionIndex) => ({
        prompt: `Pergunta ${questionIndex + 1}: como este conceito aparece no material e como voce aplicaria no projeto?`,
        type: "reflection",
        options: [],
        correctAnswer: "",
        rubric: "Avaliar entendimento, aplicacao pratica e capacidade de justificar a resposta.",
      })),
    })),
    videoLessons: Array.from({ length: videoLessonCount }, (_, index) => ({
      title: `Videoaula recomendada ${index + 1}: ${source}`,
      description: "Complemento em video para reforcar a pratica proposta.",
      searchQuery: `${source} tutorial ${payload.difficulty}`,
      estimatedMinutes: 12 + index * 3,
      level: payload.difficulty,
    })),
  };
}

function normalizeLearningPackageResult(result, payload) {
  const source = payload.sourceTitle || payload.fileName || payload.sourceUrl || "Material enviado";
  const challenges = Array.isArray(result?.challenges) ? result.challenges : [];
  const videoLessons = Array.isArray(result?.videoLessons) ? result.videoLessons : [];

  const normalized = {
    title: String(result?.title || `Trilha AscendaIA: ${source}`).trim(),
    summary: String(result?.summary || "").trim(),
    difficulty: normalizeDifficulty(result?.difficulty || payload.difficulty),
    challenges: challenges.map((challenge, index) => ({
      title: String(challenge?.title || `Desafio ${index + 1}`).trim(),
      description: String(challenge?.description || "").trim(),
      category: String(challenge?.category || "project").trim(),
      suggestedDueDays: clampInteger(challenge?.suggestedDueDays, 3 + index * 2, 1, 60),
      objectives: Array.isArray(challenge?.objectives)
        ? challenge.objectives.map((item) => String(item || "").trim()).filter(Boolean)
        : [],
      questions: Array.isArray(challenge?.questions)
        ? challenge.questions.map((question) => ({
            prompt: String(question?.prompt || "").trim(),
            type: ["open_text", "multiple_choice", "checklist", "reflection"].includes(question?.type)
              ? question.type
              : "reflection",
            options: Array.isArray(question?.options)
              ? question.options.map((item) => String(item || "").trim()).filter(Boolean)
              : [],
            correctAnswer: String(question?.correctAnswer || "").trim(),
            rubric: String(question?.rubric || "").trim(),
          })).filter((question) => question.prompt)
        : [],
    })).filter((challenge) => challenge.title && challenge.description),
    videoLessons: videoLessons.map((lesson, index) => ({
      title: String(lesson?.title || `Videoaula ${index + 1}`).trim(),
      description: String(lesson?.description || "").trim(),
      searchQuery: String(lesson?.searchQuery || lesson?.title || source).trim(),
      estimatedMinutes: clampInteger(lesson?.estimatedMinutes, 15, 1, 240),
      level: normalizeDifficulty(lesson?.level || payload.difficulty),
      url: String(lesson?.url || "").trim(),
      videoId: lesson?.videoId ? String(lesson.videoId).trim() : null,
      channelTitle: lesson?.channelTitle ? String(lesson.channelTitle).trim() : null,
      recommendationSource: lesson?.recommendationSource ? String(lesson.recommendationSource).trim() : null,
    })).filter((lesson) => lesson.title),
  };

  const fallback = buildMockLearningPackageResult(payload);

  if (normalized.challenges.length === 0) {
    normalized.challenges = fallback.challenges;
  }

  if (normalized.videoLessons.length === 0 && payload.videoLessonCount > 0) {
    normalized.videoLessons = fallback.videoLessons;
  }

  while (normalized.challenges.length < payload.challengeCount) {
    normalized.challenges.push(
      fallback.challenges[normalized.challenges.length] || fallback.challenges[0],
    );
  }

  while (normalized.videoLessons.length < payload.videoLessonCount) {
    normalized.videoLessons.push(
      fallback.videoLessons[normalized.videoLessons.length] || fallback.videoLessons[0],
    );
  }

  normalized.challenges = normalized.challenges.slice(0, payload.challengeCount).map((challenge, index) => {
    const fallbackChallenge = fallback.challenges[index] || fallback.challenges[0];
    const questions = challenge.questions.length
      ? challenge.questions.slice(0, payload.questionCount)
      : [];

    while (questions.length < payload.questionCount) {
      questions.push(fallbackChallenge.questions[questions.length] || fallbackChallenge.questions[0]);
    }

    return {
      ...challenge,
      objectives: challenge.objectives.length ? challenge.objectives : fallbackChallenge.objectives,
      questions,
    };
  });
  normalized.videoLessons = normalized.videoLessons.slice(0, payload.videoLessonCount);

  return normalized;
}

function sourceKind(payload) {
  if (payload.sourceUrl) {
    return /youtu\.?be|youtube\.com/i.test(payload.sourceUrl) ? "youtube" : "mixed";
  }
  if (payload.fileName) return "document";
  return "text";
}

function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function youtubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

function parseDurationMinutes(duration = "") {
  const match = String(duration).match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return Math.max(1, Math.round(hours * 60 + minutes + seconds / 60));
}

async function searchYoutubeLesson(query) {
  if (!env.youtubeApiKey || !query) return null;

  const searchParams = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "1",
    q: query,
    key: env.youtubeApiKey,
    relevanceLanguage: "pt",
    safeSearch: "strict",
    videoEmbeddable: "true",
  });
  const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`);
  const searchPayload = await searchResponse.json().catch(() => ({}));

  if (!searchResponse.ok) {
    console.warn("YouTube search failed", searchPayload?.error?.message || searchResponse.status);
    return null;
  }

  const videoId = searchPayload.items?.[0]?.id?.videoId;
  if (!videoId) return null;

  const detailsParams = new URLSearchParams({
    part: "snippet,contentDetails",
    id: videoId,
    key: env.youtubeApiKey,
  });
  const detailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?${detailsParams}`);
  const detailsPayload = await detailsResponse.json().catch(() => ({}));

  if (!detailsResponse.ok) {
    console.warn("YouTube video details failed", detailsPayload?.error?.message || detailsResponse.status);
    return {
      url: youtubeWatchUrl(videoId),
      videoId,
    };
  }

  const item = detailsPayload.items?.[0];
  return {
    url: youtubeWatchUrl(videoId),
    videoId,
    title: item?.snippet?.title,
    description: item?.snippet?.description,
    channelTitle: item?.snippet?.channelTitle,
    estimatedMinutes: parseDurationMinutes(item?.contentDetails?.duration),
  };
}

async function enrichVideoLessons(videoLessons = []) {
  const enriched = [];

  for (const lesson of videoLessons) {
    if (lesson.url && lesson.recommendationSource === "youtube_api") {
      enriched.push(lesson);
      continue;
    }

    const match = await searchYoutubeLesson(lesson.searchQuery || lesson.title);
    enriched.push({
      ...lesson,
      title: match?.title || lesson.title,
      description: match?.description || lesson.description,
      estimatedMinutes: match?.estimatedMinutes || lesson.estimatedMinutes,
      url: match?.url || lesson.url || youtubeSearchUrl(lesson.searchQuery || lesson.title),
      videoId: match?.videoId || lesson.videoId || null,
      channelTitle: match?.channelTitle || lesson.channelTitle || null,
      recommendationSource: match?.url ? "youtube_api" : "youtube_search",
    });
  }

  return enriched;
}

function challengeDescription(challenge) {
  const objectives = (challenge.objectives || []).map((item) => `- ${item}`).join("\n");
  const questions = (challenge.questions || [])
    .map((question, index) => `${index + 1}. ${question.prompt}`)
    .join("\n");

  return [
    challenge.description,
    objectives ? `Objetivos:\n${objectives}` : null,
    questions ? `Perguntas guia:\n${questions}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function insertOne(db, table, payload) {
  const { data, error } = await db.from(table).insert(payload).select("*").single();
  if (error) {
    throw badRequest(error.message, error);
  }
  return data;
}

async function persistLearningPackage({ req, requestPayload, result }) {
  if (!req.db) {
    throw new HttpError(501, "Learning package persistence requires Supabase mode");
  }

  const learningPath = await insertOne(req.db, "learning_paths", {
    intern_id: requestPayload.internId,
    name: result.title,
    description: result.summary,
    created_by: req.user.id,
  });

  const contents = [];
  for (let index = 0; index < result.videoLessons.length; index += 1) {
    const lesson = result.videoLessons[index];
    contents.push(
      await insertOne(req.db, "contents", {
        learning_path_id: learningPath.id,
        title: lesson.title,
        description: lesson.description,
        content_type: "Video",
        estimated_minutes: Math.max(0, Number(lesson.estimatedMinutes) || 0),
        completion_status: "pending",
        order_index: index + 1,
        access_url: lesson.url || youtubeSearchUrl(lesson.searchQuery || lesson.title),
        level: lesson.level || result.difficulty,
      }),
    );
  }

  const activities = [];
  for (let index = 0; index < result.challenges.length; index += 1) {
    const challenge = result.challenges[index];
    const activity = await insertOne(req.db, "activities", {
      intern_id: requestPayload.internId,
      created_by: req.user.id,
      title: challenge.title,
      description: challengeDescription(challenge),
      category: challenge.category || "project",
      status: "open",
      due_at: new Date(Date.now() + Math.max(1, challenge.suggestedDueDays || 3) * 24 * 60 * 60 * 1000).toISOString(),
      source_kind: sourceKind(requestPayload),
      source_url: requestPayload.sourceUrl || null,
      source_excerpt: requestPayload.sourceText ? requestPayload.sourceText.slice(0, 4000) : null,
      ai_metadata: {
        difficulty: result.difficulty,
        sourceTitle: requestPayload.sourceTitle,
        fileName: requestPayload.fileName,
        objectives: challenge.objectives || [],
        videoLessons: result.videoLessons || [],
      },
    });

    const questions = [];
    for (let questionIndex = 0; questionIndex < challenge.questions.length; questionIndex += 1) {
      const question = challenge.questions[questionIndex];
      questions.push(
        await insertOne(req.db, "activity_questions", {
          activity_id: activity.id,
          prompt: question.prompt,
          type: question.type || "reflection",
          options: question.options || [],
          correct_answer: question.correctAnswer || "",
          rubric: question.rubric || "",
          position: questionIndex + 1,
        }),
      );
    }

    activities.push({ ...activity, questions });
  }

  return {
    learningPath,
    contents,
    activities,
  };
}

aiRouter.post(
  "/generate-activities",
  requireAuth,
  requireMentor,
  asyncHandler(async (req, res) => {
    const requestPayload = normalizeGenerationRequest(req.body);
    const result = await callOpenAI(requestPayload);

    const job = await dataAdapter.createAiGenerationJob({
      requestedBy: req.user.id,
      requestPayload,
      responsePayload: result,
    });

    res.json({
      data: result,
      job,
    });
  }),
);

aiRouter.post(
  "/generate-learning-package",
  requireAuth,
  requireMentor,
  asyncHandler(async (req, res) => {
    const requestPayload = normalizeLearningPackageRequest(req.body);
    const generatedPackage = req.body.package || (await callOpenAILearningPackage(requestPayload));
    const result = normalizeLearningPackageResult(generatedPackage, requestPayload);
    result.videoLessons = await enrichVideoLessons(result.videoLessons);

    const job = await dataAdapter.createAiGenerationJob({
      requestedBy: req.user.id,
      requestPayload,
      responsePayload: result,
    });

    const created = requestPayload.persist
      ? await persistLearningPackage({ req, requestPayload, result })
      : null;

    res.status(requestPayload.persist ? 201 : 200).json({
      data: {
        package: result,
        created,
        job,
      },
    });
  }),
);
