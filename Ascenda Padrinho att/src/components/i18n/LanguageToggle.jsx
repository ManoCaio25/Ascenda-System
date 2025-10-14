import React from 'react';
import { useTranslation } from '@padrinho/i18n';

const options = [
  { code: 'pt', flag: 'br', fallbackEmoji: '🇧🇷', label: 'Português' },
  { code: 'en', flag: 'us', fallbackEmoji: '🇺🇸', label: 'English' },
];

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

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
            aria-label={option.label}
            title={option.label}
          >
            {option.flag ? (
              <span
                aria-hidden="true"
                className={`fi fi-${option.flag.toLowerCase()} text-[1.25rem]`}
              />
            ) : (
              <span aria-hidden="true" role="img" className="text-lg leading-none">
                {option.fallbackEmoji}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
