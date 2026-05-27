import React from "react";
import { motion } from "framer-motion";
import { Upload, FileText, XCircle } from "lucide-react";
import { Input } from "@padrinho/components/ui/input";
import { Button } from "@padrinho/components/ui/button";
import { ascendaIAStrings } from "../strings";

const ACCEPTED_MIME = ["text/plain"];

function isTxtFile(file) {
  if (!file) return false;
  const extension = file.name?.toLowerCase().endsWith(".txt");
  const mimeAllowed = !file.type || ACCEPTED_MIME.includes(file.type);
  return extension || mimeAllowed;
}

export function SourceInputPanel({
  topic,
  setTopic,
  youtubeUrl,
  setYoutubeUrl,
  textFile,
  setTextFile,
  errors,
  setErrors,
  onClearTextFile,
  youtubeValid,
}) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = React.useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        setTextFile(null);
        setErrors((prev) => ({ ...prev, textFile: "" }));
        return;
      }

      if (!isTxtFile(file)) {
        setErrors((prev) => ({ ...prev, textFile: ascendaIAStrings.inputs.fileInvalidType }));
        setTextFile(null);
        return;
      }

      if (file.size > ascendaIAStrings.limits.maxFileSizeBytes) {
        setErrors((prev) => ({ ...prev, textFile: ascendaIAStrings.inputs.fileTooLarge }));
        setTextFile(null);
        return;
      }

      setErrors((prev) => ({ ...prev, textFile: "" }));
      setTextFile(file);
    },
    [setErrors, setTextFile],
  );

  const handleClearFile = React.useCallback(() => {
    onClearTextFile?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onClearTextFile]);

  const handleTopicChange = React.useCallback(
    (event) => {
      setTopic(event.target.value);
      setErrors((prev) => ({ ...prev, topic: "" }));
    },
    [setTopic, setErrors],
  );

  const handleYoutubeChange = React.useCallback(
    (event) => {
      const value = event.target.value;
      setYoutubeUrl(value);
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, youtubeUrl: "" }));
        return;
      }
      if (/^https?:\/\//i.test(value) && !youtubeValid) {
        setErrors((prev) => ({ ...prev, youtubeUrl: ascendaIAStrings.inputs.youtubeInvalid }));
      } else {
        setErrors((prev) => ({ ...prev, youtubeUrl: "" }));
      }
    },
    [setYoutubeUrl, setErrors, youtubeValid],
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="panel flex flex-col gap-6 border-border/60 bg-surface/80 p-6 shadow-e1 backdrop-blur-sm"
      aria-labelledby="ascenda-source-panel"
    >
      <div className="space-y-1">
        <h2 id="ascenda-source-panel" className="text-lg font-semibold text-white">
          {ascendaIAStrings.page.title}
        </h2>
        <p className="text-sm text-white/70">{ascendaIAStrings.page.subtitle}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="ascenda-topic" className="text-sm font-medium text-white">
            {ascendaIAStrings.inputs.topicLabel}
          </label>
          <Input
            id="ascenda-topic"
            type="text"
            value={topic}
            onChange={handleTopicChange}
            placeholder={ascendaIAStrings.inputs.topicPlaceholder}
            aria-describedby={errors.topic ? "ascenda-topic-error" : undefined}
            className="h-11 border-border/60 bg-background/70 text-white placeholder:text-white/40"
          />
          {errors.topic && (
            <p id="ascenda-topic-error" className="text-xs text-error">
              {errors.topic}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="ascenda-youtube" className="text-sm font-medium text-white">
            {ascendaIAStrings.inputs.youtubeLabel}
          </label>
          <Input
            id="ascenda-youtube"
            type="url"
            value={youtubeUrl}
            onChange={handleYoutubeChange}
            placeholder={ascendaIAStrings.inputs.youtubePlaceholder}
            aria-describedby={errors.youtubeUrl ? "ascenda-youtube-error" : undefined}
            className="h-11 border-border/60 bg-background/70 text-white placeholder:text-white/40"
          />
          {errors.youtubeUrl && (
            <p id="ascenda-youtube-error" className="text-xs text-error">
              {errors.youtubeUrl}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <span className="text-sm font-medium text-white">
            {ascendaIAStrings.inputs.uploadLabel}
          </span>
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4">
            <label
              htmlFor="ascenda-text-upload"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-transparent bg-background/10 p-6 text-center transition hover:border-white/30 hover:bg-background/20"
            >
              <Upload className="h-6 w-6 text-white/80" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white/90">
                  {textFile ? textFile.name : ascendaIAStrings.inputs.uploadButton}
                </p>
                <p className="text-xs text-white/60">{ascendaIAStrings.inputs.uploadHelper}</p>
              </div>
              <input
                ref={fileInputRef}
                id="ascenda-text-upload"
                type="file"
                accept=".txt,text/plain"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>

            {textFile && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>{textFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFile}
                  className="h-8 px-2 text-xs text-white/70 hover:bg-white/10"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  {ascendaIAStrings.inputs.removeFile}
                </Button>
              </div>
            )}
          </div>
          {errors.textFile && <p className="text-xs text-error">{errors.textFile}</p>}
        </div>
      </div>
    </motion.section>
  );
}
