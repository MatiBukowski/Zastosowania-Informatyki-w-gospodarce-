import React, { createContext, useContext } from 'react';
import { theme } from './theme';

type Theme = typeof theme;

const ThemeContext = createContext<Theme | undefined>(undefined);

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}