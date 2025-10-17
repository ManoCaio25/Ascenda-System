import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  UploadCloud,
  ClipboardList,
  Wand2,
  UserPlus,
  BookOpen,
  FileText,
  Youtube,
  CheckCircle,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@padrinho/components/ui/button";
import { Input } from "@padrinho/components/ui/input";
import { Label } from "@padrinho/components/ui/label";
import { Textarea } from "@padrinho/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@padrinho/components/ui/card";
import { Badge } from "@padrinho/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@padrinho/components/ui/select";
import { useTranslation } from "@padrinho/i18n";
import { Intern } from "@padrinho/entities/Intern";
import { Course } from "@padrinho/entities/Course";
import { CourseAssignment } from "@padrinho/entities/CourseAssignment";

function parseYoutubeVideoId(url) {
  if (!url) return null;
  try {
    const trimmed = url.trim();
    const youtubeRegex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/i;
    const match = trimmed.match(youtubeRegex);
    if (match && match[1]) {
      return match[1];
    }
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes("youtube")) {
      return parsed.searchParams.get("v");
    }
  } catch (error) {
    return null;
  }
  return null;
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "about",
  "como",
  "para",
  "com",
  "uma",
  "das",
  "dos",
  "que",
  "por",
  "mais",
  "when",
  "your",
  "have",
  "will",
  "them",
  "their",
  "sobre",
  "entre",
  "cada",
  "onde",
  "elas",
  "eles",
  "aqui",
  "there",
  "porque",
  "does",
  "were",
  "essa",
  "esse",
  "http",
  "https",
  "www",
]);

function formatDate(language, isoDate) {
  if (!isoDate) return "";
  const formatter = new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return formatter.format(new Date(isoDate));
}

function cleanFileName(name) {
  if (!name) return "";
  return name.replace(/\.[^/.]+$/, "").replace(/[\-_]+/g, " ").trim();
}

function extractKeywords(text, limit = 8) {
  if (!text) return [];
  const normalized = text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ");
  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 3 && !STOP_WORDS.has(token));

  const frequencies = tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(frequencies)
    .sort((a, b) => {
      if (b[1] === a[1]) {
        return a[0].localeCompare(b[0]);
      }
      return b[1] - a[1];
    })
    .slice(0, limit)
    .map(([token]) => token.replace(/^(\p{L})/u, (match) => match.toUpperCase()));
}

function buildSummarySentences(text, fallback) {
  if (!text) {
    return fallback;
  }
  const sanitized = text.replace(/\s+/g, " ").trim();
  if (!sanitized) {
    return fallback;
  }
  const segments = sanitized.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (segments.length === 0) {
    return fallback;
  }
  return segments.slice(0, 2).join(" ");
}

function analyzeResource({
  resourceTitle,
  description,
  sourceType,
  resourceFile,
  videoUrl,
}) {
  const baseTitle =
    resourceTitle.trim() ||
    cleanFileName(resourceFile?.name) ||
    (sourceType === "video"
      ? (videoUrl ? "Video lesson" : "Video resource")
      : "Learning resource");

  const combinedText = [resourceTitle, description, cleanFileName(resourceFile?.name)]
    .filter(Boolean)
    .join(" ");

  const keywords = extractKeywords(combinedText, 8);
  const fallbackSummary =
    sourceType === "video"
      ? `This video explores ${baseTitle.toLowerCase()} and highlights ${keywords
          .slice(0, 3)
          .join(", ") || "core concepts"}.`
      : `This material introduces ${baseTitle.toLowerCase()} with practical scenarios to apply the knowledge.`;

  const summary = buildSummarySentences(description, fallbackSummary);

  const highlightedKeywords = keywords.length ? keywords : [baseTitle];

  return {
    topic: baseTitle,
    summary,
    keywords: highlightedKeywords.slice(0, 8),
  };
}

const activityAngles = [
  "Foundations",
  "Practical Application",
  "Collaboration",
  "Coaching",
  "Real-world Scenario",
  "Reflection",
];

const practicePrompts = [
  "Create a short outline showing how {{keyword}} improves {{topic}} for our interns.",
  "Record a quick demo or write a note that applies {{keyword}} to a real project in {{topic}}.",
  "Prepare a checklist that a new intern can follow to master {{keyword}} while working on {{topic}}.",
  "Draft a feedback message coaching a peer on how to use {{keyword}} inside {{topic}}.",
  "Design a mini-challenge where the intern solves a problem using {{keyword}}.",
  "Summarize the top pitfalls to avoid when implementing {{keyword}} in {{topic}}.",
];

