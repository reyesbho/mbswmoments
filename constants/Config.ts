
// Configuración de entorno
export const ENV = {
  // Determinar el entorno actual usando Expo Constants o __DEV__
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  
  // URLs de la API según el entorno
  API_URL: __DEV__ ? 'http://192.168.3.19:3000' : 'https://services.sweetmoments.mx',
    
  // Configuraciones adicionales por entorno
  DEVELOPMENT: {
    API_URL: 'http://192.168.3.19:3000',
    TIMEOUT: 10000,
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
  return ENV.isDevelopment ? ENV.DEVELOPMENT : ENV.PRODUCTION;
};

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'mbswmoments',
  version: '1.0.0',
  description: 'Sweet Moments - Gestión de Pedidos',
  
  // Configuración de notificaciones
  notifications: {
    defaultTime: '08:00',
    defaultDays: [1, 2, 3, 4, 5, 6, 0], // Lunes a domingo
    urgentThreshold: 2, // horas
    urgentReminder: 1, // hora antes
  },
  
  // Configuración de la API
  api: {
    baseURL: ENV.API_URL,
    timeout: getCurrentConfig().TIMEOUT,
    retryAttempts: 3,
    retryDelay: 1000,
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
