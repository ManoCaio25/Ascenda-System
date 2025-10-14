// AscendaIASection.jsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@padrinho/utils";

const ACCENT_STYLES = {
  sky: {
    cardRing: "ring-sky-400/20",
    checkbox: "text-sky-300 focus-visible:ring-sky-300/40",
    chipBorder: "border-sky-400/40",
    chipBg: "bg-sky-400/10",
    chipText: "text-sky-100",
    previewBorder: "border-sky-400/40",
  },
  violet: {
    cardRing: "ring-violet-400/20",
    checkbox: "text-violet-300 focus-visible:ring-violet-300/40",
    chipBorder: "border-violet-400/40",
    chipBg: "bg-violet-400/10",
    chipText: "text-violet-100",
    previewBorder: "border-violet-400/40",
  },
  fuchsia: {
    cardRing: "ring-fuchsia-400/20",
    checkbox: "text-fuchsia-300 focus-visible:ring-fuchsia-300/40",
    chipBorder: "border-fuchsia-400/40",
    chipBg: "bg-fuchsia-400/10",
    chipText: "text-fuchsia-100",
    previewBorder: "border-fuchsia-400/40",
  },
};

const SUMMARY_DOT_COLORS = {
  sky: "bg-sky-300/80",
  violet: "bg-violet-300/80",
  fuchsia: "bg-fuchsia-300/80",
};

