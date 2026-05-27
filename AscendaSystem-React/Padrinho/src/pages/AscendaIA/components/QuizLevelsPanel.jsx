import React from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@padrinho/components/ui/checkbox";
import { Button } from "@padrinho/components/ui/button";
import { ascendaIAStrings } from "../strings";

const ACCENT_RING = {
  sky: "ring-sky-400/30",
  violet: "ring-violet-400/30",
  fuchsia: "ring-fuchsia-400/30",
};

export function QuizLevelsPanel({ levels, setLevelEnabled, setLevelCount }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.12 }}
      className="panel flex flex-col gap-5 border-border/60 bg-surface/80 p-6 shadow-e1 backdrop-blur-sm"
      aria-labelledby="ascenda-levels"
    >
      <div className="space-y-1">
        <h2 id="ascenda-levels" className="text-lg font-semibold text-white">
          {ascendaIAStrings.summary.chipsLabel}
        </h2>
        <p className="text-sm text-white/70">Fine-tune the levels and item counts before generating.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        {levels.map((level, index) => {
          const accent = ACCENT_RING[level.accent] ?? ACCENT_RING.sky;
          return (
            <motion.article
              key={level.code}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.05 * index }}
              className={`group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ${accent}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">{level.title}</h3>
                  <p className="text-sm text-white/60">{level.description}</p>
                </div>
                <Checkbox
                  id={`ascenda-card-${level.code}`}
                  checked={level.enabled}
                  onCheckedChange={(value) => setLevelEnabled(level.code, Boolean(value))}
                  className="data-[state=checked]:bg-white/90 data-[state=checked]:text-background"
                  aria-label={`Toggle ${level.title}`}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!level.enabled}
                    onClick={() => setLevelCount(level.code, Math.max(0, Number(level.count || 0) - 1))}
                    className="h-9 w-9 rounded-xl border-white/30 bg-background/70 text-lg text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Decrease ${level.title}`}
                  >
                    −
                  </Button>
                  <span className="text-lg font-semibold text-white">{level.count ?? 0}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!level.enabled}
                    onClick={() =>
                      setLevelCount(
                        level.code,
                        Math.min(
                          ascendaIAStrings.limits.maxItemsPerLevel,
                          Number(level.count || 0) + 1,
                        ),
                      )
                    }
                    className="h-9 w-9 rounded-xl border-white/30 bg-background/70 text-lg text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Increase ${level.title}`}
                  >
                    +
                  </Button>
                </div>
                <span className="text-xs uppercase tracking-[0.08em] text-white/60">
                  {level.enabled ? `${level.count} itens` : "Desativado"}
                </span>
              </div>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}
