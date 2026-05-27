import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@padrinho/components/ui/dialog";
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
import { Loader2, Youtube } from "lucide-react";
import YouTubePreview from "./YouTubePreview";
import { useTranslation } from "@padrinho/i18n";

export default function CourseEditModal({ course, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technical",
    difficulty: "Beginner",
    duration_hours: "",
    youtube_url: "",
    youtube_video_id: ""
  });
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "Technical",
        difficulty: course.difficulty || "Beginner",
        duration_hours: course.duration_hours?.toString() || "",
        youtube_url: course.youtube_url || "",
        youtube_video_id: course.youtube_video_id || ""
      });
    }
  }, [course]);

  const handleVideoIdChange = (videoId) => {
    setFormData(prev => ({ ...prev, youtube_video_id: videoId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration_hours: parseFloat(formData.duration_hours) || 0
      };

      if (formData.youtube_video_id) {
        updatedData.youtube_url = formData.youtube_url;
        updatedData.youtube_video_id = formData.youtube_video_id;
      } else {
        updatedData.youtube_url = null;
        updatedData.youtube_video_id = null;
      }

      await onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Error saving course:", error);
    }

    setIsSaving(false);
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-surface border-border text-primary">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {t("contentManagement.editModal.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title" className="text-secondary">
              {t("contentManagement.form.titleLabel")}
            </Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-surface2 border-border text-primary"
            />
          </div>

          <div>
            <Label htmlFor="edit-description" className="text-secondary">
              {t("contentManagement.form.descriptionLabel")}
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-surface2 border-border text-primary h-24"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-category" className="text-secondary">
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
              <Label htmlFor="edit-difficulty" className="text-secondary">
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
              <Label htmlFor="edit-duration" className="text-secondary">
                {t("common.labels.durationHours")}
              </Label>
              <Input
                id="edit-duration"
                type="number"
                step="0.5"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                className="bg-surface2 border-border text-primary"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-youtube" className="text-secondary flex items-center gap-2">
              <Youtube className="w-4 h-4 text-error" />
              {t("common.labels.youtubeOptional")}
            </Label>
            <Input
              id="edit-youtube"
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border"
            >
              {t("common.actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-brand hover:bg-brand/90 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.actions.saving")}
                </>
              ) : (
                t("common.actions.saveChanges")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}