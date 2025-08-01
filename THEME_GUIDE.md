# Theme System Guide

This guide explains how to use the new theme system based on the interface design from `context/interfaces_img`.

## Overview

The theme system provides a consistent color scheme throughout the app, with support for both light and dark modes. The colors are inspired by the modern interface design shown in the reference images.

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563EB` - Main brand color for buttons and highlights
- **Primary Light**: `#3B82F6` - Lighter variant for hover states
- **Primary Dark**: `#1D4ED8` - Darker variant for pressed states

### Secondary Colors
- **Secondary Blue**: `#0EA5E9` - Secondary brand color
- **Accent Blue**: `#06B6D4` - Cyan blue for special elements

### Status Colors
- **Success**: `#10B981` - Green for success states
- **Warning**: `#F59E0B` - Yellow for warning states
- **Error**: `#EF4444` - Red for error states

### Neutral Colors
The system uses a comprehensive neutral color palette from 50 to 900 for backgrounds, text, and borders.

## Usage

### 1. Using the Theme Hook

```tsx
import { useAppTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { colors, isDark, isLight, ColorUtils } = useAppTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Hello World
      </Text>
    </View>
  );
}
```

### 2. Available Color Properties

#### Text Colors
- `colors.text` - Primary text color
- `colors.textSecondary` - Secondary text color
- `colors.textTertiary` - Tertiary text color
- `colors.textInverse` - Text color for dark backgrounds

#### Background Colors
- `colors.background` - Main background color
- `colors.backgroundSecondary` - Secondary background
- `colors.backgroundTertiary` - Tertiary background
- `colors.surface` - Surface color for cards
- `colors.surfaceSecondary` - Secondary surface color

#### Brand Colors
- `colors.primary` - Primary brand color
- `colors.primaryLight` - Light primary variant
- `colors.primaryDark` - Dark primary variant
- `colors.secondary` - Secondary brand color
- `colors.accent` - Accent color

#### Status Colors
- `colors.success` - Success color
- `colors.warning` - Warning color
- `colors.error` - Error color

#### UI Elements
- `colors.border` - Border color
- `colors.borderSecondary` - Secondary border color
- `colors.divider` - Divider color
- `colors.icon` - Icon color
- `colors.iconSecondary` - Secondary icon color

### 3. Using Color Utilities

```tsx
import { useAppTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { ColorUtils } = useAppTheme();
  
  return (
    <View style={{ 
      backgroundColor: ColorUtils.primaryLight(0.1) // 10% opacity
    }}>
      <Text>Content</Text>
    </View>
  );
}
```

### 4. Pre-built Components

#### ThemedButton

```tsx
import { ThemedButton } from '@/components/ThemedButton';

function MyScreen() {
  return (
    <View>
      <ThemedButton title="Primary Button" variant="primary" />
      <ThemedButton title="Secondary Button" variant="secondary" />
      <ThemedButton title="Outline Button" variant="outline" />
      <ThemedButton title="Ghost Button" variant="ghost" />
    </View>
  );
}
```

#### ThemedCard

```tsx
import { ThemedCard } from '@/components/ThemedCard';

function MyScreen() {
  return (
    <View>
      <ThemedCard variant="default">
        <Text>Default Card</Text>
      </ThemedCard>
      
      <ThemedCard variant="elevated">
        <Text>Elevated Card</Text>
      </ThemedCard>
      
      <ThemedCard variant="outlined">
        <Text>Outlined Card</Text>
      </ThemedCard>
    </View>
  );
}
```

## Best Practices

### 1. Always Use Theme Colors
Instead of hardcoding colors, always use the theme system:

```tsx
// ❌ Don't do this
<View style={{ backgroundColor: '#2563EB' }}>

// ✅ Do this instead
<View style={{ backgroundColor: colors.primary }}>
```

### 2. Use Semantic Color Names
Use semantic color names that describe the purpose:

```tsx
// ✅ Good
<Text style={{ color: colors.textSecondary }}>Subtitle</Text>
<View style={{ backgroundColor: colors.surface }}>Card</View>

// ❌ Avoid
<Text style={{ color: colors.neutral500 }}>Subtitle</Text>
```

### 3. Leverage Color Utilities
Use the ColorUtils for opacity variants:

```tsx
// ✅ Good
<View style={{ backgroundColor: ColorUtils.primaryLight(0.1) }}>

// ❌ Avoid
<View style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
```

### 4. Test Both Themes
Always test your components in both light and dark modes:

```tsx
function MyComponent() {
  const { colors, isDark } = useAppTheme();
  
  return (
    <View style={{ 
      backgroundColor: colors.background,
      // Add specific styling for dark mode if needed
      ...(isDark && { borderColor: colors.borderSecondary })
    }}>
      <Text style={{ color: colors.text }}>Content</Text>
    </View>
  );
}
```

## Migration Guide

### From Old Color System

If you're migrating from the old color system:

1. Replace direct color imports with `useAppTheme()`
2. Update color references to use semantic names
3. Test components in both light and dark modes
4. Use the new themed components where possible

### Example Migration

```tsx
// Old way
import { Colors } from '@/constants/Colors';
<View style={{ backgroundColor: Colors.light.background }}>

// New way
import { useAppTheme } from '@/contexts/ThemeContext';
const { colors } = useAppTheme();
<View style={{ backgroundColor: colors.background }}>
```

## Theme Context Setup

The theme system is automatically set up in the root layout. The `ThemeProvider` wraps the entire app, making theme colors available throughout the component tree.

```tsx
// In app/_layout.tsx
<ThemeProvider>
  <AuthProvider>
    <AppContent />
  </AuthProvider>
</ThemeProvider>
```

This ensures that all components have access to the theme context and can respond to system theme changes automatically. 