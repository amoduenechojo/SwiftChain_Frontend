'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  // Avoid hydration mismatch by only rendering theme-dependent UI after
  // the component has mounted on the client. Initial server and first
  // client render will match (mounted === false).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const iconClassName = 'h-5 w-5';

  return (
    <button
      type="button"
      onClick={() => void toggleTheme()}
      aria-label={
        mounted
          ? isDark
            ? 'Switch to light mode'
            : 'Switch to dark mode'
          : 'Toggle theme'
      }
      data-tour="theme-toggle"
      className="inline-flex items-center justify-center rounded-md border border-secondary/40 p-2 transition-colors hover:bg-secondary/20"
    >
      {mounted ? (
        isDark ? (
          <Sun className={iconClassName} />
        ) : (
          <Moon className={iconClassName} />
        )
      ) : (
        // Render a neutral placeholder that matches on server and initial client render
        <span className={iconClassName} aria-hidden />
      )}
    </button>
  );
}
