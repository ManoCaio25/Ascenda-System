import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Loader2,
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

function formatDate(language, isoDate) {
  if (!isoDate) return "";
  const formatter = new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return formatter.format(new Date(isoDate));
}

export default function ActivityGenerator() {
  const { t, language } = useTranslation();
  const [interns, setInterns] = useState([]);
  const [resourceTitle, setResourceTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [resourceFile, setResourceFile] = useState(null);
  const [activityCount, setActivityCount] = useState(3);
  const [quizCount, setQuizCount] = useState(5);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [generatedActivities, setGeneratedActivities] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [recentError, setRecentError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadInterns = async () => {
      const data = await Intern.list("full_name");
      setInterns(data);
    };
    loadInterns();
  }, []);

  const internLookup = useMemo(() => {
    const entries = new Map();
    interns.forEach((intern) => {
      entries.set(String(intern.id), intern);
    });
    return entries;
  }, [interns]);

  const loadGeneratedActivities = useCallback(async () => {
    setIsLoadingRecent(true);
    setRecentError(null);
    try {
      const [courses, assignments] = await Promise.all([
        Course.filter({ category: "AI Generated" }, "-created_date"),
        CourseAssignment.list("-assigned_date"),
      ]);

      const assignmentByCourse = new Map();
      assignments.forEach((assignment) => {
        if (!assignmentByCourse.has(assignment.course_id)) {
          assignmentByCourse.set(assignment.course_id, assignment);
        }
      });

      const mapped = courses.map((course) => {
        const metadata = course.generated_metadata ?? {};
        const assignment = assignmentByCourse.get(course.id);
        const internId =
          metadata.internId ?? metadata.intern_id ?? assignment?.intern_id ?? null;
        const internRecord = internId ? internLookup.get(String(internId)) : null;
        const internName =
          internRecord?.full_name ?? metadata.internName ?? internId ?? "-";

        const quizCount = metadata.quizCount ?? metadata.quiz_count ?? 0;
        const generatedAt = metadata.generatedAt ?? assignment?.assigned_date ?? course.created_date;
        const sourceType =
          metadata.sourceType ??
          (course.youtube_url ? "video" : course.file_url ? "document" : null);

        return {
          course,
          internName,
          quizCount,
          generatedAt,
          sourceType,
        };
      });

      setGeneratedActivities(mapped);
    } catch (error) {
      console.error("Failed to load generated activities", error);
      setRecentError(t("activityGenerator.recent.error"));
      setGeneratedActivities([]);
    } finally {
      setIsLoadingRecent(false);
    }
  }, [internLookup, t]);

  useEffect(() => {
    loadGeneratedActivities();
  }, [loadGeneratedActivities]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setResourceFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResourceFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setResourceFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setResourceTitle("");
    setDescription("");
    setVideoUrl("");
    setResourceFile(null);
    setActivityCount(3);
    setQuizCount(5);
    setSelectedIntern(null);
    setNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resourceSummary = useMemo(() => {
    if (resourceFile) {
      return `${resourceFile.name} · ${(resourceFile.size / 1024).toFixed(1)} KB`;
    }
    if (videoUrl.trim()) {
      return videoUrl.trim();
    }
    return t("activityGenerator.upload.noResource");
  }, [resourceFile, videoUrl, t]);

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

    setIsGenerating(true);

    try {
      const baseTitle = resourceTitle.trim();
      const createdAt = new Date().toISOString();
      const createdRecords = [];

      for (let index = 0; index < sanitizedActivityCount; index += 1) {
        const activityLabel = t("activityGenerator.generated.activityName", undefined, {
          index: index + 1,
        });

        const payload = {
          title: `${baseTitle} • ${activityLabel}`,
          description:
            description.trim() ||
            t("activityGenerator.generated.description", undefined, {
              resource: baseTitle,
              quizzes: sanitizedQuizCount,
            }),
          category: "AI Generated",
          difficulty: "Intermediate",
          duration_hours: Math.max(1, Math.ceil(sanitizedQuizCount * 0.5 + 1)),
          enrolled_count: 0,
          completion_rate: 0,
          tags: [
            "AI Generated",
            sourceType === "video" ? "Video" : "Document",
          ],
          generated_metadata: {
            sourceType,
            quizCount: sanitizedQuizCount,
            activityIndex: index + 1,
            generatedAt: createdAt,
            internId: selectedIntern,
            internName: chosenIntern?.full_name || selectedIntern,
            notes: notes.trim() || undefined,
          },
        };

        if (videoUrl.trim()) {
          const parsedId = parseYoutubeVideoId(videoUrl);
          payload.youtube_url = videoUrl.trim();
          if (parsedId) {
            payload.youtube_video_id = parsedId;
          }
        }

        if (resourceFile) {
          payload.file_url = resourceFile.dataUrl;
          payload.file_name = resourceFile.name;
          payload.file_mime = resourceFile.type;
        }

        const createdCourse = await Course.create(payload);
        await CourseAssignment.create({
          course_id: createdCourse.id,
          intern_id: selectedIntern,
          notes: notes.trim() || undefined,
        });

        createdRecords.push({
          course: createdCourse,
          internName: chosenIntern?.full_name || selectedIntern,
          quizCount: sanitizedQuizCount,
          generatedAt: createdAt,
          sourceType,
        });
      }

      setGeneratedActivities((previous) => [...createdRecords, ...previous]);
      setFeedback({
        type: "success",
        message: t("activityGenerator.feedback.success", undefined, {
          count: sanitizedActivityCount,
          name: chosenIntern?.full_name || selectedIntern,
        }),
      });
      resetForm();
      await loadGeneratedActivities();
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: t("activityGenerator.feedback.genericError"),
      });
    } finally {
      setIsGenerating(false);
    }
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
                  <Button type="submit" className="bg-brand text-white hover:bg-brand/90" disabled={isGenerating}>
                    {isGenerating ? t("activityGenerator.actions.generating") : t("activityGenerator.actions.generate")}
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

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-brand" />
            <h2 className="text-2xl font-semibold text-primary">
              {t("activityGenerator.recent.title")}
            </h2>
          </div>

          {isLoadingRecent ? (
            <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-surface2/40 flex flex-col items-center gap-3 text-muted">
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
              <p>{t("activityGenerator.recent.loading")}</p>
            </div>
          ) : recentError ? (
            <div className="border border-dashed border-error/30 rounded-2xl p-8 text-center bg-error/10 text-error">
              {recentError}
            </div>
          ) : generatedActivities.length === 0 ? (
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
                        {item.sourceType === "video" ? (
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
