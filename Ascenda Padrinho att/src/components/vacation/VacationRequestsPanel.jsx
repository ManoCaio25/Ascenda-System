import React, { useState, useEffect, useCallback, useMemo } from "react";
import { VacationRequest } from "@padrinho/entities/VacationRequest";
import { Intern } from "@padrinho/entities/Intern";
import { Notification } from "@padrinho/entities/Notification";
import { User } from "@padrinho/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@padrinho/components/ui/card";
import { Button } from "@padrinho/components/ui/button";
import { Badge } from "@padrinho/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@padrinho/components/ui/tabs";
import { Textarea } from "@padrinho/components/ui/textarea";
import { Input } from "@padrinho/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@padrinho/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@padrinho/components/ui/select";
import { Check, X, Calendar, CalendarCheck, AlertCircle, Pencil } from "lucide-react";
import { format } from "date-fns";
import { eventBus, EventTypes } from "../utils/eventBus";
import VacationCalendar from "./VacationCalendar";
import Avatar from "@padrinho/components/ui/Avatar";

export default function VacationRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [interns, setInterns] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [processingId, setProcessingId] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [managerNote, setManagerNote] = useState("");
  const [user, setUser] = useState(null);
  const [emojiEditor, setEmojiEditor] = useState(null);
  const [emojiValue, setEmojiValue] = useState("");
  const [isUpdatingEmoji, setIsUpdatingEmoji] = useState(false);

  const loadData = useCallback(async () => {
    const [requestsData, internsData] = await Promise.all([
      VacationRequest.list('-created_date'),
      Intern.list()
    ]);
    setRequests(requestsData);
    setInterns(internsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.log("User not loaded");
      }
    };
    loadUser();
  }, []);

  const internsById = useMemo(() => {
    return Object.fromEntries(interns.map(i => [i.id, i]));
  }, [interns]);

  const openEmojiEditor = useCallback((intern) => {
    if (!intern) return;
    setEmojiEditor(intern);
    setEmojiValue(intern.avatar_url || "");
  }, []);

  const closeEmojiEditor = useCallback(() => {
    setEmojiEditor(null);
    setEmojiValue("");
    setIsUpdatingEmoji(false);
  }, []);

  const saveEmoji = useCallback(async () => {
    if (!emojiEditor || isUpdatingEmoji) return;

    const nextValue = emojiValue.trim();
    const currentValue = emojiEditor.avatar_url || '';
    if (nextValue === currentValue) {
      return;
    }

    setIsUpdatingEmoji(true);

    try {
      await Intern.update(emojiEditor.id, { avatar_url: nextValue || null });
      setInterns((prev) =>
        prev.map((item) =>
          String(item.id) === String(emojiEditor.id)
            ? { ...item, avatar_url: nextValue || null }
            : item
        )
      );
      closeEmojiEditor();
    } catch (error) {
      console.error('Error updating emoji:', error);
    } finally {
      setIsUpdatingEmoji(false);
    }
  }, [emojiEditor, emojiValue, isUpdatingEmoji, closeEmojiEditor]);

  const handleApprove = useCallback(async (request) => {
    if (processingId) return;
    
    setProcessingId(request.id);
    try {
      await VacationRequest.update(request.id, {
        status: 'approved',
        decided_at: new Date().toISOString()
      });

      const intern = internsById[request.intern_id];
      await Notification.create({
        type: 'vacation_status_changed',
        title: 'Vacation Request Approved',
        body: `Your vacation request from ${format(new Date(request.start_date), 'MMM d')} to ${format(new Date(request.end_date), 'MMM d')} has been approved.`,
        target_id: request.id,
        target_kind: 'request',
        actor_name: user?.full_name || 'Manager'
      });

      eventBus.emit(EventTypes.VACATION_STATUS_CHANGED, {
        requestId: request.id,
        status: 'APPROVED',
        internName: intern?.full_name
      });

      loadData();
    } finally {
      setProcessingId(null);
    }
  }, [processingId, internsById, user, loadData]);

  const handleReject = useCallback((request) => {
    setRejectDialog(request);
    setManagerNote("");
  }, []);

  const confirmReject = useCallback(async () => {
    if (!rejectDialog || processingId) return;
    
    setProcessingId(rejectDialog.id);
    try {
      await VacationRequest.update(rejectDialog.id, {
        status: 'rejected',
        decided_at: new Date().toISOString(),
        manager_note: managerNote
      });

      const intern = internsById[rejectDialog.intern_id];
      await Notification.create({
        type: 'vacation_status_changed',
        title: 'Vacation Request Rejected',
        body: `Your vacation request from ${format(new Date(rejectDialog.start_date), 'MMM d')} to ${format(new Date(rejectDialog.end_date), 'MMM d')} has been rejected.${managerNote ? ` Note: ${managerNote}` : ''}`,
        target_id: rejectDialog.id,
        target_kind: 'request',
        actor_name: user?.full_name || 'Manager'
      });

      eventBus.emit(EventTypes.VACATION_STATUS_CHANGED, {
        requestId: rejectDialog.id,
        status: 'REJECTED',
        internName: intern?.full_name
      });

      setRejectDialog(null);
      setManagerNote("");
      loadData();
    } finally {
      setProcessingId(null);
    }
  }, [rejectDialog, processingId, managerNote, internsById, user, loadData]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => 
      filterStatus === "all" || req.status === filterStatus
    );
  }, [requests, filterStatus]);

  const statusColors = {
    pending: "bg-yellow-500/20 text-warning border-yellow-500/30",
    approved: "bg-green-500/20 text-success border-green-500/30",
    rejected: "bg-red-500/20 text-error border-red-500/30"
  };

  const trimmedEmojiValue = emojiValue.trim();
  const previewEmoji = trimmedEmojiValue || emojiEditor?.avatar_url || '👤';
  const emojiHasChanges = emojiEditor
    ? trimmedEmojiValue !== (emojiEditor.avatar_url || '')
    : Boolean(trimmedEmojiValue);

  return (
    <>
      <Card className="border-border bg-surface shadow-e1">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Vacation Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-6 bg-surface2">
              <TabsTrigger value="list" className="data-[state=active]:bg-surface">
                <CalendarCheck className="w-4 h-4 mr-2" />
                Requests List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-surface">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-surface2 border-border text-primary">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted">
                  {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {filteredRequests.map((request) => {
                  const intern = internsById[request.intern_id];
                  const isPending = request.status === 'pending';
                  
                  return (
                    <article
                      key={request.id}
                      className="p-4 rounded-xl border border-border bg-surface2 hover:shadow-e1 transition-all"
                      aria-label={`Vacation request from ${intern?.full_name || 'Unknown'}`}
                    >
                      <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-start">
                        <div className="relative flex-shrink-0">
                          {intern ? (
                            <>
                              <button
                                type="button"
                                onClick={() => openEmojiEditor(intern)}
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand2 flex items-center justify-center text-2xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                title={`Update profile emoji for ${intern.full_name}`}
                              >
                                {intern.avatar_url || '👤'}
                                <span className="sr-only">Update profile emoji for {intern.full_name}</span>
                              </button>
                              <span className="absolute -bottom-1 -right-1 rounded-full bg-surface text-muted border border-border p-1 shadow-sm">
                                <Pencil className="w-3 h-3" aria-hidden="true" />
                              </span>
                            </>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand2 flex items-center justify-center text-2xl">
                              {'👤'}
                            </div>
                          )}
                        </div>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-primary truncate max-w-[220px]">
                              {intern?.full_name || 'Unknown'}
                            </h3>
                            <Badge className={`${statusColors[request.status]} border capitalize flex-shrink-0`}>
                              {request.status}
                            </Badge>
                          </div>
                          
                          {intern && (
                            <p className="text-xs text-muted mb-2">{intern.track}</p>
                          )}
                          
                          <div className="space-y-1 text-sm">
                            <p className="text-secondary">
                              <span className="text-muted">From:</span>{' '}
                              <span className="font-medium">
                                {format(new Date(request.start_date), 'MMM d, yyyy')}
                              </span>
                            </p>
                            <p className="text-secondary">
                              <span className="text-muted">To:</span>{' '}
                              <span className="font-medium">
                                {format(new Date(request.end_date), 'MMM d, yyyy')}
                              </span>
                            </p>
                            {request.reason && (
                              <p className="text-secondary mt-2">
                                <span className="text-muted">Reason:</span> {request.reason}
                              </p>
                            )}
                            {request.manager_note && (
                              <p className="text-secondary mt-2 p-2 bg-surface rounded border border-border">
                                <span className="text-muted">Manager note:</span> {request.manager_note}
                              </p>
                            )}
                            <p className="text-xs text-muted mt-2">
                              Requested {format(new Date(request.created_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>

                        {isPending && (
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request)}
                              disabled={processingId === request.id}
                              className="bg-success hover:bg-success/90 text-white font-medium"
                              aria-label={`Approve vacation request for ${intern?.full_name}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(request)}
                              disabled={processingId === request.id}
                              className="border-error text-error hover:bg-error/10 font-medium"
                              aria-label={`Reject vacation request for ${intern?.full_name}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}

                {filteredRequests.length === 0 && (
                  <div className="text-center py-12 bg-surface2 rounded-xl border border-border">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted opacity-50" />
                    <p className="text-muted">No vacation requests found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <VacationCalendar
                requests={requests}
                interns={interns}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog
        open={!!emojiEditor}
        onOpenChange={(open) => {
          if (!open && !isUpdatingEmoji) {
            closeEmojiEditor();
          }
        }}
      >
        <DialogContent className="bg-surface border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Update Profile Emoji</DialogTitle>
            <DialogDescription className="text-secondary">
              Choose an emoji or paste an image URL for {emojiEditor?.full_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand2 p-0.5">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                  <Avatar
                    src={previewEmoji}
                    alt={emojiEditor?.full_name || 'Intern avatar preview'}
                    size={56}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-secondary">Preview</p>
                <p className="text-base font-semibold text-primary truncate max-w-[180px]">
                  {emojiEditor?.full_name || 'Intern'}
                </p>
              </div>
            </div>

            <Input
              value={emojiValue}
              onChange={(e) => setEmojiValue(e.target.value)}
              placeholder="Try 😀 or paste an image URL"
              className="bg-surface2 border-border text-primary"
            />
            <p className="text-xs text-muted">
              Emojis render beautifully across the app and you can swap them anytime. Image URLs are also supported.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!isUpdatingEmoji) {
                  closeEmojiEditor();
                }
              }}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={saveEmoji}
              disabled={!emojiHasChanges || isUpdatingEmoji}
              className="bg-brand hover:bg-brand/90 text-white font-medium"
            >
              Save Emoji
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-primary">Reject Vacation Request</DialogTitle>
            <DialogDescription className="text-secondary">
              Are you sure you want to reject this vacation request? You can optionally add a note.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary mb-2 block">
                Manager Note (Optional)
              </label>
              <Textarea
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
                placeholder="Explain the reason for rejection..."
                className="bg-surface2 border-border text-primary"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog(null)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={processingId === rejectDialog?.id}
              className="bg-error hover:bg-error/90 text-white font-medium"
            >
              <X className="w-4 h-4 mr-2" />
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}