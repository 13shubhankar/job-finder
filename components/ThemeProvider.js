// components/ThemeProvider.js
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to prevent FOUC (Flash of Unstyled Content)
const setInitialTheme = `
  (function() {
    function getTheme() {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme');
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    const theme = getTheme();
    document.documentElement.classList.add(theme);
  })();
`;

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Apply theme to HTML root
  const updateThemeClass = (newTheme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme) {
      updateThemeClass(theme);
      // Remove FOUC script after theme is set
      const script = document.getElementById('initial-theme-script');
      if (script) {
        script.remove();
      }
    }
  }, [theme]);

  // Watch for system theme changes if no manual preference
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setThemeMode = (newTheme) => {
    if (newTheme === 'system') {
      localStorage.removeItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    } else {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <>
      <script id="initial-theme-script" dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      <ThemeContext.Provider
        value={{
          theme,
          toggleTheme,
          setThemeMode,
          isDark: theme === 'dark',
          isLight: theme === 'light',
        }}
      >
        {children}
      </ThemeContext.Provider>
    </>
  );
}