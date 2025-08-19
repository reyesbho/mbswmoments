import { ConfigContext, ExpoConfig } from 'expo/config';

// Importar configuración centralizada
const envConfig = require('./config/env');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: envConfig.APP_NAME,
  slug: 'mbswmoments',
  version: envConfig.VERSION,
  orientation: 'portrait',
  icon: './assets/images/sweet-moments.png',
  scheme: 'mbswmoments',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  
  // Configuración específica por plataforma
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.sweetmoments.mbswmoments',
  },
  
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/sweet-moments.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: 'com.sweetmoments.mbswmoments',
  },
  
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  
  // Plugins
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],
  
  // Experimentos
  experiments: {
    typedRoutes: true,
  },
  
  // Variables de entorno
  extra: {
    // Entorno
    isDevelopment: envConfig.IS_DEVELOPMENT,
    isPreview: envConfig.IS_PREVIEW,
    isProduction: envConfig.IS_PRODUCTION,
    
    // API
    apiUrl: envConfig.API_URL,
    apiTimeout: envConfig.API_TIMEOUT,
    apiRetryAttempts: envConfig.API_RETRY_ATTEMPTS,
    apiRetryDelay: envConfig.API_RETRY_DELAY,
    
    // App
    appName: envConfig.APP_NAME,
    version: envConfig.VERSION,
    
    // Logging
    logRequests: envConfig.LOG_REQUESTS,
    logResponses: envConfig.LOG_RESPONSES,
    
    // Notifications
    notificationDefaultTime: envConfig.NOTIFICATION_DEFAULT_TIME,
    notificationUrgentThreshold: envConfig.NOTIFICATION_URGENT_THRESHOLD,
    notificationUrgentReminder: envConfig.NOTIFICATION_URGENT_REMINDER,
    
    // EAS Project ID
    eas: {
      projectId: '21d40380-ad65-474f-aed4-acb2867529fa',
    },
  },
});
