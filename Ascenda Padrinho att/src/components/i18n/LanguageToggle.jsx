import React, { useMemo } from 'react';
import { useTranslation } from '@padrinho/i18n';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation();

  const options = useMemo(
    () => [
      { code: 'pt', emoji: '🇧🇷', label: t('layout.languageToggle.portuguese') },
      { code: 'en', emoji: '🇺🇸', label: t('layout.languageToggle.english') },
    ],
    [t],
  );

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface2/80 p-1">
      {options.map((option) => {
        const isActive = option.code === language;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguage(option.code)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors ${
              isActive
                ? 'bg-surface shadow-e1 ring-2 ring-brand'
                : 'hover:bg-surface/80 text-muted'
            }`}
            aria-pressed={isActive}
            aria-label={option.label}
            title={option.label}
          >
            <span aria-hidden="true" role="img" className="text-lg leading-none">
              {option.emoji}
            </span>
          </button>
        );
      })}
    </div>
  );
}
