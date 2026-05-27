import React from "react";
import { motion } from "framer-motion";
import { Filter, Search, XCircle } from "lucide-react";
import { Input } from "@padrinho/components/ui/input";
import { Button } from "@padrinho/components/ui/button";
import { Badge } from "@padrinho/components/ui/badge";

export default function LibraryFilterCard({
  t,
  searchTerm,
  onSearchTermChange,
  onClearFilters,
  hasActiveFilters,
  trainingOptions,
  trainingFilter,
  onTrainingFilterChange,
  coursesCount,
  filteredCount,
  activeTrainingOption,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-e1 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Filter className="h-4 w-4" />
        {t("content.libraryTitle", "Course Library")}
      </div>

      <div className="mt-4 flex flex-col gap-6 md:gap-8">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="space-y-2">
            <label
              htmlFor="course-search"
              className="text-xs font-medium uppercase tracking-wide text-muted"
            >
              {t("content.filters.searchLabel", "Search courses")}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="course-search"
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder={t(
                  "content.filters.searchPlaceholder",
                  "Search by title or description",
                )}
                className="h-11 rounded-2xl border-border/60 bg-surface2/70 pl-10 text-sm text-primary placeholder:text-muted"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              className="justify-center gap-2 rounded-full border border-transparent bg-surface2/70 px-4 py-2 text-sm text-secondary hover:border-border/60 hover:bg-surface2"
              onClick={onClearFilters}
            >
              <XCircle className="h-4 w-4" />
              {t("content.filters.clear", "Clear filters")}
            </Button>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {t("content.filters.trainingType", "Training type")}
          </p>
          <div
            className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-surface2/60 p-2"
            role="group"
            aria-label={t("content.filters.trainingType", "Training type")}
          >
            {trainingOptions.map((option) => {
              const isActive = trainingFilter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onTrainingFilterChange(option.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    isActive
                      ? "border-brand bg-brand text-white shadow-e2"
                      : "border-transparent bg-transparent text-secondary hover:border-brand/40 hover:bg-brand/5 hover:text-primary"
                  }`}
                  aria-pressed={isActive}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <Badge className="rounded-full border border-brand/30 bg-brand/10 text-brand">
            {t("content.courseCount", "{{count}} course{{suffix}}", {
              count: coursesCount,
              suffix: coursesCount === 1 ? "" : "s",
            })}
          </Badge>
          <span>
            {t("content.resultsCount", "Showing {{count}} course{{suffix}}", {
              count: filteredCount,
              suffix: filteredCount === 1 ? "" : "s",
            })}
          </span>
          {trainingFilter !== "all" && activeTrainingOption && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface2 px-3 py-1 text-xs text-secondary">
              {t("content.filters.activeLabel", "Filtered by")} {activeTrainingOption.label}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
