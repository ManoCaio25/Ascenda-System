import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@padrinho/components/ui/sheet";
import { Button } from "@padrinho/components/ui/button";
import { Textarea } from "@padrinho/components/ui/textarea";
import { Send } from "lucide-react";
import { ChatMessage } from "@padrinho/entities/ChatMessage";
import { format } from "date-fns";
import { eventBus, EventTypes } from "../utils/eventBus";

function getInitials(name = "") {
  const [first = "", second = ""] = name.trim().split(/\s+/);
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || "?";
}

function isImageAvatar(value = "") {
  return /^(https?:|data:image\/)/i.test(value);
}

function formatMessageTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : format(date, "h:mm a");
}

function ChatAvatar({ intern }) {
  const avatar = intern.avatar_url || "";

  if (isImageAvatar(avatar)) {
    return (
      <img
        src={avatar}
        alt={intern.full_name || "Intern avatar"}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <span className={avatar ? "text-2xl" : "text-sm font-semibold text-white"}>
      {avatar || getInitials(intern.full_name)}
    </span>
  );
}

export default function ChatDrawer({ isOpen, onClose, intern }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!intern) return;

    try {
      setErrorMessage("");
      const data = await ChatMessage.filter({ intern_id: intern.id }, "-created_date");
      setMessages([...data].reverse());

      const unreadMessages = data.filter((message) => message.from === "intern" && !message.read);
      await Promise.all(
        unreadMessages.map((message) => ChatMessage.update(message.id, { read: true })),
      );
    } catch (error) {
      console.error("Error loading messages:", error);
      setErrorMessage("Could not load this conversation.");
    }
  }, [intern]);

  useEffect(() => {
    if (isOpen && intern) {
      loadMessages();
    }
  }, [isOpen, intern, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !intern || isSending) return;

    setIsSending(true);
    try {
      setErrorMessage("");
      await ChatMessage.create({
        intern_id: intern.id,
        from: "manager",
        text: newMessage.trim(),
        read: true,
      });

      eventBus.emit(EventTypes.CHAT_MESSAGE, {
        internId: intern.id,
        from: "manager",
      });

      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("Could not send this message.");
    } finally {
      setIsSending(false);
    }
  }, [newMessage, intern, isSending, loadMessages]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  }, [handleSend]);

  if (!intern) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent className="w-full sm:max-w-md bg-surface border-border flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-full bg-gradient-to-br from-brand to-brand2 flex items-center justify-center">
              <ChatAvatar intern={intern} />
            </div>
            <div>
              <SheetTitle className="text-primary">{intern.full_name}</SheetTitle>
              <p className="text-xs text-muted">Chat conversation</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4" style={{ maxHeight: "calc(100vh - 220px)" }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.from === "manager" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-3 ${
                  message.from === "manager"
                    ? "bg-brand text-white"
                    : "bg-surface2 text-primary border border-border"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.from === "manager" ? "text-white/70" : "text-muted"
                  }`}
                >
                  {formatMessageTime(message.created_date)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />

          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted">No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-sm text-error" role="alert">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSend} className="border-t border-border pt-4 mt-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
              className="bg-surface2 border-border text-primary placeholder:text-muted resize-none"
              rows={2}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-brand hover:bg-brand/90 text-white self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
