import { apiRequest } from "../../../services/apiClient";

const ACCENT_MAP = {
  easy: "sky",
  intermediate: "violet",
  advanced: "fuchsia",
};

const LEVELS = ["easy", "intermediate", "advanced"];

function flattenGeneratedQuestions(result) {
  return (result.activities || []).flatMap((activity) =>
    (activity.questions || []).map((question) => ({
      activityTitle: activity.title,
      prompt: question.prompt,
      options: question.options || [],
      correctAnswer: question.correctAnswer || "",
      rubric: question.rubric || "",
    })),
  );
}

function toLevelQuestions(questions, counts, source) {
  let cursor = 0;
  return LEVELS.reduce((acc, level) => {
    const count = Math.max(0, Number(counts?.[level] || 0));
    const slice = questions.slice(cursor, cursor + count);
    cursor += count;
    acc[level] = slice.map((question, index) => ({
      id: `${level}-${index + 1}`,
      level,
      prompt: question.prompt,
      options: question.options,
      correctIndex: question.options.findIndex((option) => option === question.correctAnswer),
      correctAnswer: question.correctAnswer,
      rubric: question.rubric,
      source,
    }));
    return acc;
  }, {});
}

export const ascendaIAClient = {
  async generateQuizzes(request) {
    const totalRequested = LEVELS.reduce(
      (total, level) => total + Math.max(0, Number(request.counts?.[level] || 0)),
      0,
    );

    const result = await apiRequest("/ai/generate-activities", {
      method: "POST",
      body: {
        sourceTitle: request.topic,
        sourceText: request.textContent,
        sourceUrl: request.youtubeUrl,
        activityCount: 1,
        questionCount: totalRequested,
      },
    });
    const source = request.youtubeUrl || (request.textContent ? "text document" : request.topic);
    const grouped = toLevelQuestions(flattenGeneratedQuestions(result), request.counts, source);

    return {
      topic: result.title || request.topic,
      source,
      createdBy: "AscendaIA",
      createdAt: new Date().toISOString(),
      easy: grouped.easy || [],
      intermediate: grouped.intermediate || [],
      advanced: grouped.advanced || [],
    };
  },
};

export { ACCENT_MAP };
