import { Colors, ColorUtils } from '@/constants/Colors';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export const useColorScheme = (): 'light' | 'dark' => {
  const colorScheme = useSystemColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

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
