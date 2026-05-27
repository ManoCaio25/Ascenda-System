import React from "react";
import { Button } from "@padrinho/components/ui/button";
import { ascendaIAStrings } from "../strings";

export function SaveDraftBar({ quiz, onDiscard, onSave }) {
  return (
    <div className="panel flex flex-col gap-3 border-border/60 bg-surface/80 p-4 shadow-e1 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-white/70" aria-live="polite">
        {quiz ? "Review the generated content before saving." : "Generate a quiz to enable saving options."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onDiscard}
          className="h-10 rounded-xl border-white/20 bg-transparent text-sm font-semibold text-white hover:bg-white/10"
        >
          {ascendaIAStrings.actions.discard}
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={!quiz}
          className="h-10 rounded-xl bg-emerald-500/80 text-sm font-semibold text-emerald-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ascendaIAStrings.actions.save}
        </Button>
      </div>
    </div>
  );
}
