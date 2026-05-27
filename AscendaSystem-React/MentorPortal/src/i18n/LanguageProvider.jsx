import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en';
import pt from './pt';

const STORAGE_KEY = 'language';
export const translations = { en, pt };

function interpolate(template, values) {
  if (!template || !values) return template;
  return template.replace(/\{\{(.*?)\}\}/g, (_, token) => {
    const valueKey = token.trim();
    return Object.prototype.hasOwnProperty.call(values, valueKey)
      ? values[valueKey]
      : `{{${valueKey}}}`;
  });
}

function getNestedTranslation(language, key) {
  const source = translations[language] || translations.en;
  return key
    .split('.')
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
}

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback, values) => {
    const message = fallback ?? key;
    return typeof message === 'string' ? interpolate(message, values) : message;
  },
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && translations[stored] ? stored : 'en';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', language);
    }
  }, [language]);

  const changeLanguage = useCallback((next) => {
    setLanguage((prev) => {
      const nextLanguage = translations[next] ? next : prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      }
      return nextLanguage;
    });
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: changeLanguage,
      t: (key, fallback, values) => {
        const message = getNestedTranslation(language, key) ?? fallback ?? key;
        if (typeof message === 'string') {
          return interpolate(message, values);
        }
        return message;
      },
    }),
    [language, changeLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}
