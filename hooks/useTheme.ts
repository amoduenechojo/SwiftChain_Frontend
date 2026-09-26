// hooks/useTheme.ts

import { useState, useEffect, useCallback } from 'react';
import { ThemeService, Theme } from '@/services/themeService';

export const useTheme = (userId?: string) => {
  const [theme, setThemeState] = useState<Theme>('system');

  const updateTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      ThemeService.setThemeToStorage(newTheme);

      if (userId) {
        ThemeService.syncThemeToAPI(userId, newTheme).catch(console.error);
      }
    },
    [userId]
  );

  useEffect(() => {
    const initializeTheme = async () => {
      // 1. Sync from local storage immediately to match the blocking script
      const localTheme = ThemeService.getThemeFromStorage();
      if (localTheme) {
        setThemeState(localTheme);
      }

      // 2. Fetch authoritative theme from Backend API if user is logged in
      if (userId) {
        try {
          const apiTheme = await ThemeService.fetchThemeFromAPI(userId);
          if (apiTheme && apiTheme !== localTheme) {
            updateTheme(apiTheme); 
          }
        } catch (error) {
          console.error('Failed to sync theme from API:', error);
        }
      }
    };
    initializeTheme();
  }, [userId, updateTheme]);

  // Apply theme to DOM when state changes
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && ThemeService.getSystemPreference() === 'dark');

    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  }, [theme]);

  // Listen for OS-level preference changes if set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const root = window.document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme: updateTheme };
};