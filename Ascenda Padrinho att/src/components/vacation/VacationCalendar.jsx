import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@padrinho/components/ui/button";
import { Badge } from "@padrinho/components/ui/badge";
import { Card, CardContent } from "@padrinho/components/ui/card";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isWithinInterval, addMonths, subMonths, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { Task } from "@padrinho/entities/Task";

export default function VacationCalendar({ requests, interns }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  React.useEffect(() => {
    const loadTasks = async () => {
      const tasksData = await Task.list();
      setTasks(tasksData);
    };
    loadTasks();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const internsById = useMemo(() => {
    return Object.fromEntries(interns.map(i => [i.id, i]));
  }, [interns]);

  const approvedRequests = useMemo(() => {
    return requests.filter(r => r.status === 'approved');
  }, [requests]);

  const pendingRequests = useMemo(() => {
    return requests.filter(r => r.status === 'pending');
  }, [requests]);

  const getRequestsForDay = useCallback((day) => {
    return approvedRequests.filter(request => {
      const start = new Date(request.start_date);
      const end = new Date(request.end_date);
      return isWithinInterval(day, { start, end });
    });
  }, [approvedRequests]);

  const getPendingForDay = useCallback((day) => {
    return pendingRequests.filter(request => {
      const start = new Date(request.start_date);
      const end = new Date(request.end_date);
      return isWithinInterval(day, { start, end });
    });
  }, [pendingRequests]);

  const conflicts = useMemo(() => {
    const conflictList = [];
    
    approvedRequests.forEach(vacation => {
      const vacationStart = new Date(vacation.start_date);
      const vacationEnd = new Date(vacation.end_date);
      
      const internTasks = tasks.filter(t => 
        t.assigned_to === vacation.intern_id && 
        t.status !== 'completed' &&
        t.deadline
      );
      
      internTasks.forEach(task => {
        const deadline = new Date(task.deadline);
        if (isWithinInterval(deadline, { start: vacationStart, end: vacationEnd })) {
          const intern = internsById[vacation.intern_id];
          conflictList.push({
            vacation,
            task,
            intern,
            deadline: task.deadline
          });
        }
      });
    });
    
    return conflictList;
  }, [approvedRequests, tasks, internsById]);

  const getConflictsForDay = useCallback((day) => {
    return conflicts.filter(c => isSameDay(new Date(c.deadline), day));
  }, [conflicts]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      handlePrevMonth();
    } else if (e.key === 'ArrowRight') {
      handleNextMonth();
    }
  }, [handlePrevMonth, handleNextMonth]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-primary">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="border-border"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="border-border"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="border-border"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <Card className="border-error/30 bg-error/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-error mb-2">
                  {conflicts.length} Scheduling Conflict{conflicts.length !== 1 ? 's' : ''} Detected
                </h4>
                <div className="space-y-2 text-sm">
                  {conflicts.slice(0, 3).map((conflict, idx) => (
                    <p key={idx} className="text-secondary">
                      <span className="font-medium">{conflict.intern?.full_name}</span> has task "{conflict.task.title}" 
                      due on {format(new Date(conflict.deadline), 'MMM d')} during vacation
                    </p>
                  ))}
                  {conflicts.length > 3 && (
                    <p className="text-muted">...and {conflicts.length - 3} more</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-surface2 p-2 text-center">
            <span className="text-xs font-semibold text-secondary">{day}</span>
          </div>
        ))}

        {days.map(day => {
          const dayRequests = getRequestsForDay(day);
          const dayPending = getPendingForDay(day);
          const dayConflicts = getConflictsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`bg-surface min-h-24 p-2 ${
                !isCurrentMonth ? 'opacity-40' : ''
              } ${isTodayDate ? 'ring-2 ring-brand' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isTodayDate ? 'text-brand' : 'text-primary'
                }`}>
                  {format(day, 'd')}
                </span>
                {dayConflicts.length > 0 && (
                  <Badge variant="destructive" className="h-5 px-1 text-xs">
                    !
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {dayRequests.map(request => {
                  const intern = internsById[request.intern_id];
                  return (
                    <div
                      key={request.id}
                      className="text-xs p-1 rounded bg-success/20 text-success border border-success/30 truncate"
                      title={`${intern?.full_name || 'Unknown'} - ${request.reason}`}
                    >
                      {intern?.avatar_url} {intern?.full_name?.split(' ')[0]}
                    </div>
                  );
                })}

                {dayPending.map(request => {
                  const intern = internsById[request.intern_id];
                  return (
                    <div
                      key={request.id}
                      className="text-xs p-1 rounded bg-warning/20 text-warning border border-warning/30 border-dashed truncate"
                      title={`${intern?.full_name || 'Unknown'} - Pending: ${request.reason}`}
                    >
                      {intern?.avatar_url} {intern?.full_name?.split(' ')[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/20 border border-success/30"></div>
          <span className="text-secondary">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30 border-dashed"></div>
          <span className="text-secondary">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center text-xs">!</Badge>
          <span className="text-secondary">Conflict</span>
        </div>
      </div>
    </div>
  );
}