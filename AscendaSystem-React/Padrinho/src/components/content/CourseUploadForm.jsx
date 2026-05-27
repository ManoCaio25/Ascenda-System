import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@padrinho/components/ui/card";
import { Button } from "@padrinho/components/ui/button";
import { Input } from "@padrinho/components/ui/input";
import { Textarea } from "@padrinho/components/ui/textarea";
import { Label } from "@padrinho/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@padrinho/components/ui/select";
import { UploadFile } from "@padrinho/integrations/Core";
import { Upload, Loader2, Youtube, Eye } from "lucide-react";
import YouTubePreview from "./YouTubePreview";
import { useTranslation } from "@padrinho/i18n";

export default function CourseUploadForm({ onSuccess, onPreview }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technical",
    difficulty: "Beginner",
    duration_hours: "",
    file_url: "",
    youtube_url: "",
    youtube_video_id: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const { t } = useTranslation();

  const categoryOptions = useMemo(
    () => [
      { value: "Technical", label: t("contentManagement.categories.technical") },
      { value: "Leadership", label: t("contentManagement.categories.leadership") },
      { value: "Communication", label: t("contentManagement.categories.communication") },
      { value: "Design", label: t("contentManagement.categories.design") },
      { value: "Business", label: t("contentManagement.categories.business") },
    ],
    [t],
  );

  const difficultyOptions = useMemo(
    () => [
      { value: "Beginner", label: t("contentManagement.difficulties.beginner") },
      { value: "Intermediate", label: t("contentManagement.difficulties.intermediate") },
      { value: "Advanced", label: t("contentManagement.difficulties.advanced") },
    ],
    [t],
  );

  const handleFileChange = React.useCallback(async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const preview = {
      file_name: selectedFile.name,
      file_mime: selectedFile.type,
      file_size: selectedFile.size,
      title: formData.title || selectedFile.name,
      description: formData.description
    };
    setPreviewData(preview);

    if (onPreview) {
      onPreview(preview);
    }
  }, [formData.title, formData.description, onPreview]);

  const handleVideoIdChange = React.useCallback((videoId) => {
    setFormData(prev => ({ ...prev, youtube_video_id: videoId }));
  }, []);

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let fileUrl = formData.file_url;
      let fileName = null;
      let fileMime = null;
      let fileSize = null;
      
      if (file) {
        const uploadResult = await UploadFile({ file });
        fileUrl = uploadResult.file_url;
        fileName = file.name;
        fileMime = file.type;
        fileSize = file.size;
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration_hours: parseFloat(formData.duration_hours) || 0,
        enrolled_count: 0,
        completion_rate: 0,
        published: true
      };

      if (fileUrl) {
        courseData.file_url = fileUrl;
        courseData.file_name = fileName;
        courseData.file_mime = fileMime;
        courseData.file_size = fileSize;
      }

      if (formData.youtube_video_id) {
        courseData.youtube_url = formData.youtube_url;
        courseData.youtube_video_id = formData.youtube_video_id;
      }

      await onSuccess(courseData);

      setFormData({
        title: "",
        description: "",
        category: "Technical",
        difficulty: "Beginner",
        duration_hours: "",
        file_url: "",
        youtube_url: "",
        youtube_video_id: ""
      });
      setFile(null);
      setPreviewData(null);
    } catch (error) {
      console.error("Error uploading course:", error);
    }

    setIsUploading(false);
  }, [formData, file, onSuccess]);

  return (
    <Card className="border-border bg-surface shadow-e1">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Upload className="w-5 h-5" />
          {t("contentManagement.form.header")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-secondary">
              {t("contentManagement.form.titleLabel")}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t("common.placeholders.courseTitleExample")}
              required
              className="bg-surface2 border-border text-primary placeholder:text-muted"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-secondary">
              {t("contentManagement.form.descriptionLabel")}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("common.placeholders.courseDescription")}
              required
              className="bg-surface2 border-border text-primary placeholder:text-muted h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category" className="text-secondary">
                {t("contentManagement.form.categoryLabel")}
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-surface2 border-border text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border">
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty" className="text-secondary">
                {t("contentManagement.form.difficultyLabel")}
              </Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger className="bg-surface2 border-border text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border">
                  {difficultyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration" className="text-secondary">
                {t("common.labels.durationHours")}
              </Label>
              <Input
                id="duration"
                type="number"
                step="0.5"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                placeholder={t("contentManagement.form.durationPlaceholder")}
                className="bg-surface2 border-border text-primary placeholder:text-muted"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="youtube" className="text-secondary flex items-center gap-2">
              <Youtube className="w-4 h-4 text-error" />
              {t("common.labels.youtubeOptional")}
            </Label>
            <Input
              id="youtube"
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              placeholder={t("common.placeholders.youtubeUrl")}
              className="bg-surface2 border-border text-primary placeholder:text-muted"
            />
            <YouTubePreview
              url={formData.youtube_url}
              onVideoIdChange={handleVideoIdChange}
            />
          </div>

          <div>
            <Label htmlFor="file" className="text-secondary">
              {t("common.labels.materialsOptional")}
            </Label>
            <div className="mt-2">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand transition-colors bg-surface2">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-brand" />
                  <span className="text-sm text-muted">
                    {file ? file.name : t("common.placeholders.uploadPrompt")}
                  </span>
                  {file && (
                    <span className="text-xs text-muted block mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="video/*,application/pdf,image/*,.docx,.pptx,.xlsx"
                />
              </label>
            </div>
          </div>

          {previewData && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onPreview && onPreview(previewData)}
              className="w-full border-brand/30 hover:bg-brand/10 text-brand"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t("contentManagement.form.previewDocument")}
            </Button>
          )}

          <Button
            type="submit"
            disabled={isUploading}
            className="w-full bg-brand hover:bg-brand/90 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("common.actions.uploading")}
              </>
            ) : (
              t("common.actions.upload")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}