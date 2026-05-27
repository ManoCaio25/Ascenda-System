import React from "react";
import { Languages } from "lucide-react";
import { Button } from "@padrinho/components/ui/button";
import { useLanguage, useTranslation } from "@padrinho/i18n";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  const nextLanguage = language === "en" ? "pt" : "en";
  const currentLabel = language === "en" ? t("layout.languageToggle.english") : t("layout.languageToggle.portuguese");
  const nextLabel = nextLanguage === "en" ? t("layout.languageToggle.english") : t("layout.languageToggle.portuguese");

  const handleClick = React.useCallback(() => {
    toggleLanguage();
  }, [toggleLanguage]);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      className="flex items-center gap-2 border-border bg-surface hover:bg-surface2"
      aria-label={`${t("layout.languageToggle.label")}: ${currentLabel}`}
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium text-primary">
        {currentLabel}
      </span>
      <span className="text-xs text-muted">/ {nextLabel}</span>
    </Button>
  );
}
