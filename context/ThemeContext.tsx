'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/axios'; // use your admin axios instance

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setThemePreference: (nextTheme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
const AUTH_ROUTES = ['/', '/register', '/forgot-password', '/reset-password'];

const parseThemeFromResponse = (data: any): Theme | null => {
  const value =  data?.preferences?.theme;
  if (value === 'dark' || value === 'light') return value;
  return null;
};

const applyThemeClass = (nextTheme: Theme) => {
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  document.documentElement.setAttribute('data-theme', nextTheme);
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-theme', nextTheme);
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('provider_theme') === 'dark' ? 'dark' : 'light';
  });
  const [loading, setLoading] = useState(true);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const loadTheme = async () => {
      if (isAuthRoute) {
        setTheme('light');
        applyThemeClass('light');
        setLoading(false);
        return;
      }

      const cachedTheme: Theme =
        typeof window !== 'undefined' && localStorage.getItem('provider_theme') === 'dark'
          ? 'dark'
          : 'light';

      setTheme(cachedTheme);
      applyThemeClass(cachedTheme);

      try {
        const { data } = await api.get('/providers/preferences');
        const backendTheme = parseThemeFromResponse(data);

        if (backendTheme) {
          setTheme(backendTheme);
          applyThemeClass(backendTheme);
          if (typeof window !== 'undefined') localStorage.setItem('provider_theme', backendTheme);
        }
      } catch (error) {
        // keep cached/default theme if preferences endpoint isn't available for this session
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [isAuthRoute]);

  /* ================= TOGGLE ================= */
  const setThemePreference = async (nextTheme: Theme) => {
    setTheme(nextTheme);
    applyThemeClass(nextTheme);
    if (typeof window !== 'undefined') localStorage.setItem('provider_theme', nextTheme);

    try {
      await api.put('/providers/preferences', { theme: nextTheme });
    } catch (error) {
      try {
        await api.put('/providers/preferences', { preferences: { theme: nextTheme } });
      } catch {
        console.log('Failed to persist theme preference');
      }
    }
  };

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    await setThemePreference(newTheme);
  };

  if (loading) return null; // prevents theme flash

  return (
    <ThemeContext.Provider value={{ theme, setThemePreference, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ================= HOOK ================= */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
