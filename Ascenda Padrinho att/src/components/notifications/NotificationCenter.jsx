import React, { useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@padrinho/components/ui/sheet";
import { Button } from "@padrinho/components/ui/button";
import { Badge } from "@padrinho/components/ui/badge";
import { CheckCheck, BookOpen, MessageCircle, Calendar, X, Bell } from "lucide-react";
import { format, isToday, isThisWeek } from "date-fns";

const NotificationIcon = ({ type }) => {
  const icons = {
    course_published: BookOpen,
    course_assigned: BookOpen,
    chat_message: MessageCircle,
    vacation_requested: Calendar,
    vacation_status_changed: Calendar,
    intern_paused: Bell,
    intern_resumed: Bell
  };
  const Icon = icons[type] || BookOpen;
  return <Icon className="w-5 h-5 text-brand" />;
};

function NotificationItem({ notification, onMarkRead }) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      notification.read 
        ? 'border-border bg-surface2 opacity-70' 
        : 'border-brand/30 bg-brand/5'
    }`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-surface2 border border-border flex-shrink-0">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-primary text-sm">
              {notification.title}
            </h4>
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkRead(notification.id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          {notification.body && (
            <p className="text-sm text-secondary mb-2">{notification.body}</p>
          )}
          {notification.actor_name && (
            <p className="text-xs text-muted">
              By {notification.actor_name}
            </p>
          )}
          <p className="text-xs text-muted mt-1">
            {format(new Date(notification.created_date), 'MMM d, h:mm a')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NotificationCenter({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAllRead,
  onMarkRead,
  onRefresh 
}) {
  const groupedNotifications = React.useMemo(() => {
    const groups = {
      today: [],
      thisWeek: [],
      older: []
    };

    notifications.forEach(notif => {
      const date = new Date(notif.created_date);
      if (isToday(date)) {
        groups.today.push(notif);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(notif);
      } else {
        groups.older.push(notif);
      }
    });

    return groups;
  }, [notifications]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  useEffect(() => {
    if (isOpen) {
      handleRefresh();
    }
  }, [isOpen, handleRefresh]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-surface border-border">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-primary">Notifications</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="text-brand hover:text-brand/80"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          {groupedNotifications.today.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted mb-3">Today</h3>
              <div className="space-y-2">
                {groupedNotifications.today.map(notif => (
                  <NotificationItem 
                    key={notif.id} 
                    notification={notif}
                    onMarkRead={onMarkRead}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.thisWeek.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted mb-3">This Week</h3>
              <div className="space-y-2">
                {groupedNotifications.thisWeek.map(notif => (
                  <NotificationItem 
                    key={notif.id} 
                    notification={notif}
                    onMarkRead={onMarkRead}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.older.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted mb-3">Earlier</h3>
              <div className="space-y-2">
                {groupedNotifications.older.map(notif => (
                  <NotificationItem 
                    key={notif.id} 
                    notification={notif}
                    onMarkRead={onMarkRead}
                  />
                ))}
              </div>
            </div>
          )}

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto mb-3 text-muted opacity-30" />
              <p className="text-muted">No notifications yet</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}