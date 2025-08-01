import { Colors, ColorUtils } from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}

export const useTheme = () => {
  const colorScheme = useColorScheme();
  return {
    colors: Colors[colorScheme],
    colorScheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
    ColorUtils,
  };
};
