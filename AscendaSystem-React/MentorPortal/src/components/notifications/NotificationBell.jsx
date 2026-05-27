import React, { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@padrinho/components/ui/button";
import { Badge } from "@padrinho/components/ui/badge";
import { Notification } from "@padrinho/entities/Notification";
import NotificationCenter from "./NotificationCenter";
import { eventBus } from "../utils/eventBus";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    const data = await Notification.list('-created_date', 50);
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  }, []);

  useEffect(() => {
    loadNotifications();

    const handleNewNotification = () => {
      loadNotifications();
    };

    eventBus.on('*', handleNewNotification);

    return () => {
      eventBus.off('*', handleNewNotification);
    };
  }, [loadNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(
      unread.map(n => Notification.update(n.id, { read: true }))
    );
    loadNotifications();
  }, [notifications, loadNotifications]);

  const handleMarkRead = useCallback(async (id) => {
    await Notification.update(id, { read: true });
    loadNotifications();
  }, [loadNotifications]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative rounded-xl border-border bg-surface hover:bg-surface2 transition-all duration-350"
      >
        <Bell className="w-4 h-4 text-secondary" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-error text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onMarkRead={handleMarkRead}
        onRefresh={loadNotifications}
      />
    </>
  );
}