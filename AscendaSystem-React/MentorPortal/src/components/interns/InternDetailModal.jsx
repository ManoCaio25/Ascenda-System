import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@padrinho/components/ui/dialog";
import { Badge } from "@padrinho/components/ui/badge";
import { Task } from "@padrinho/entities/Task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@padrinho/components/ui/tabs";
import PerformancePanel from "../interns/PerformancePanel";
import ActiveAssignments from "../interns/ActiveAssignments";
import Avatar from "../ui/Avatar";
import { Calendar, Trophy, Target, CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { getDaysLeft, getDaysLeftBadgeColor } from "../utils/dates";

export default function InternDetailModal({ intern, isOpen, onClose }) {
  const [tasks, setTasks] = React.useState([]);

  React.useEffect(() => {
    const loadTasks = async () => {
      if (intern) {
        const internTasks = await Task.filter({ assigned_to: intern.id });
        setTasks(internTasks);
      }
    };

    if (intern && isOpen) {
      loadTasks();
    }
  }, [intern, isOpen]);

  if (!intern) return null;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const daysLeft = intern.end_date ? getDaysLeft(intern.end_date) : null;
  const daysLeftColors = daysLeft !== null ? getDaysLeftBadgeColor(daysLeft) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-surface border-border text-primary shadow-e3 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand2 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                <Avatar 
                  src={intern.avatar_url} 
                  alt={intern.full_name}
                  size={60}
                />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-primary truncate">{intern.full_name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="bg-surface2 text-secondary border-border">
                  {intern.level}
                </Badge>
                <Badge variant="outline" className="text-muted">
                  {intern.track}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface2 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-brand2" />
                <span className="text-sm text-muted">Total Points</span>
              </div>
              <p className="text-2xl font-bold text-brand2">
                {intern.points}
              </p>
            </div>

            <div className="bg-surface2 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-success" />
                <span className="text-sm text-muted">Tasks Done</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {completedTasks}/{tasks.length}
              </p>
            </div>

            <div className="bg-surface2 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-brand" />
                <span className="text-sm text-muted">Start Date</span>
              </div>
              <p className="text-lg font-semibold text-primary">
                {intern.start_date ? format(new Date(intern.start_date), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>

            <div className="bg-surface2 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarCheck className="w-5 h-5 text-warning" />
                <span className="text-sm text-muted">End Date</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-primary mb-1">
                  {intern.end_date ? format(new Date(intern.end_date), 'MMM d, yyyy') : 'N/A'}
                </p>
                {daysLeft !== null && daysLeftColors && (
                  <Badge className={`${daysLeftColors.bg} ${daysLeftColors.text} border ${daysLeftColors.border} text-xs`}>
                    {daysLeft} days left
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-surface2">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="courses">Active Courses</TabsTrigger>
            </TabsList>
            <TabsContent value="performance" className="space-y-4 mt-4">
              <PerformancePanel intern={intern} />
              
              {intern.skills && intern.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {intern.skills.map((skill, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-surface2 text-secondary border-border"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="courses" className="mt-4">
              <ActiveAssignments internId={intern.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}