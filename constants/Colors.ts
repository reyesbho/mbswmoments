/**
 * Color scheme based on the interface design from context/interfaces_img
 * Modern dark theme with blue accents for a professional look
 */

import { Order } from "@/types";

// Primary brand colors
const primaryBlue = '#2563EB'; // Main blue accent
const primaryBlueLight = '#3B82F6'; // Lighter blue for hover states
const primaryBlueDark = '#1D4ED8'; // Darker blue for pressed states

// Secondary colors
const secondaryBlue = '#0EA5E9'; // Secondary blue for highlights
const accentBlue = '#06B6D4'; // Cyan blue for special elements

// Neutral colors
const neutral50 = '#F8FAFC';
const neutral100 = '#F1F5F9';
const neutral200 = '#E2E8F0';
const neutral300 = '#CBD5E1';
const neutral400 = '#94A3B8';
const neutral500 = '#64748B';
const neutral600 = '#475569';
const neutral700 = '#334155';
const neutral800 = '#1E293B';
const neutral900 = '#0F172A';

// Status colors
const successGreen = '#10B981';
const warningYellow = '#F59E0B';
const errorRed = '#EF4444';

export const getStatusColor = (order: Order) => {
  // Si el pedido tiene un estado específico, usarlo
  if (order.estatus === 'DONE') return OrderStatusColors.DONE;
  if (order.estatus === 'CANCELED') return OrderStatusColors.CANCELED;
  if (order.estatus === 'INCOMPLETE') return OrderStatusColors.INCOMPLETE;
  if (order.estatus === 'BACKLOG') return OrderStatusColors.BACKLOG;
  if (order.estatus === 'DELETE') return OrderStatusColors.DELETE;
}

// Order status colors - Paleta suave y accesible
export const OrderStatusColors = {
  DONE: '#059669',        // Verde bosque - Completado
  BACKLOG: '#D97706',     // Ámbar suave - Pendiente
  CANCELED: '#DC2626',    // Rojo - Cancelado
  INCOMPLETE: '#EA580C',  // Naranja - Incompleto
  DELETE: '#B91C1C',      // Rojo oscuro - Eliminado
  PENDING: '#2563EB',     // Azul - En proceso
} as const;

export const Colors = {
  light: {
    // Text colors
    text: neutral900,
    textSecondary: neutral600,
    textTertiary: neutral500,
    textInverse: neutral50,
    
    // Background colors
    background: neutral50,
    backgroundSecondary: neutral100,
    backgroundTertiary: neutral200,
    surface: '#FFFFFF',
    surfaceSecondary: neutral100,
    
    // Brand colors
    primary: primaryBlue,
    primaryLight: primaryBlueLight,
    primaryDark: primaryBlueDark,
    secondary: secondaryBlue,
    accent: accentBlue,
    
    // Status colors
    success: successGreen,
    warning: warningYellow,
    error: errorRed,
    
    // UI elements
    border: neutral200,
    borderSecondary: neutral300,
    divider: neutral200,
    
    // Tab colors
    tabIconDefault: neutral500,
    tabIconSelected: primaryBlue,
    
    // Icon colors
    icon: neutral600,
    iconSecondary: neutral500,
    
    // Tint for navigation
    tint: primaryBlue,
  },
  dark: {
    // Text colors
    text: neutral50,
    textSecondary: neutral300,
    textTertiary: neutral400,
    textInverse: neutral900,
    
    // Background colors
    background: neutral900,
    backgroundSecondary: neutral800,
    backgroundTertiary: neutral700,
    surface: neutral800,
    surfaceSecondary: neutral700,
    
    // Brand colors
    primary: primaryBlue,
    primaryLight: primaryBlueLight,
    primaryDark: primaryBlueDark,
    secondary: secondaryBlue,
    accent: accentBlue,
    
    // Status colors
    success: successGreen,
    warning: warningYellow,
    error: errorRed,
    
    // UI elements
    border: neutral700,
    borderSecondary: neutral600,
    divider: neutral700,
    
    // Tab colors
    tabIconDefault: neutral500,
    tabIconSelected: primaryBlue,
    
    // Icon colors
    icon: neutral400,
    iconSecondary: neutral500,
    
    // Tint for navigation
    tint: primaryBlue,
  },
};

// Additional color utilities
export const ColorUtils = {
  // Opacity variants
  withOpacity: (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  
  // Status colors with opacity
  successLight: (opacity = 0.1) => ColorUtils.withOpacity(successGreen, opacity),
  warningLight: (opacity = 0.1) => ColorUtils.withOpacity(warningYellow, opacity),
  errorLight: (opacity = 0.1) => ColorUtils.withOpacity(errorRed, opacity),
  primaryLight: (opacity = 0.1) => ColorUtils.withOpacity(primaryBlue, opacity),
};
