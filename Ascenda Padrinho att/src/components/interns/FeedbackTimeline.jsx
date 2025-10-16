import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@padrinho/components/ui/card";
import { Badge } from "@padrinho/components/ui/badge";
import { MessageCircle, Clock3, CheckCircle2, AlertTriangle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const statusStyles = {
  acknowledged: {
    label: "Reconhecido",
    className: "bg-success/20 text-success border-success/30",
  },
  pending: {
    label: "Pendente",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  in_progress: {
    label: "Em andamento",
    className: "bg-brand/15 text-brand border-brand/30",
  },
  resolved: {
    label: "Concluído",
    className: "bg-brand2/15 text-brand2 border-brand2/30",
  },
};

const sentimentIcons = {
  positive: {
    icon: CheckCircle2,
    className: "text-success",
  },
  action: {
    icon: AlertTriangle,
    className: "text-warning",
  },
  neutral: {
    icon: MessageCircle,
    className: "text-brand",
  },
};

function FeedbackItem({ item }) {
  const sentiment = sentimentIcons[item.sentiment] ?? sentimentIcons.neutral;
  const status = statusStyles[item.status] ?? statusStyles.pending;
  const SentimentIcon = sentiment.icon;
  const createdDate = item.created_at ? new Date(item.created_at) : null;

  return (
    <li className="bg-surface2 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border/60 ${sentiment.className}`}>
            <SentimentIcon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-primary">{item.title}</h4>
            <p className="text-sm text-muted leading-relaxed">{item.message}</p>
          </div>
        </div>
        <Badge className={`${status.className} text-xs`}>{status.label}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        {item.author && (
          <span>
            Enviado por <span className="font-medium text-secondary">{item.author}</span>
          </span>
        )}
        {createdDate && !Number.isNaN(createdDate.getTime()) && (
          <span className="flex items-center gap-1">
            <Clock3 className="w-3 h-3" aria-hidden="true" />
            {format(createdDate, "dd MMM yyyy")} • {formatDistanceToNow(createdDate, { addSuffix: true })}
          </span>
        )}
      </div>
    </li>
  );
}

export default function FeedbackTimeline({ items = [] }) {
  return (
    <Card className="border-border bg-surface shadow-e1">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-primary text-lg">Atividades de Feedback</CardTitle>
          <p className="text-sm text-muted mt-1">
            Histórico das orientações e retornos enviados para o estagiário.
          </p>
        </div>
        <Badge variant="outline" className="border-border text-secondary">
          {items.length} registro{items.length === 1 ? "" : "s"}
        </Badge>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-8 h-8 mx-auto text-muted mb-3" aria-hidden="true" />
            <p className="text-sm text-muted">Nenhum feedback registrado para este estagiário ainda.</p>
          </div>
        ) : (
          <ul className="space-y-4" aria-live="polite">
            {items.map((item) => (
              <FeedbackItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
