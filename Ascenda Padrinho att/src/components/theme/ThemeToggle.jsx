import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from '@padrinho/components/ui/button';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="rounded-xl border-border bg-surface hover:bg-surface2 transition-all duration-350"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-brand" />
      ) : (
        <Moon className="w-4 h-4 text-brand" />
      )}
    </Button>
  );
}