function fakeAscendaIAByLevels({ topic, youtubeUrl, counts }) {
  const build = (level, n) =>
    Array.from({ length: n }, (_, i) => ({
      id: `${level}-${i + 1}`,
      level,
      prompt: `(${level.toUpperCase()}) Q${i + 1} about ${topic}${youtubeUrl ? ` (src: ${youtubeUrl})` : ""}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: Math.floor(Math.random() * 4),
    }));

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        topic,
        source: youtubeUrl || null,
        createdBy: "AscendaIA 🤖",
        createdAt: new Date().toISOString(),
        easy: build("easy", counts.easy || 0),
        intermediate: build("intermediate", counts.intermediate || 0),
        advanced: build("advanced", counts.advanced || 0),
      });
    }, 800);
  });
}

function DifficultyCard({ title, desc, checked, onToggle, value, onChange, color = "sky" }) {
  const accent = ACCENT_STYLES[color] ?? ACCENT_STYLES.sky;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "quiz-card w-full rounded-2xl border border-border/60 bg-surface/80 p-5 shadow-sm ring-1 transition-all duration-200 hover:shadow-md",
        accent.cardRing
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white break-words">{title}</h3>
          <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-white/70">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle?.()}
              className={`h-4 w-4 rounded border border-white/40 bg-transparent accent-current ${accent.checkbox}`}
              aria-label={`Incluir nível ${title}`}
            />
            <span>Incluir</span>
          </label>
        </div>
        <p className="text-sm text-white/70 break-words">{desc}</p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="max-w-[160px] text-[11px] uppercase tracking-[0.08em] text-white/60">
          Questões disponíveis para este nível
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange?.(Math.max(0, (value || 0) - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-base text-white transition-all duration-200 hover:bg-white/10"
            aria-label={`Diminuir questões ${title}`}
          >
            −
          </button>
          <div className="flex h-9 min-w-[2.5rem] items-center justify-center rounded-xl border border-white/10 bg-background/80 px-2 text-center text-sm font-semibold text-white">
            {value ?? 0}
          </div>
          <button
            type="button"
            onClick={() => onChange?.((value || 0) + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-base text-white transition-all duration-200 hover:bg-white/10"
            aria-label={`Aumentar questões ${title}`}
          >
            +
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export const LevelCard = DifficultyCard;

function StatChip({ label, count, color = "sky" }) {
  const accent = ACCENT_STYLES[color] ?? ACCENT_STYLES.sky;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${accent.chipBorder} ${accent.chipBg} ${accent.chipText}`}>
      {label} <b className="text-white">{count}</b>
    </span>
  );
}

function PreviewCol({ label, items, color = "sky" }) {
  const accent = ACCENT_STYLES[color] ?? ACCENT_STYLES.sky;
  return (
    <div className={`rounded-xl border p-3 ${accent.previewBorder}`}>
      <div className="mb-2 text-sm font-semibold">{label}</div>
      <ul className="quiz-preview-list space-y-1 text-sm text-white/70">
        {items.length === 0 && <li className="text-white/40">Sem itens</li>}
        {items.slice(0, 8).map((q) => (
          <li key={q.id}>• {q.prompt}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AscendaIASection({ asModal = false }) {
  const [topicEntry, setTopicEntry] = useState("");
  const [sel, setSel] = useState({ easy: true, intermediate: true, advanced: false });
  const [counts, setCounts] = useState({ easy: 4, intermediate: 4, advanced: 2 });
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  const levels = useMemo(
    () => [
      { code: "easy", title: "Iniciante", desc: "Vitórias rápidas e aquecimento", accent: "sky" },
      { code: "intermediate", title: "Intermediário", desc: "Raciocínio baseado em cenários", accent: "violet" },
      { code: "advanced", title: "Avançado", desc: "Profundidade estratégica e arquitetural", accent: "fuchsia" },
    ],
    []
  );

  const totalRequested =
    (sel.easy ? counts.easy : 0) +
    (sel.intermediate ? counts.intermediate : 0) +
    (sel.advanced ? counts.advanced : 0);

  const handleToggleLevel = (code) => setSel((p) => ({ ...p, [code]: !p[code] }));
  const handleCountChange = (code, value) => {
    const n = Number(value);
    setCounts((p) => ({ ...p, [code]: Math.max(0, Number.isFinite(n) ? n : 0) }));
  };

  const generate = async () => {
    const raw = topicEntry.trim();
    const looksLikeUrl = /^https?:\/\//i.test(raw);
    const topicClean = looksLikeUrl ? "" : raw;
    const youtubeClean = looksLikeUrl ? raw : "";
    if (!topicClean && !youtubeClean) return;

    const req = {
      topic: topicClean || youtubeClean,
      youtubeUrl: youtubeClean || null,
      counts: {
        easy: sel.easy ? Number(counts.easy || 0) : 0,
        intermediate: sel.intermediate ? Number(counts.intermediate || 0) : 0,
        advanced: sel.advanced ? Number(counts.advanced || 0) : 0,
      },
    };
    if (!req.counts.easy && !req.counts.intermediate && !req.counts.advanced) return;

    setLoading(true);
    setQuiz(null);
    try {
      const result = await fakeAscendaIAByLevels(req);
      setQuiz(result);
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = totalRequested > 0 && topicEntry.trim().length > 0;

  const save = () => {
    const key = "ascenda_quizzes";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push({
      id: `quiz_${Date.now()}`,
      topic: quiz.topic,
      source: quiz.source,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt,
      items: [...quiz.easy, ...quiz.intermediate, ...quiz.advanced],
      breakdown: {
        easy: quiz.easy.length,
        intermediate: quiz.intermediate.length,
        advanced: quiz.advanced.length,
      },
      status: "draft",
    });
    localStorage.setItem(key, JSON.stringify(list));
    alert("✅ Quiz salvo localmente!");
  };

  const summaryItems = useMemo(
    () =>
      levels.map((level) => ({
        ...level,
        enabled: Boolean(sel[level.code]),
        total: sel[level.code] ? Number(counts[level.code] || 0) : 0,
      })),
    [levels, sel, counts]
  );

  const wrapperProps = {
    role: "region",
    "aria-label": "Gerar Quizzes",
    "data-quiz-scope": "",
    style: { height: "auto", minHeight: 0 },
    className: cn(
      // REMOVIDO "backdrop-blur-sm" para evitar fantasmas/sobreposição
      "w-full rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-sm sm:p-8",
      asModal ? "max-w-full" : "mx-auto max-w-6xl"
    ),
  };

  const body = (
    <>
      {/* grid simples (sem sticky) */}
      <div className="quiz-layout">
        {/* sidebar */}
        <aside className="quiz-summary w-full rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">AscendaIA — Gerar Quizzes</h2>
            <p className="text-sm text-white/70 break-words">
              Gere quizzes a partir de um tópico ou link do YouTube. Escolha os níveis e quantidades desejadas.
            </p>
          </div>

          <label className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            <span className="text-sm font-medium text-white">Tópico ou link do YouTube</span>
            <input
              className="h-11 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-primary/40"
              placeholder="Informe um tema ou cole o link do vídeo"
              value={topicEntry}
              onChange={(e) => setTopicEntry(e.target.value)}
              aria-label="Tópico ou link do YouTube"
            />
          </label>

          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Resumo do pedido</h3>
              <p className="text-xs text-white/60">
                Ajuste os níveis e quantidades antes de gerar com a AscendaIA.
              </p>
            </div>

            <ul className="space-y-2 text-xs">
              {summaryItems.map((item) => (
                <li
                  key={item.code}
                  className={cn(
                    "flex items-center justify-between rounded-xl border border-white/5 bg-white/0 px-3 py-2 transition",
                    item.enabled ? "text-white" : "text-white/40"
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span className={cn("h-2.5 w-2.5 rounded-full", SUMMARY_DOT_COLORS[item.accent] ?? "bg-white/40")} />
                    {item.title}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.08em] text-white/60">
                    {item.enabled ? `${item.total} questões` : "Desativado"}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={generate}
              disabled={loading || !canGenerate}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary/90 to-fuchsia-600/80 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Gerando…" : "Gerar com AscendaIA"}
            </button>

            {loading ? (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10" role="status" aria-live="polite">
                <div className="h-full w-1/2 animate-loading-stripes rounded-full bg-gradient-to-r from-violet-400/60 via-violet-300/80 to-fuchsia-400/60" />
              </div>
            ) : quiz ? (
              <p className="text-xs font-medium text-emerald-200">Quiz pronto! Revise o conteúdo abaixo ou salve como rascunho.</p>
            ) : (
              <p className="text-xs text-white/60">Informe um tópico ou link do YouTube e mantenha ao menos um nível selecionado para habilitar a geração.</p>
            )}
          </div>
        </aside>

        {/* coluna principal */}
        <div className="quiz-main">
          {quiz && (
            <span className="inline-flex w-full items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
              Rascunho pronto
            </span>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Níveis do curso</h3>
            <p className="text-sm text-white/70 break-words">
              Ajuste a seleção de níveis e defina quantas questões deseja gerar para cada etapa do aprendizado.
            </p>
          </div>

          {/* grid de cards */}
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-6">
            {levels.map((level) => (
              <div key={level.code} className="w-full md:flex-1">
                <LevelCard
                  color={level.accent}
                  title={level.title}
                  desc={level.desc}
                  checked={Boolean(sel[level.code])}
                  onToggle={() => handleToggleLevel(level.code)}
                  value={counts[level.code]}
                  onChange={(next) => handleCountChange(level.code, next)}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-2xl border border-dashed border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Adicionar novo curso
          </button>
        </div>
      </div>

      {/* preview */}
      {quiz && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-white/70">
              <span className="font-semibold">{quiz.topic}</span>
              <span className="mx-2 hidden md:inline">•</span>
              <span className="block md:inline">
                Total de <span className="font-semibold">{quiz.easy.length + quiz.intermediate.length + quiz.advanced.length}</span> questões
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatChip label="Básico" count={quiz.easy.length} color="sky" />
              <StatChip label="Intermediário" count={quiz.intermediate.length} color="violet" />
              <StatChip label="Avançado" count={quiz.advanced.length} color="fuchsia" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <PreviewCol label="Básico" color="sky" items={quiz.easy} />
            <PreviewCol label="Intermediário" color="violet" items={quiz.intermediate} />
            <PreviewCol label="Avançado" color="fuchsia" items={quiz.advanced} />
          </div>

          <div className="mt-5 flex flex-col justify-end gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setQuiz(null)}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm transition-all duration-200 hover:bg-white/5"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-md transition-all duration-200 hover:brightness-110"
            >
              Salvar quiz
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (asModal) return <motion.div {...wrapperProps}>{body}</motion.div>;
  return <section {...wrapperProps}>{body}</section>;
}
