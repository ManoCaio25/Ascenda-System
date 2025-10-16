import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@padrinho/components/ui/card";
import { Badge } from "@padrinho/components/ui/badge";
import { Button } from "@padrinho/components/ui/button";
import { BookOpen, Clock, Users, TrendingUp, Pencil, Eye, Youtube, FileText, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { CourseAssignment } from "@padrinho/entities/CourseAssignment";

export default function CourseCard({ course, index, onEdit, onPreview, onAssign }) {
  const [assignmentCount, setAssignmentCount] = useState(0);

  useEffect(() => {
    const loadAssignments = async () => {
      const assignments = await CourseAssignment.filter({ 
        course_id: course.id,
        status: ['assigned', 'in_progress']
      });
      setAssignmentCount(assignments.length);
    };
    loadAssignments();
  }, [course.id]);

  const difficultyColors = {
    "Beginner": "bg-green-500/20 text-success border-green-500/30",
    "Intermediate": "bg-yellow-500/20 text-warning border-yellow-500/30",
    "Advanced": "bg-red-500/20 text-error border-red-500/30"
  };

  const categoryColors = {
    "Technical": "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    "Leadership": "bg-purple-500/20 text-brand border-border",
    "Communication": "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30",
    "Design": "bg-orange-500/20 text-brand2 border-orange-500/30",
    "Business": "bg-green-500/20 text-success border-green-500/30",
    "AI Generated": "bg-brand/10 text-brand border-brand/30",
  };

  const hasMedia = course.youtube_video_id || course.file_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-border bg-surface hover:shadow-e2 transition-all duration-350 group shadow-e1">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary text-lg mb-2 group-hover:text-brand transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted line-clamp-2">{course.description}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface2 border border-border shrink-0">
                <BookOpen className="w-5 h-5 text-brand" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={categoryColors[course.category] + " border"}>
                {course.category}
              </Badge>
              <Badge className={difficultyColors[course.difficulty] + " border"}>
                {course.difficulty}
              </Badge>
              {course.youtube_video_id && (
                <Badge variant="outline" className="border-error/30 text-error bg-error/10">
                  <Youtube className="w-3 h-3 mr-1" />
                  YouTube
                </Badge>
              )}
              {course.file_url && (
                <Badge variant="outline" className="border-brand/30 text-brand bg-brand/10">
                  <FileText className="w-3 h-3 mr-1" />
                  {course.file_name || 'File'}
                </Badge>
              )}
              {assignmentCount > 0 && (
                <Badge variant="outline" className="border-brand2/30 text-brand2 bg-brand2/10">
                  <Users className="w-3 h-3 mr-1" />
                  {assignmentCount} active
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {course.duration_hours && (
                  <div className="flex items-center gap-1 text-muted">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration_hours}h</span>
                  </div>
                )}
                {course.enrolled_count > 0 && (
                  <div className="flex items-center gap-1 text-muted">
                    <Users className="w-4 h-4" />
                    <span>{course.enrolled_count}</span>
                  </div>
                )}
              </div>
              {course.completion_rate > 0 && (
                <div className="flex items-center gap-1 text-success">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">{course.completion_rate}%</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(course)}
                className="border-border hover:bg-surface2"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssign(course)}
                className="border-brand2/30 hover:bg-brand2/10 text-brand2"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Assign
              </Button>
              {hasMedia && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPreview(course)}
                  className="col-span-2 border-brand/30 hover:bg-brand/10 text-brand"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}