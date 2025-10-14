import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@padrinho/components/ui/card";
import { Badge } from "@padrinho/components/ui/badge";
import { Button } from "@padrinho/components/ui/button";
import { Progress } from "@padrinho/components/ui/progress";
import { CourseAssignment } from "@padrinho/entities/CourseAssignment";
import { Course } from "@padrinho/entities/Course";
import { BookOpen, Calendar, Clock, CheckCircle2, PlayCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function ActiveAssignments({ internId }) {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true);
      try {
        const assignmentsData = await CourseAssignment.filter({ 
          intern_id: internId,
          status: ['assigned', 'in_progress']
        }, '-assigned_date');

        const courseIds = [...new Set(assignmentsData.map(a => a.course_id))];
        const coursesData = await Promise.all(
          courseIds.map(id => Course.filter({ id }).then(arr => arr[0]))
        );
        
        const coursesMap = {};
        coursesData.forEach(course => {
          if (course) coursesMap[course.id] = course;
        });

        setAssignments(assignmentsData);
        setCourses(coursesMap);
      } catch (error) {
        console.error("Error loading assignments:", error);
      }
      setLoading(false);
    };

    if (internId) {
      loadAssignments();
    }
  }, [internId]);

  const handleUpdateStatus = async (assignmentId, newStatus) => {
    await CourseAssignment.update(assignmentId, { 
      status: newStatus,
      started_date: newStatus === 'in_progress' ? new Date().toISOString() : undefined
    });
    
    const updatedAssignments = await CourseAssignment.filter({ 
      intern_id: internId,
      status: ['assigned', 'in_progress']
    }, '-assigned_date');
    setAssignments(updatedAssignments);
  };

  if (loading) {
    return (
      <Card className="border-border bg-surface shadow-e1">
        <CardHeader>
          <CardTitle className="text-primary">Active Course Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card className="border-border bg-surface shadow-e1">
        <CardHeader>
          <CardTitle className="text-primary">Active Course Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted text-center py-8">No active course assignments</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    'assigned': { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/30' },
    'in_progress': { bg: 'bg-brand/20', text: 'text-brand', border: 'border-brand/30' },
  };

  return (
    <Card className="border-border bg-surface shadow-e1">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Active Course Assignments ({assignments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment, index) => {
            const course = courses[assignment.course_id];
            if (!course) return null;

            const colors = statusColors[assignment.status];
            const isStarted = assignment.status === 'in_progress';

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-xl p-4 bg-surface2 hover:shadow-e1 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-primary mb-1 truncate">{course.title}</h4>
                    <p className="text-sm text-muted line-clamp-2">{course.description}</p>
                  </div>
                  <Badge className={`${colors.bg} ${colors.text} border ${colors.border} shrink-0`}>
                    {assignment.status === 'assigned' ? 'Assigned' : 'In Progress'}
                  </Badge>
                </div>

                {assignment.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted mb-1">
                      <span>Progress</span>
                      <span>{assignment.progress}%</span>
                    </div>
                    <Progress value={assignment.progress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted mb-3">
                  {course.duration_hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration_hours}h</span>
                    </div>
                  )}
                  {assignment.assigned_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Assigned {format(new Date(assignment.assigned_date), 'MMM d')}</span>
                    </div>
                  )}
                  {assignment.due_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-error" />
                      <span className="text-error">Due {format(new Date(assignment.due_date), 'MMM d')}</span>
                    </div>
                  )}
                </div>

                {assignment.notes && (
                  <p className="text-xs text-muted italic mb-3 p-2 bg-surface rounded border border-border">
                    "{assignment.notes}"
                  </p>
                )}

                {!isStarted && (
                  <Button
                    onClick={() => handleUpdateStatus(assignment.id, 'in_progress')}
                    size="sm"
                    className="w-full bg-brand hover:bg-brand/90 text-white"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Course
                  </Button>
                )}

                {isStarted && assignment.progress < 100 && (
                  <Button
                    onClick={() => handleUpdateStatus(assignment.id, 'completed')}
                    size="sm"
                    variant="outline"
                    className="w-full border-success hover:bg-success/10 text-success"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}