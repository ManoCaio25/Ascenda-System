import { useCallback, useMemo, useState } from "react";
import { ascendaIAClient } from "../services/ascendaIAClient";
import { ascendaIAStrings } from "../strings";

const LEVEL_MAP = [
  ascendaIAStrings.levels.easy,
  ascendaIAStrings.levels.intermediate,
  ascendaIAStrings.levels.advanced,
];

const DEFAULT_ERRORS = Object.freeze({ topic: "", youtubeUrl: "", textFile: "" });

function sanitizeCount(value) {
  if (value === "") return 0;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(ascendaIAStrings.limits.maxItemsPerLevel, Math.round(numeric)));
}

const YOUTUBE_REGEX = /^(https?:\/\/)?((www\.)?(youtube\.com|youtu\.be))(\/.*)?$/i;

export function useAscendaIAQuizGen() {
  const [topic, setTopic] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [textFile, setTextFileState] = useState(null);
  const [textFileContent, setTextFileContent] = useState("");
  const [errors, setErrors] = useState(DEFAULT_ERRORS);
  const [levels, setLevels] = useState(() =>
    LEVEL_MAP.map((level) => ({
      ...level,
      enabled: true,
      count: level.defaultCount,
    })),
  );
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [feedback, setFeedback] = useState("");

  const totalRequested = useMemo(
    () =>
      levels.reduce(
        (acc, level) => acc + (level.enabled ? Number(level.count || 0) : 0),
        0,
      ),
    [levels],
  );

  const youtubeValid = useMemo(() => {
    const value = youtubeUrl.trim();
    if (!value) return false;
    return YOUTUBE_REGEX.test(value);
  }, [youtubeUrl]);

  const hasTextSource = textFileContent.trim().length > 0;
  const topicProvided = topic.trim().length > 0;

  const resolvedSource = useMemo(() => {
    if (youtubeValid) {
      return {
        type: "youtube",
        value: youtubeUrl.trim(),
      };
    }
    if (hasTextSource) {
      return {
        type: "text",
        value: textFileContent.trim(),
      };
    }
    if (topicProvided) {
      return {
        type: "topic",
        value: topic.trim(),
      };
    }
    return null;
  }, [youtubeValid, youtubeUrl, hasTextSource, textFileContent, topicProvided, topic]);

  const canGenerate = Boolean(resolvedSource) && totalRequested > 0;

  const setLevelEnabled = useCallback((code, enabled) => {
    setLevels((prev) =>
      prev.map((level) =>
        level.code === code
          ? {
              ...level,
              enabled,
            }
          : level,
      ),
    );
  }, []);

  const setLevelCount = useCallback((code, value) => {
    setLevels((prev) =>
      prev.map((level) =>
        level.code === code
          ? {
              ...level,
              count: sanitizeCount(value),
            }
          : level,
      ),
    );
  }, []);

  const setTextFile = useCallback((file) => {
    setTextFileState(file);
    if (!file) {
      setTextFileContent("");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result ?? "";
      setTextFileContent(typeof text === "string" ? text : "");
    };
    reader.onerror = () => {
      setErrors((prev) => ({ ...prev, textFile: ascendaIAStrings.feedback.generationError }));
      setTextFileContent("");
    };
    reader.readAsText(file, "utf-8");
  }, [setErrors]);

  const clearTextFile = useCallback(() => {
    setTextFile(null);
    setErrors((prev) => ({ ...prev, textFile: "" }));
  }, [setTextFile, setErrors]);

  const normalizeTopic = useCallback(() => {
    if (topicProvided) return topic.trim();
    if (resolvedSource?.type === "youtube") {
      return ascendaIAStrings.fallbacks.youtubeTopic;
    }
    if (resolvedSource?.type === "text") {
      return ascendaIAStrings.fallbacks.documentTopic;
    }
    return "";
  }, [topicProvided, topic, resolvedSource]);

  const buildCounts = useCallback(
    () =>
      levels.reduce(
        (acc, level) => {
          acc[level.code] = level.enabled ? Number(level.count || 0) : 0;
          return acc;
        },
        {},
      ),
    [levels],
  );

  const generate = useCallback(async () => {
    if (!canGenerate || !resolvedSource) {
      setFeedback(ascendaIAStrings.inputs.sourceRequired);
      return;
    }

    const payload = {
      topic: normalizeTopic(),
      youtubeUrl: resolvedSource.type === "youtube" ? resolvedSource.value : null,
      textContent: resolvedSource.type === "text" ? resolvedSource.value : null,
      counts: buildCounts(),
    };

    if (Object.values(payload.counts).every((count) => count === 0)) {
      setFeedback(ascendaIAStrings.inputs.sourceRequired);
      return;
    }

    setLoading(true);
    setQuiz(null);
    setFeedback("");

    try {
      const result = await ascendaIAClient.generateQuizzes(payload);
      setQuiz(result);
    } catch (error) {
      console.error("AscendaIA generation failed", error);
      setFeedback(ascendaIAStrings.feedback.generationError);
    } finally {
      setLoading(false);
    }
  }, [buildCounts, canGenerate, normalizeTopic, resolvedSource]);

  const discard = useCallback(() => {
    setQuiz(null);
    setFeedback("");
  }, []);

  const saveDraft = useCallback(() => {
    if (!quiz) return false;

    try {
      const key = "ascenda_quizzes";
      const existing = JSON.parse(window.localStorage.getItem(key) || "[]");
      const breakdown = {
        easy: quiz.easy.length,
        intermediate: quiz.intermediate.length,
        advanced: quiz.advanced.length,
      };

      existing.push({
        id: `quiz_${Date.now()}`,
        topic: quiz.topic,
        source: quiz.source,
        createdBy: quiz.createdBy,
        createdAt: quiz.createdAt,
        items: [...quiz.easy, ...quiz.intermediate, ...quiz.advanced],
        breakdown,
        status: "draft",
      });

      window.localStorage.setItem(key, JSON.stringify(existing));
      return true;
    } catch (error) {
      console.error("Failed to save quiz", error);
      return false;
    }
  }, [quiz]);

  return {
    topic,
    setTopic,
    youtubeUrl,
    setYoutubeUrl,
    textFile,
    setTextFile,
    clearTextFile,
    errors,
    setErrors,
    levels,
    setLevelEnabled,
    setLevelCount,
    totalRequested,
    canGenerate,
    loading,
    generate,
    quiz,
    discard,
    saveDraft,
    feedback,
    setFeedback,
    youtubeValid,
    hasTextSource,
    resolvedSource,
  };
}
