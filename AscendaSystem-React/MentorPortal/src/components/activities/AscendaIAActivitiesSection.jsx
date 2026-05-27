import React from "react";
import { Button } from "@padrinho/components/ui/button";
import { Input } from "@padrinho/components/ui/input";
import { Textarea } from "@padrinho/components/ui/textarea";
import { fakeAscendaIAActivities } from "@padrinho/utils/fakeAscendaIAActivities";
import { Sparkles, Youtube, FileText, Trash2 } from "lucide-react";

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleString();
  } catch (error) {
    return isoString;
  }
}

export function AscendaIAActivitiesSection({ youtubeUrl, uploadedFile, attachedActivities, onAttach }) {
  const [focus, setFocus] = React.useState(attachedActivities?.focus || "");
  const [goal, setGoal] = React.useState(attachedActivities?.goal || "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState(attachedActivities || null);

  React.useEffect(() => {
    setResult(attachedActivities || null);
    if (attachedActivities) {
      setFocus(attachedActivities.focus || "");
      setGoal(attachedActivities.goal || "");
    }
  }, [attachedActivities]);

  const hasSource = Boolean(youtubeUrl) || Boolean(uploadedFile);
  const youtubeLabel = youtubeUrl ? youtubeUrl.trim() : null;
  const fileLabel = uploadedFile?.name || null;

  const handleGenerate = async () => {
    if (!hasSource) {
      setError("Adicione um vídeo do YouTube ou envie um arquivo .docx para gerar as atividades.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fakeAscendaIAActivities({
        focus,
        goal,
        youtubeUrl: youtubeUrl || "",
        fileName: uploadedFile?.name || "",
      });
      setResult(data);
      onAttach?.(data);
    } catch (err) {
      console.error("AscendaIA activities failed", err);
      setError("Não foi possível gerar as atividades. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    onAttach?.(null);
  };

  return (
    <div className="space-y-5 rounded-2xl border border-border/60 bg-surface2/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">Atividades com AscendaIA</h3>
          <p className="text-sm text-muted">
            Gere atividades práticas automaticamente a partir de um vídeo do YouTube ou de um documento enviado.
          </p>
        </div>
        {result && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-error">
            <Trash2 className="mr-2 h-4 w-4" /> Remover
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary/90">Foco das atividades</label>
          <Input
            placeholder="Ex.: onboarding de novos colaboradores"
            value={focus}
            onChange={(event) => setFocus(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary/90">Objetivo pedagógico</label>
          <Textarea
            placeholder="O que os participantes devem conquistar ao final?"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-surface/60 p-4 text-sm text-muted">
        <p className="mb-2 font-medium text-primary/90">Fontes analisadas</p>
        {hasSource ? (
          <ul className="space-y-1">
            {youtubeLabel && (
              <li className="flex items-center gap-2"><Youtube className="h-4 w-4 text-error" /> {youtubeLabel}</li>
            )}
            {fileLabel && (
              <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand" /> {fileLabel}</li>
            )}
          </ul>
        ) : (
          <p>Inclua um link do YouTube ou envie um arquivo .docx para habilitar a geração automática.</p>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !hasSource}
          className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-white shadow-lg hover:from-purple-400 hover:via-fuchsia-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {result ? "Regenerar atividades" : "Gerar atividades (IA)"}
        </Button>
      </div>

      {result && (
        <div className="space-y-4 rounded-2xl border border-brand/50 bg-brand/5 p-5">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-primary">Plano proposto</h4>
            <p className="text-sm text-muted">Foco: {result.focus}</p>
            <p className="text-xs text-muted">Objetivo: {result.goal}</p>
            <p className="text-xs text-muted">Gerado em {formatTime(result.generatedAt)}</p>
          </div>

          <ol className="space-y-3 text-sm text-muted">
            {result.items.map((item) => (
              <li key={item.id} className="rounded-xl border border-border/40 bg-surface/80 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-primary">{item.title}</p>
                    <p className="text-xs text-muted">{item.type} • {item.duration}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.instructions}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
