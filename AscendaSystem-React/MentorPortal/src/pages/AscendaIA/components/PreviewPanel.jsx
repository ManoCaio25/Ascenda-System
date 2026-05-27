import React from "react";
import { motion } from "framer-motion";
import { ascendaIAStrings } from "../strings";

function PreviewColumn({ label, items }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/90">{label}</h3>
        <span className="text-xs text-white/50">{items.length}</span>
      </div>
      <ul className="preview-list space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        {items.length === 0 && <li className="text-white/40">No items</li>}
        {items.slice(0, 8).map((item) => (
          <li key={item.id} className="leading-snug">
            <span className="text-white/60">•</span> {item.prompt}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PreviewPanel({ quiz }) {
  const totalItems = (quiz?.easy?.length || 0) + (quiz?.intermediate?.length || 0) + (quiz?.advanced?.length || 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.18 }}
      className="panel flex flex-col gap-5 border-border/60 bg-surface/80 p-6 shadow-e1 backdrop-blur-sm"
      aria-labelledby="ascenda-preview"
    >
      <div className="space-y-1">
        <h2 id="ascenda-preview" className="text-lg font-semibold text-white">
          {ascendaIAStrings.preview.heading}
        </h2>
        <p className="text-sm text-white/70">{ascendaIAStrings.preview.description}</p>
      </div>

      {!quiz && <p className="text-sm text-white/60">{ascendaIAStrings.preview.emptyState}</p>}

      {quiz && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-white/50">{quiz.source}</p>
                <h3 className="text-xl font-semibold text-white">{quiz.topic}</h3>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                {ascendaIAStrings.preview.totalItems.replace("{{count}}", totalItems)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <PreviewColumn label={ascendaIAStrings.preview.columnLabels.easy} items={quiz.easy} />
            <PreviewColumn label={ascendaIAStrings.preview.columnLabels.intermediate} items={quiz.intermediate} />
            <PreviewColumn label={ascendaIAStrings.preview.columnLabels.advanced} items={quiz.advanced} />
          </div>
        </div>
      )}
    </motion.section>
  );
}
