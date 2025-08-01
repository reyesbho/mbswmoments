import { useAppTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface ThemedCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  ...props
}) => {
  const { colors } = useAppTheme();

  const getCardStyle = () => {
    const baseStyle = [styles.card, styles[padding]];
    
    switch (variant) {
      case 'default':
        return [...baseStyle, { 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }];
      case 'elevated':
        return [...baseStyle, { 
          backgroundColor: colors.surface,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }];
      case 'outlined':
        return [...baseStyle, { 
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderSecondary 
        }];
      default:
        return [...baseStyle, { 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }];
    }
  };

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
  },
  small: {
    padding: 12,
  },
  medium: {
    padding: 16,
  },
  large: {
    padding: 20,
  },
}); 