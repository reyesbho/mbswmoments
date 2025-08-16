import { APP_CONFIG } from '@/constants/Config';

// Configuraciones para notificaciones
export const NOTIFICATION_CONFIG = {
  // Configuración por defecto
  DEFAULT_TIME: APP_CONFIG.notifications.defaultTime,
  DEFAULT_DAYS: APP_CONFIG.notifications.defaultDays,
  
  // Límites de tiempo para pedidos urgentes (en horas)
  URGENT_THRESHOLD: APP_CONFIG.notifications.urgentThreshold,
  URGENT_REMINDER: APP_CONFIG.notifications.urgentReminder,
  
  // Límites para mostrar pedidos urgentes en el widget
  WIDGET_URGENT_THRESHOLD: 4, // Mostrar como urgente si es en las próximas 4 horas
  
  // Mensajes de notificación
  MESSAGES: {
    NO_ORDERS: "No tienes pedidos programados para hoy.",
    SINGLE_ORDER: "Tienes 1 pedido para hoy: {cliente} - {hora}",
    MULTIPLE_ORDERS: "Tienes {count} pedidos programados para hoy.",
    URGENT_ORDERS: "Tienes {total} pedidos para hoy. {urgent} son urgentes (próximas 4 horas).",
    URGENT_REMINDER: "El pedido de {cliente} debe entregarse en 1 hora",
  },
  
  // Títulos de notificaciones
  TITLES: {
    DAILY_SUMMARY: "📋 Resumen de Pedidos del Día",
    TODAYS_ORDERS: "📋 Pedidos de Hoy",
    URGENT_ORDER: "⚠️ Pedido Urgente",
  },
  
  // Configuración para Expo Go
  EXPO_GO: {
    ENABLED: __DEV__,
    WARNING_MESSAGE: "Las notificaciones locales funcionan en Expo Go, pero para notificaciones push completas usa un development build.",
  },
};

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  DAILY_SUMMARY: 'daily_orders_summary',
  URGENT_ORDER: 'urgent_order',
  TODAYS_ORDERS: 'todays_orders',
} as const;

// Estados de permisos
export const PERMISSION_STATUS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  UNDETERMINED: 'undetermined',
  UNKNOWN: 'unknown',
} as const;
