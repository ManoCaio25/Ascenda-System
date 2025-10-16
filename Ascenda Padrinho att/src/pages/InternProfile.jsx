import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Intern } from "@padrinho/entities/Intern";
import { Feedback } from "@padrinho/entities/Feedback";
import { Button } from "@padrinho/components/ui/button";
import { Badge } from "@padrinho/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@padrinho/components/ui/card";
import { Input } from "@padrinho/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@padrinho/components/ui/select";
import Avatar from "@padrinho/components/ui/Avatar";
import PerformancePanel from "@padrinho/components/interns/PerformancePanel";
import FeedbackTimeline from "@padrinho/components/interns/FeedbackTimeline";
import { getDaysLeft, getDaysLeftBadgeColor } from "@padrinho/components/utils/dates";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Trophy,
  Target,
  Calendar,
  CalendarCheck,
  UserCircle2,
} from "lucide-react";

const slugify = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function InternProfile() {
  const navigate = useNavigate();
  const { internId } = useParams();

  const [intern, setIntern] = React.useState(null);
  const [feedbackItems, setFeedbackItems] = React.useState([]);
  const [mentorOptions, setMentorOptions] = React.useState([]);
  const [customResponsible, setCustomResponsible] = React.useState("");
  const [isSavingResponsible, setIsSavingResponsible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const list = await Intern.list();
        const mentors = Array.from(
          new Set(list.map((item) => item.mentor_name).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));
        setMentorOptions(mentors);

        let resolvedIntern = list.find((item) => String(item.id) === String(internId));
        if (!resolvedIntern) {
          resolvedIntern = list.find((item) => slugify(item.full_name) === String(internId));
        }

        setIntern(resolvedIntern ?? null);

        if (resolvedIntern) {
          const entries = await Feedback.filter({ intern_id: resolvedIntern.id }, "-created_at");
          setFeedbackItems(entries);
        } else {
          setFeedbackItems([]);
        }
      } catch (error) {
        console.warn("Unable to load intern profile", error);
        setIntern(null);
        setFeedbackItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [internId]);

  const handleResponsibleChange = React.useCallback(async (value) => {
    if (!intern) return;

    const resolvedValue = value === "unassigned" ? null : value;
    setIsSavingResponsible(true);
    try {
      const updated = await Intern.update(intern.id, { mentor_name: resolvedValue });
      const nextIntern = updated ?? { ...(intern ?? {}), mentor_name: resolvedValue };
      setIntern(nextIntern);
      if (resolvedValue && !mentorOptions.includes(resolvedValue)) {
        setMentorOptions((prev) => [...prev, resolvedValue].sort((a, b) => a.localeCompare(b)));
      }
    } catch (error) {
      console.warn("Failed to update responsible", error);
    } finally {
      setIsSavingResponsible(false);
    }
  }, [intern, mentorOptions]);

  const handleCustomResponsibleSubmit = React.useCallback(async (event) => {
    event.preventDefault();
    const value = customResponsible.trim();
    if (!value || isSavingResponsible) return;
    await handleResponsibleChange(value);
    setCustomResponsible("");
  }, [customResponsible, handleResponsibleChange, isSavingResponsible]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-secondary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando informações do estagiário...</span>
        </div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Card className="border-border bg-surface">
            <CardContent className="py-12 text-center space-y-3">
              <UserCircle2 className="w-12 h-12 mx-auto text-muted" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-primary">Estagiário não encontrado</h2>
              <p className="text-sm text-muted">
                Verifique o link acessado e tente novamente a partir do painel de estagiários.
              </p>
              <div>
                <Button onClick={() => navigate("/interns")}>Ir para Team Overview</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const daysLeft = intern.end_date ? getDaysLeft(intern.end_date) : null;
  const daysLeftColors = daysLeft !== null ? getDaysLeftBadgeColor(daysLeft) : null;
  const responsibleValue = intern.mentor_name ?? "unassigned";

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="border-border bg-surface shadow-e1">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand to-brand2 p-0.5">
                  <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                    <Avatar src={intern.avatar_url} alt={intern.full_name} size={76} />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-primary">{intern.full_name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {intern.track && (
                      <Badge variant="outline" className="border-border text-secondary">
                        {intern.track}
                      </Badge>
                    )}
                    {intern.level && (
                      <Badge className="bg-surface2 border-border text-secondary">{intern.level}</Badge>
                    )}
                    {intern.status && (
                      <Badge className="bg-brand/15 text-brand border border-brand/30 capitalize">
                        {intern.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface2 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted">Pontuação</p>
                  <p className="text-2xl font-semibold text-primary flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-brand2" />
                    {intern.points ?? "-"}
                  </p>
                </div>
                <div className="bg-surface2 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted">Score médio</p>
                  <p className="text-2xl font-semibold text-primary flex items-center gap-2">
                    <Target className="w-4 h-4 text-success" />
                    {intern.avg_score_pct ? `${intern.avg_score_pct}%` : "-"}
                  </p>
                </div>
                <div className="bg-surface2 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted">Início</p>
                  <p className="text-sm font-medium text-secondary flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand" />
                    {intern.start_date ? format(new Date(intern.start_date), "dd MMM yyyy") : "-"}
                  </p>
                </div>
                <div className="bg-surface2 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted">Término</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-secondary flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-warning" />
                      {intern.end_date ? format(new Date(intern.end_date), "dd MMM yyyy") : "-"}
                    </p>
                    {daysLeft !== null && daysLeftColors && (
                      <Badge className={`${daysLeftColors.bg} ${daysLeftColors.text} ${daysLeftColors.border} text-[11px]`}>
                        {daysLeft} dias restantes
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                <span>{intern.email}</span>
              </div>
              {intern.cohort && (
                <div className="flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4 text-secondary" />
                  <span>{`Turma ${intern.cohort}`}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-e1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary text-lg">Designar responsável</CardTitle>
              {isSavingResponsible && (
                <span className="flex items-center gap-2 text-xs text-muted">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Salvando...
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-2">
              Escolha quem irá acompanhar o estagiário ou cadastre um novo responsável.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Responsável atual</span>
                <Select value={responsibleValue} onValueChange={handleResponsibleChange}>
                  <SelectTrigger className="bg-surface border-border text-primary">
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    <SelectItem value="unassigned">Sem responsável definido</SelectItem>
                    {mentorOptions.map((mentor) => (
                      <SelectItem key={mentor} value={mentor}>
                        {mentor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <form className="space-y-2" onSubmit={handleCustomResponsibleSubmit}>
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Cadastrar novo responsável</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={customResponsible}
                    onChange={(event) => setCustomResponsible(event.target.value)}
                    placeholder="Nome completo"
                    className="bg-surface border-border text-primary"
                  />
                  <Button type="submit" disabled={isSavingResponsible || !customResponsible.trim()}>
                    Adicionar
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        <PerformancePanel intern={intern} />

        <FeedbackTimeline items={feedbackItems} />
      </div>
    </div>
  );
}
