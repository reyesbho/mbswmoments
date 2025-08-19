
import Constants from 'expo-constants';

// Obtener configuración desde Expo Constants
const extra = Constants.expoConfig?.extra || {};

// Configuración de entorno desde la configuración centralizada
export const ENV = {
  // Entorno actual
  isDevelopment: extra.isDevelopment || __DEV__,
  isPreview: extra.isPreview || false,
  isProduction: extra.isProduction || !__DEV__,
  
  // URLs de la API
  API_URL: extra.apiUrl || (__DEV__ ? 'http://localhost:3000' : 'https://services.sweetmoments.mx'),
  
  // Configuraciones por entorno
  DEVELOPMENT: {
    API_URL: 'http://localhost:3000',
    TIMEOUT: 10000,
    LOG_REQUESTS: true,
    LOG_RESPONSES: true,
  },
  
  PREVIEW: {
    API_URL: 'https://services.sweetmoments.mx',
    TIMEOUT: 15000,
    LOG_REQUESTS: true,
    LOG_RESPONSES: true,
  },
  
  PRODUCTION: {
    API_URL: 'https://services.sweetmoments.mx',
    TIMEOUT: 15000,
    LOG_REQUESTS: false,
    LOG_RESPONSES: false,
  },
};

// Obtener configuración actual según el entorno
export const getCurrentConfig = () => {
  if (ENV.isDevelopment) return ENV.DEVELOPMENT;
  if (ENV.isPreview) return ENV.PREVIEW;
  return ENV.PRODUCTION;
};

// Configuración de la aplicación
export const APP_CONFIG = {
  name: extra.appName || 'SMoments',
  version: extra.version || '1.0.0',
  description: 'Sweet Moments - Gestión de Pedidos',
  
  // Configuración de notificaciones
  notifications: {
    defaultTime: extra.notificationDefaultTime || '08:00',
    defaultDays: [1, 2, 3, 4, 5, 6, 0], // Lunes a domingo
    urgentThreshold: extra.notificationUrgentThreshold || 2, // horas
    urgentReminder: extra.notificationUrgentReminder || 1, // hora antes
  },
  
  // Configuración de la API
  api: {
    baseURL: ENV.API_URL,
    timeout: extra.apiTimeout || getCurrentConfig().TIMEOUT,
    retryAttempts: extra.apiRetryAttempts || 3,
    retryDelay: extra.apiRetryDelay || 1000,
  },
  
  // Configuración de almacenamiento
  storage: {
    tokenKey: 'auth_token',
    userKey: 'user_data',
    settingsKey: 'app_settings',
  },
  
  // Configuración de navegación
  navigation: {
    defaultRoute: '/',
    authRoute: '/auth',
    ordersRoute: '/',
    profileRoute: '/profile',
  },
};

// Exportar configuración por defecto
export default APP_CONFIG;
