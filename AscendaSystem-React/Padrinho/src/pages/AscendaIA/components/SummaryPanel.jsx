import React from "react";
import { motion } from "framer-motion";
import { Button } from "@padrinho/components/ui/button";
import { Checkbox } from "@padrinho/components/ui/checkbox";
import { Input } from "@padrinho/components/ui/input";
import { Progress } from "@padrinho/components/ui/progress";
import { ascendaIAStrings } from "../strings";

function LevelRow({ level, onToggle, onCountChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex items-center gap-3">
        <Checkbox
          id={`ascenda-summary-${level.code}`}
          checked={level.enabled}
          onCheckedChange={(value) => onToggle(level.code, Boolean(value))}
          className="data-[state=checked]:bg-white/90 data-[state=checked]:text-background"
        />
        <div>
          <label htmlFor={`ascenda-summary-${level.code}`} className="text-sm font-medium text-white">
            {level.title}
          </label>
          <p className="text-xs text-white/60">{level.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onCountChange(level.code, Math.max(0, Number(level.count || 0) - 1))}
          disabled={!level.enabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-lg text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Decrease ${level.title}`}
        >
          −
        </button>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={ascendaIAStrings.limits.maxItemsPerLevel}
          value={level.count ?? 0}
          onChange={(event) => onCountChange(level.code, event.target.value)}
          onBlur={(event) => onCountChange(level.code, event.target.value)}
          disabled={!level.enabled}
          className="h-8 w-16 rounded-lg border-border/60 bg-background/80 text-center text-sm font-semibold text-white"
          aria-label={`Items for ${level.title}`}
        />
        <button
          type="button"
          onClick={() => onCountChange(level.code, Math.min(ascendaIAStrings.limits.maxItemsPerLevel, Number(level.count || 0) + 1))}
          disabled={!level.enabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-lg text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Increase ${level.title}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function SummaryPanel({
  levels,
  setLevelEnabled,
  setLevelCount,
  totalRequested,
  canGenerate,
  loading,
  onGenerate,
  feedback,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: 0.08 }}
      className="panel flex flex-col gap-5 border-border/60 bg-surface/80 p-6 shadow-e1 backdrop-blur-sm"
      aria-labelledby="ascenda-summary"
    >
      <div className="space-y-1">
        <h2 id="ascenda-summary" className="text-lg font-semibold text-white">
          {ascendaIAStrings.summary.heading}
        </h2>
        <p className="text-sm text-white/70">{ascendaIAStrings.summary.description}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <span className="text-xs uppercase tracking-[0.12em] text-white/40">
          {ascendaIAStrings.summary.totalLabel}
        </span>
        <p className="mt-2 text-3xl font-semibold text-white">{totalRequested}</p>
        <p className="text-xs text-white/60">{ascendaIAStrings.summary.totalHint}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/50">
          {ascendaIAStrings.summary.chipsLabel}
        </p>
        <div className="flex flex-col gap-2">
          {levels.map((level) => (
            <LevelRow
              key={level.code}
              level={level}
              onToggle={setLevelEnabled}
              onCountChange={setLevelCount}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3" aria-live="polite">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || loading}
          className="h-11 rounded-xl bg-gradient-to-r from-violet-500/90 to-fuchsia-500/80 text-base font-semibold text-white shadow-e2 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? ascendaIAStrings.summary.generating : ascendaIAStrings.summary.generate}
        </Button>
        {loading && <Progress value={70} className="h-2 overflow-hidden bg-white/10" />}
        {!loading && feedback && (
          <p className="text-xs text-warning">{feedback}</p>
        )}
        {!loading && !feedback && !canGenerate && (
          <p className="text-xs text-white/60">{ascendaIAStrings.summary.disabledHint}</p>
        )}
      </div>
    </motion.section>
  );
}
