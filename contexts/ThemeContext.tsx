import { Colors, ColorUtils } from '@/constants/Colors';
import { useTheme } from '@/hooks/useColorScheme';
import React, { createContext, ReactNode, useContext } from 'react';

interface ThemeContextType {
  colors: typeof Colors.light;
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  isLight: boolean;
  ColorUtils: typeof ColorUtils;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}; 