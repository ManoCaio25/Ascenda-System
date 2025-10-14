import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAscendaIAQuizGen } from "./hooks/useAscendaIAQuizGen";
import { SourceInputPanel } from "./components/SourceInputPanel";
import { SummaryPanel } from "./components/SummaryPanel";
import { QuizLevelsPanel } from "./components/QuizLevelsPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { SaveDraftBar } from "./components/SaveDraftBar";
import { ascendaIAStrings } from "./strings";
import { Button } from "@padrinho/components/ui/button";
import { PAGE_URLS } from "@padrinho/utils";

import "./styles/ascenda-quizz.css";

export default function AscendaIAQuizzesPage() {
  const {
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
  } = useAscendaIAQuizGen();
  const navigate = useNavigate();

  const handleSave = React.useCallback(() => {
    if (!quiz) return;
    const success = saveDraft();
    if (success) {
      window.alert(ascendaIAStrings.actions.saved);
    } else {
      window.alert(ascendaIAStrings.actions.saveError);
    }
  }, [quiz, saveDraft]);

  const handleDiscard = React.useCallback(() => {
    discard();
    setFeedback("");
  }, [discard, setFeedback]);

  return (
    <main data-quiz-scope className="min-h-screen bg-surface/30 px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-3 text-sm text-white/60">
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/10"
              onClick={() => navigate(PAGE_URLS.ContentManagement)}
            >
              {ascendaIAStrings.page.breadcrumbHome}
            </button>
            <span className="text-white/40">/</span>
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">
              {ascendaIAStrings.page.breadcrumbCurrent}
            </span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-white">{ascendaIAStrings.page.title}</h1>
              <p className="max-w-2xl text-sm text-white/70">{ascendaIAStrings.page.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
              <span>Powered by AscendaIA mock service</span>
            </div>
          </div>
        </motion.header>

        <section className="layout">
          <div className="flex flex-col gap-5">
            <SourceInputPanel
              topic={topic}
              setTopic={setTopic}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              textFile={textFile}
              setTextFile={setTextFile}
              errors={errors}
              setErrors={setErrors}
              onClearTextFile={clearTextFile}
              youtubeValid={youtubeValid}
            />

            <SummaryPanel
              levels={levels}
              setLevelEnabled={setLevelEnabled}
              setLevelCount={setLevelCount}
              totalRequested={totalRequested}
              canGenerate={canGenerate}
              loading={loading}
              onGenerate={generate}
              feedback={feedback}
            />
          </div>

          <div className="flex flex-col gap-5">
            <QuizLevelsPanel
              levels={levels}
              setLevelEnabled={setLevelEnabled}
              setLevelCount={setLevelCount}
            />
            <PreviewPanel quiz={quiz} />
          </div>
        </section>

        <SaveDraftBar quiz={quiz} onDiscard={handleDiscard} onSave={handleSave} />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
          <p>
            Need to attach quizzes back to a course? Return to the content dashboard when you are ready.
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(PAGE_URLS.ContentManagement)}
            className="mt-3 h-10 rounded-xl border border-white/10 bg-transparent text-white hover:bg-white/10"
          >
            Back to content management
          </Button>
        </div>
      </div>
    </main>
  );
}
