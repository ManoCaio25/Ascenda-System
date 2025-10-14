import { useState, useEffect, createContext, useContext } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('ascenda-high-contrast') === 'true';
  });

  const [focusMode, setFocusMode] = useState(() => {
    return localStorage.getItem('ascenda-focus-mode') === 'true';
  });

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('ascenda-high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    if (focusMode) {
      document.documentElement.classList.add('focus-mode');
    } else {
      document.documentElement.classList.remove('focus-mode');
    }
    localStorage.setItem('ascenda-focus-mode', focusMode);
  }, [focusMode]);

  const toggleHighContrast = () => setHighContrast(!highContrast);
  const toggleFocusMode = () => setFocusMode(!focusMode);

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      focusMode,
      toggleHighContrast,
      toggleFocusMode
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};