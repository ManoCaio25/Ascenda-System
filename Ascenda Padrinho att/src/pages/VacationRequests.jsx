import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@padrinho/i18n";
import VacationRequestsPanel from "../components/vacation/VacationRequestsPanel";

export default function VacationRequests() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {t("vacation.title")}
          </h1>
          <p className="text-muted">{t("vacation.subtitle")}</p>
        </motion.div>

        <VacationRequestsPanel />
      </div>
    </div>
  );
}