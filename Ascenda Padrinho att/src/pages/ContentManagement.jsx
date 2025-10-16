import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Course } from "@padrinho/entities/Course";
import { motion } from "framer-motion";
import CourseUploadForm from "../components/content/CourseUploadForm";
import CourseCard from "../components/content/CourseCard";
import CourseEditModal from "../components/content/CourseEditModal";
import PreviewDrawer from "../components/media/PreviewDrawer";
import AssignCourseModal from "../components/courses/AssignCourseModal";
import { useTranslation } from "@padrinho/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@padrinho/components/ui/select";
import { Label } from "@padrinho/components/ui/label";

export default function ContentManagement() {
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewCourse, setPreviewCourse] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");
  const { t } = useTranslation();

  const loadCourses = useCallback(async () => {
    const data = await Course.list('-created_date');
    setCourses(data);
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleCourseCreate = useCallback(async (courseData) => {
    await Course.create(courseData);
    loadCourses();
  }, [loadCourses]);

  const handleEdit = useCallback((course) => {
    setEditingCourse(course);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async (updatedData) => {
    await Course.update(editingCourse.id, updatedData);
    loadCourses();
  }, [editingCourse, loadCourses]);

  const handlePreview = useCallback((course) => {
    setPreviewCourse(course);
    setIsPreviewOpen(true);
  }, []);

  const handleFormPreview = useCallback((previewData) => {
    setPreviewCourse(previewData);
    setIsPreviewOpen(true);
  }, []);

  const handleAssign = useCallback((course) => {
    setAssigningCourse(course);
    setIsAssignModalOpen(true);
  }, []);

  const handleAssignSuccess = useCallback(() => {
    loadCourses();
  }, [loadCourses]);

  const filterOptions = useMemo(
    () => [
      { value: "all", label: t("contentManagement.library.filters.all") },
      { value: "generated", label: t("contentManagement.library.filters.generated") },
      { value: "manual", label: t("contentManagement.library.filters.manual") },
      { value: "video", label: t("contentManagement.library.filters.video") },
      { value: "document", label: t("contentManagement.library.filters.document") },
    ],
    [t],
  );

  const filteredCourses = useMemo(() => {
    if (courseFilter === "all") {
      return courses;
    }

    return courses.filter((course) => {
      const isGenerated = Boolean(course.generated_metadata);
      const hasVideo = Boolean(course.youtube_url || course.youtube_video_id);
      const hasDocument = Boolean(course.file_url);

      switch (courseFilter) {
        case "generated":
          return isGenerated;
        case "manual":
          return !isGenerated;
        case "video":
          return hasVideo;
        case "document":
          return hasDocument;
        default:
          return true;
      }
    });
  }, [courses, courseFilter]);

  const courseCountLabel = useMemo(
    () => t("common.misc.courseLibraryCount", undefined, { count: filteredCourses.length }),
    [filteredCourses.length, t],
  );

  const emptyStateMessage = useMemo(
    () =>
      courses.length === 0
        ? t("contentManagement.library.empty")
        : t("contentManagement.library.emptyFiltered"),
    [courses.length, t],
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {t("contentManagement.title")}
          </h1>
          <p className="text-muted">{t("contentManagement.subtitle")}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CourseUploadForm
              onSuccess={handleCourseCreate}
              onPreview={handleFormPreview}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  {t("contentManagement.library.title")}
                </h2>
                <span className="text-sm text-muted">{courseCountLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="course-filter" className="text-sm text-muted">
                  {t("contentManagement.library.filterLabel")}
                </Label>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger id="course-filter" className="w-48">
                    <SelectValue placeholder={t("contentManagement.library.filters.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  onEdit={handleEdit}
                  onPreview={handlePreview}
                  onAssign={handleAssign}
                />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12 bg-surface2 border border-border rounded-xl">
                <p className="text-muted">{emptyStateMessage}</p>
              </div>
            )}
          </div>
        </div>

        <CourseEditModal
          course={editingCourse}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />

        <PreviewDrawer
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          course={previewCourse}
        />

        <AssignCourseModal
          course={assigningCourse}
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={handleAssignSuccess}
        />
      </div>
    </div>
  );
}