const questionTemplates = [
  "What does {{keyword}} mean in the context of {{topic}}?",
  "How would you apply {{keyword}} to improve a delivery in {{topic}}?",
  "List two risks when ignoring {{keyword}} and how to mitigate them.",
  "Describe a scenario from the resource where {{keyword}} made a difference.",
  "Which metrics show that {{keyword}} was successful within {{topic}}?",
  "How can you coach a teammate to embrace {{keyword}} during a project?",
];

function fillTemplate(template, replacements) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, token) => {
    const key = token.trim();
    return replacements[key] ?? "";
  });
}

function buildCourseDescription(blueprint) {
  const objectives = blueprint.objectives
    .map((objective) => `• ${objective}`)
    .join("\n");
  const quiz = blueprint.quizQuestions.map((question) => `• ${question}`).join("\n");

  const sections = [
    blueprint.overview,
    objectives ? `Objectives:\n${objectives}` : null,
    blueprint.practice ? `Practice focus:\n${blueprint.practice}` : null,
    quiz ? `Sample questions:\n${quiz}` : null,
  ].filter(Boolean);

  return sections.join("\n\n");
}

function createActivityPlan({ analysis, activityCount, quizCount }) {
  const plan = [];
  const totalActivities = Math.max(1, activityCount);
  const questionTotal = Math.max(1, quizCount);
  const keywords = analysis.keywords.length ? analysis.keywords : [analysis.topic];

  for (let index = 0; index < totalActivities; index += 1) {
    const focusKeyword = keywords[index % keywords.length];
    const activityLabel = activityAngles[index % activityAngles.length];
    const replacements = {
      keyword: focusKeyword,
      topic: analysis.topic,
    };

    const objectives = [
      fillTemplate("Identify the core concepts behind {{keyword}} within {{topic}}.", replacements),
      fillTemplate("Apply {{keyword}} to a real scenario the intern may face.", replacements),
      fillTemplate("Evaluate success criteria when using {{keyword}} in {{topic}}.", replacements),
    ];

    const practice = fillTemplate(practicePrompts[index % practicePrompts.length], replacements);

    const quizQuestions = Array.from({ length: Math.min(questionTotal, questionTemplates.length) })
      .map((_, questionIndex) =>
        fillTemplate(questionTemplates[(index + questionIndex) % questionTemplates.length], replacements),
      );

    const overview = `${analysis.summary} This activity spotlights ${focusKeyword.toLowerCase()} through a ${activityLabel.toLowerCase()} lens.`;

    plan.push({
      title: `${analysis.topic}: ${activityLabel}`,
      overview,
      keyTopics: Array.from(
        new Set([
          focusKeyword,
          ...keywords.filter((keyword) => keyword !== focusKeyword).slice(0, 2),
        ]),
      ),
      objectives,
      practice,
      quizQuestions,
    });
  }

  return plan;
}

