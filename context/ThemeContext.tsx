'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios'; // use your admin axios instance

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data } = await api.get('/users/preferences');
        const backendTheme: Theme = data.theme ?? 'light';

        setTheme(backendTheme);
        document.documentElement.classList.toggle('dark', backendTheme === 'dark');
      } catch (error) {
        // fallback is intentionally minimal
        setTheme('light');
        document.documentElement.classList.remove('dark');
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  /* ================= TOGGLE ================= */
  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';

    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');

    try {
      await api.put('/users/preferences', { theme: newTheme });
    } catch (error) {
      // Optional: rollback if API fails
      console.log('Failed to persist theme preference');
    }
  };

  if (loading) return null; // prevents theme flash

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
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