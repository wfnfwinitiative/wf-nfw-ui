import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'theme';

function getStored() {
  if (typeof window === 'undefined') return 'light';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'dark' || v === 'light' ? v : 'light';
}

function applyTheme(value) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', value === 'dark');
}

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getStored);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  return ctx || { theme: 'light', setTheme: () => {} };
};
