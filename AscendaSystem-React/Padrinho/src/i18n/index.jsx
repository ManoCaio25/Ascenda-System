import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import en from './en';
import pt from './pt';

const STORAGE_KEY = 'language';
const translations = { en, pt };

function getNestedTranslation(language, key) {
  const source = translations[language] || translations.en;
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
}

function interpolate(template, values) {
  if (!template || !values) return template;
  return template.replace(/\{\{(.*?)\}\}/g, (_, token) => {
    const valueKey = token.trim();
    return Object.prototype.hasOwnProperty.call(values, valueKey)
      ? values[valueKey]
      : `{{${valueKey}}}`;
  });
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

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

  const value = useMemo(() => ({
    language,
    setLanguage: changeLanguage,
    t: (key, fallback, values) => {
      let resolvedFallback = fallback;
      let interpolationValues = values;

      if (
        typeof fallback === 'object' &&
        fallback !== null &&
        !Array.isArray(fallback) &&
        values === undefined
      ) {
        interpolationValues = fallback;
        resolvedFallback = undefined;
      }

      const message = getNestedTranslation(language, key) ?? resolvedFallback ?? key;

      if (typeof message === 'string') {
        return interpolate(message, interpolationValues);
      }

      return message;
    },
  }), [language, changeLanguage]);

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

export function useLanguage() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = useCallback(() => {
    const next = language === 'en' ? 'pt' : 'en';
    setLanguage(next);
  }, [language, setLanguage]);

  return useMemo(
    () => ({ language, setLanguage, toggleLanguage }),
    [language, setLanguage, toggleLanguage],
  );
}

export { translations };