export default function ActivityGenerator() {
  const { t, language } = useTranslation();
  const [interns, setInterns] = useState([]);
  const [resourceTitle, setResourceTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceContent, setResourceContent] = useState("");
  const [resourceContentWords, setResourceContentWords] = useState(0);
  const [resourceContentSource, setResourceContentSource] = useState(null);
  const [isExtractingContent, setIsExtractingContent] = useState(false);
  const [activityCount, setActivityCount] = useState(3);
  const [quizCount, setQuizCount] = useState(5);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [notes, setNotes] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activityPreview, setActivityPreview] = useState(null);
  const [generatedActivities, setGeneratedActivities] = useState([]);
  const fileInputRef = useRef(null);
  const transcriptCacheRef = useRef(new Map());

  useEffect(() => {
    const loadInterns = async () => {
      const data = await Intern.list("full_name");
      setInterns(data);
    };
    loadInterns();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    setFeedback(null);

    if (!file) {
      setResourceFile(null);
      setResourceContent("");
      setResourceContentWords(0);
      setResourceContentSource(null);
      return;
    }

    setIsExtractingContent(true);

    try {
      const [dataUrl, extractedText] = await Promise.all([
        readFileAsDataUrl(file),
        extractTextFromFile(file),
      ]);

      const normalizedExtracted = normalizeContent(extractedText);
      const derivedSource = file.type?.startsWith("video/") ? "video" : "document";
      setResourceFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
      });
      setResourceContent(extractedText || "");
      setResourceContentWords(computeWordCount(normalizedExtracted));
      setResourceContentSource(derivedSource === "document" ? "document" : null);

      if (derivedSource === "document" && !normalizedExtracted && isTextLikeFile(file)) {
        setFeedback({
          type: "error",
          message: t("activityGenerator.feedback.emptyDocument"),
        });
      }
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: t("activityGenerator.feedback.unableToReadFile"),
      });
      setResourceFile(null);
      setResourceContent("");
      setResourceContentWords(0);
      setResourceContentSource(null);
    } finally {
      setIsExtractingContent(false);
    }
  };

  const handleRemoveFile = () => {
    setResourceFile(null);
    setResourceContent("");
    setResourceContentWords(0);
    setResourceContentSource(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setResourceTitle("");
    setDescription("");
    setVideoUrl("");
    setResourceFile(null);
    setResourceContent("");
    setResourceContentWords(0);
    setResourceContentSource(null);
    setActivityCount(3);
    setQuizCount(5);
    setSelectedIntern(null);
    setNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resourceSummary = useMemo(() => {
    if (isExtractingContent) {
      return t("activityGenerator.upload.extracting");
    }
    if (resourceFile) {
      const sizeLabel = `${resourceFile.name} · ${(resourceFile.size / 1024).toFixed(1)} KB`;
      if (resourceContentWords > 0) {
        return `${sizeLabel} · ${t("activityGenerator.upload.wordCount", undefined, {
          count: resourceContentWords,
        })}`;
      }
      return sizeLabel;
    }
    if (videoUrl.trim()) {
      return videoUrl.trim();
    }
    return t("activityGenerator.upload.noResource");
  }, [
    isExtractingContent,
    resourceFile,
    resourceContentWords,
    videoUrl,
    t,
  ]);

  const sourceType = useMemo(() => {
    if (videoUrl.trim()) return "video";
    if (resourceFile?.type?.startsWith("video/")) return "video";
    if (resourceFile) return "document";
    return null;
  }, [videoUrl, resourceFile]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setFeedback(null);

    const sanitizedActivityCount = Number(activityCount) || 0;
    const sanitizedQuizCount = Number(quizCount) || 0;

    if (isExtractingContent) {
      setFeedback({
        type: "error",
        message: t("activityGenerator.feedback.processingFile"),
      });
      return;
    }

    if (!resourceTitle.trim()) {
      setFeedback({
        type: "error",
        message: t("activityGenerator.feedback.missingTitle"),
      });
      return;
    }

    if (!resourceFile && !videoUrl.trim()) {
      setFeedback({
        type: "error",
        message: t("activityGenerator.feedback.missingResource"),
      });
      return;
    }

    if (!selectedIntern) {
      setFeedback({
        type: "error",
        message: t("activityGenerator.feedback.missingIntern"),
      });
      return;
    }

    if (sanitizedActivityCount < 1 || sanitizedQuizCount < 1) {
      setFeedback({
        type: "error",
        message: t("activityGenerator.feedback.missingCounts"),
      });
      return;
    }

    const chosenIntern = interns.find((intern) => String(intern.id) === String(selectedIntern));

    setIsPlanning(true);
    setActivityPreview(null);

    try {
      const analysis = analyzeResource({
        resourceTitle,
        description,
        sourceType,
        resourceFile,
        videoUrl,
      });

      const plan = createActivityPlan({
        analysis,
        activityCount: sanitizedActivityCount,
        quizCount: sanitizedQuizCount,
      });

      setActivityPreview({
        plan,
        analysis,
        sanitizedActivityCount,
        sanitizedQuizCount,
        internId: selectedIntern,
        internName: chosenIntern?.full_name || selectedIntern,
        notes: notes.trim(),
        sourceType,
        videoUrl: videoUrl.trim() || null,
        resourceFile: resourceFile
          ? {
              name: resourceFile.name,
              size: resourceFile.size,
              type: resourceFile.type,
              dataUrl: resourceFile.dataUrl,
            }
          : null,
        resourceTitle: resourceTitle.trim(),
        description: description.trim(),
        generatedAt: new Date().toISOString(),
      });

      setFeedback({
        type: "success",
        message: t("activityGenerator.feedback.previewReady", undefined, {
          count: sanitizedActivityCount,
        }),
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: t("activityGenerator.feedback.genericError"),
      });
    } finally {
      setIsPlanning(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!activityPreview) return;

    setFeedback(null);
    setIsSaving(true);

    try {
      const {
        plan,
        analysis,
        sanitizedQuizCount,
        internId,
        internName,
        notes: previewNotes,
        sourceType: previewSource,
        videoUrl: previewVideoUrl,
        resourceFile: previewFile,
        generatedAt,
      } = activityPreview;

      const createdAt = generatedAt || new Date().toISOString();
      const createdRecords = [];

      for (let index = 0; index < plan.length; index += 1) {
        const blueprint = plan[index];
        const payload = {
          title: blueprint.title,
          description: buildCourseDescription(blueprint),
          category: "AI Generated",
          difficulty: "Intermediate",
          duration_hours: Math.max(1, Math.ceil(sanitizedQuizCount * 0.5 + 1)),
          enrolled_count: 0,
          completion_rate: 0,
          tags: Array.from(
            new Set([
              "AI Generated",
              previewSource === "video" ? "Video" : "Document",
              ...blueprint.keyTopics.slice(0, 3),
            ]),
          ),
          generated_metadata: {
            sourceType: previewSource,
            quizCount: sanitizedQuizCount,
            activityIndex: index + 1,
            generatedAt: createdAt,
            internId,
            blueprint,
            analysis,
          },
        };

        if (previewVideoUrl) {
          const parsedId = parseYoutubeVideoId(previewVideoUrl);
          payload.youtube_url = previewVideoUrl;
          if (parsedId) {
            payload.youtube_video_id = parsedId;
          }
        }

        if (previewFile) {
          payload.file_url = previewFile.dataUrl;
          payload.file_name = previewFile.name;
          payload.file_mime = previewFile.type;
        }

        const createdCourse = await Course.create(payload);
        await CourseAssignment.create({
          course_id: createdCourse.id,
          intern_id: internId,
          notes: previewNotes || undefined,
        });

        createdRecords.push({
          course: createdCourse,
          internName,
          quizCount: sanitizedQuizCount,
          generatedAt: createdAt,
          blueprint,
          keyTopics: blueprint.keyTopics,
        });
      }

      setGeneratedActivities((previous) => [...createdRecords, ...previous]);
      setFeedback({
        type: "success",
        message: t("activityGenerator.feedback.success", undefined, {
          count: plan.length,
          name: internName,
        }),
      });
      setActivityPreview(null);
      resetForm();
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: t("activityGenerator.feedback.genericError"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearPreview = () => {
    setActivityPreview(null);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand2 flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                {t("activityGenerator.title")}
              </h1>
              <p className="text-muted">
                {t("activityGenerator.subtitle")}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>{t("activityGenerator.form.title")}</CardTitle>
              <CardDescription>{t("activityGenerator.form.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleGenerate}>
                {feedback && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      feedback.type === "success"
                        ? "bg-success/10 border-success/30 text-success"
                        : "bg-error/10 border-error/30 text-error"
                    }`}
                  >
                    {feedback.message}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resource-title">{t("activityGenerator.form.resourceTitle")}</Label>
                      <Input
                        id="resource-title"
                        value={resourceTitle}
                        onChange={(event) => setResourceTitle(event.target.value)}
                        placeholder={t("activityGenerator.form.resourceTitlePlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video-url">{t("activityGenerator.form.videoUrl")}</Label>
                      <Input
                        id="video-url"
                        value={videoUrl}
                        onChange={(event) => setVideoUrl(event.target.value)}
                        placeholder={t("activityGenerator.form.videoUrlPlaceholder")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("activityGenerator.form.uploadLabel")}</Label>
                    <div className="border border-dashed border-border rounded-xl p-4 bg-surface2/40">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 text-sm text-secondary">
                          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-primary">{t("activityGenerator.upload.hintTitle")}</p>
                            <p className="text-xs text-muted">{t("activityGenerator.upload.hintDescription")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            ref={fileInputRef}
                            id="resource-file"
                            type="file"
                            accept="video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-brand/40 text-brand hover:bg-brand/10"
                          >
                            {t("activityGenerator.upload.selectButton")}
                          </Button>
                          {resourceFile && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={handleRemoveFile}
                              className="text-muted hover:text-error"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("activityGenerator.upload.removeButton")}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted mt-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand" />
                        {resourceSummary}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t("activityGenerator.form.descriptionLabel")}</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder={t("activityGenerator.form.descriptionPlaceholder")}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity-count">{t("activityGenerator.form.activityCount")}</Label>
                    <Input
                      id="activity-count"
                      type="number"
                      min={1}
                      value={activityCount}
                      onChange={(event) => setActivityCount(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiz-count">{t("activityGenerator.form.quizCount")}</Label>
                    <Input
                      id="quiz-count"
                      type="number"
                      min={1}
                      value={quizCount}
                      onChange={(event) => setQuizCount(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intern-select">{t("activityGenerator.form.internLabel")}</Label>
                    <Select value={selectedIntern ?? undefined} onValueChange={setSelectedIntern}>
                      <SelectTrigger id="intern-select">
                        <SelectValue placeholder={t("activityGenerator.form.internPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {interns.map((intern) => (
                          <SelectItem key={intern.id} value={String(intern.id)}>
                            {intern.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("activityGenerator.form.notesLabel")}</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={t("activityGenerator.form.notesPlaceholder")}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-brand text-white hover:bg-brand/90"
                    disabled={isPlanning || isSaving}
                  >
                    {isPlanning
                      ? t("activityGenerator.actions.preparing")
                      : t("activityGenerator.actions.generatePreview")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle>{t("activityGenerator.summary.title")}</CardTitle>
              <CardDescription>{t("activityGenerator.summary.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{t("activityGenerator.summary.steps.upload.title")}</p>
                    <p className="text-sm text-muted">{t("activityGenerator.summary.steps.upload.description")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand2/10 text-brand2 flex items-center justify-center">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{t("activityGenerator.summary.steps.generate.title")}</p>
                    <p className="text-sm text-muted">{t("activityGenerator.summary.steps.generate.description")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{t("activityGenerator.summary.steps.assign.title")}</p>
                    <p className="text-sm text-muted">{t("activityGenerator.summary.steps.assign.description")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface2 text-brand flex items-center justify-center border border-border">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{t("activityGenerator.summary.steps.library.title")}</p>
                    <p className="text-sm text-muted">{t("activityGenerator.summary.steps.library.description")}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-border bg-surface2/60 p-4 text-sm text-muted">
                  <p>{t("activityGenerator.summary.currentResource")}</p>
                  <p className="text-primary font-medium mt-1">{resourceSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {activityPreview && (
          <Card className="border-brand/40 shadow-e1 bg-surface">
            <CardHeader>
              <CardTitle>{t("activityGenerator.preview.title")}</CardTitle>
              <CardDescription>
                {t("activityGenerator.preview.description", undefined, {
                  count: activityPreview.plan.length,
                  name: activityPreview.internName,
                  activityLabel: t(
                    activityPreview.plan.length === 1
                      ? "activityGenerator.preview.activitySingular"
                      : "activityGenerator.preview.activityPlural",
                  ),
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="uppercase tracking-wide text-xs">
                    {t(
                      `activityGenerator.preview.sourceType.${activityPreview.sourceType || "description"}`,
                    )}
                  </Badge>
                  <Badge variant="outline">
                    {t("activityGenerator.preview.quizCountBadge", undefined, {
                      count: activityPreview.sanitizedQuizCount,
                    })}
                  </Badge>
                  <Badge variant="outline">
                    {t("activityGenerator.preview.assignee", undefined, {
                      name: activityPreview.internName,
                    })}
                  </Badge>
                </div>
                <p className="text-sm text-secondary leading-relaxed">
                  {activityPreview.analysis.summary}
                </p>
                {activityPreview.analysis.keywords.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                      {t("activityGenerator.preview.keyTopicsTitle")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activityPreview.analysis.keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          className="bg-brand/10 text-brand border-brand/20"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {activityPreview.plan.map((blueprint, index) => (
                  <div
                    key={`${blueprint.title}-${index}`}
                    className="rounded-2xl border border-border bg-surface2/60 p-5 space-y-4"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
                        <span>
                          {t("activityGenerator.preview.activityHeading", undefined, {
                            index: index + 1,
                          })}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-brand" />
                        <span>{blueprint.title}</span>
                      </div>
                      <p className="text-sm text-secondary leading-relaxed">{blueprint.overview}</p>
                      {blueprint.keyTopics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {blueprint.keyTopics.map((topic) => (
                            <Badge key={topic} variant="outline" className="bg-surface text-secondary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {t("activityGenerator.preview.objectivesTitle")}
                        </p>
                        <ul className="list-disc pl-5 text-sm text-secondary space-y-1">
                          {blueprint.objectives.map((objective, objectiveIndex) => (
                            <li key={`${objective}-${objectiveIndex}`}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {t("activityGenerator.preview.practiceTitle")}
                        </p>
                        <p className="text-sm text-secondary leading-relaxed">{blueprint.practice}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {t("activityGenerator.preview.quizTitle", undefined, {
                            count: blueprint.quizQuestions.length,
                            questionLabel: t(
                              blueprint.quizQuestions.length === 1
                                ? "activityGenerator.preview.questionSingular"
                                : "activityGenerator.preview.questionPlural",
                            ),
                          })}
                        </p>
                        <ul className="list-disc pl-5 text-sm text-secondary space-y-1">
                          {blueprint.quizQuestions.map((question, questionIndex) => (
                            <li key={`${question}-${questionIndex}`}>{question}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearPreview}
                  disabled={isSaving}
                  className="text-muted hover:text-error"
                >
                  {t("activityGenerator.actions.clearPreview")}
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmSave}
                  className="bg-brand text-white hover:bg-brand/90"
                  disabled={isSaving}
                >
                  {isSaving
                    ? t("activityGenerator.actions.saving")
                    : t("activityGenerator.actions.confirm")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-brand" />
            <h2 className="text-2xl font-semibold text-primary">
              {t("activityGenerator.recent.title")}
            </h2>
          </div>

          {generatedActivities.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-surface2/40">
              <p className="text-muted">{t("activityGenerator.recent.empty")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {generatedActivities.map((item, index) => (
                <motion.div
                  key={`${item.course.id}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-border bg-surface shadow-e1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{item.course.title}</CardTitle>
                      <CardDescription>{item.course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>{t("activityGenerator.recent.assigned", undefined, { name: item.internName })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        {item.course.youtube_url ? (
                          <Youtube className="w-4 h-4 text-error" />
                        ) : (
                          <FileText className="w-4 h-4 text-brand" />
                        )}
                        <span>
                          {t("activityGenerator.recent.quizCount", undefined, { count: item.quizCount })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <Sparkles className="w-4 h-4 text-brand" />
                        <span>{t("activityGenerator.recent.generatedAt", undefined, {
                          date: formatDate(language, item.generatedAt),
                        })}</span>
                      </div>
                      {item.keyTopics?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.keyTopics.map((topic) => (
                            <Badge key={topic} variant="outline" className="bg-surface2 text-secondary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {item.blueprint && (
                        <div className="space-y-3 border-t border-border/60 pt-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                              {t("activityGenerator.preview.objectivesTitle")}
                            </p>
                            <ul className="list-disc pl-5 text-xs text-secondary space-y-1">
                              {item.blueprint.objectives.map((objective, objectiveIndex) => (
                                <li key={`${item.course.id}-objective-${objectiveIndex}`}>{objective}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                              {t("activityGenerator.preview.practiceTitle")}
                            </p>
                            <p className="text-xs text-secondary leading-relaxed">{item.blueprint.practice}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                              {t("activityGenerator.preview.quizTitle", undefined, {
                                count: item.blueprint.quizQuestions.length,
                                questionLabel: t(
                                  item.blueprint.quizQuestions.length === 1
                                    ? "activityGenerator.preview.questionSingular"
                                    : "activityGenerator.preview.questionPlural",
                                ),
                              })}
                            </p>
                            <ul className="list-disc pl-5 text-xs text-secondary space-y-1">
                              {item.blueprint.quizQuestions.map((question, questionIndex) => (
                                <li key={`${item.course.id}-question-${questionIndex}`}>{question}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
