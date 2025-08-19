const path = require('path');
const fs = require('fs');

// Cargar variables de entorno según el ambiente
function loadEnvConfig() {
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  const envFile = path.join(process.cwd(), `env.${env}`);
  
  // Verificar si existe el archivo de entorno específico
  if (fs.existsSync(envFile)) {
    require('dotenv').config({ path: envFile });
  } else {
    // Fallback al archivo .env por defecto
    require('dotenv').config();
  }
  
  return env;
}

// Configuración de entornos
const ENV_CONFIG = {
  development: {
    API_URL: 'http://localhost:3000',
    APP_NAME: 'SMoments (Dev)',
    VERSION: '1.0.0-dev',
    API_TIMEOUT: 10000,
    LOG_REQUESTS: true,
    LOG_RESPONSES: true,
  },
  preview: {
    API_URL: 'https://services.sweetmoments.mx',
    APP_NAME: 'SMoments (Preview)',
    VERSION: '1.0.0-preview',
    API_TIMEOUT: 15000,
    LOG_REQUESTS: true,
    LOG_RESPONSES: true,
  },
  production: {
    API_URL: 'https://services.sweetmoments.mx',
    APP_NAME: 'SMoments',
    VERSION: '1.0.0',
    API_TIMEOUT: 15000,
    LOG_REQUESTS: false,
    LOG_RESPONSES: false,
  }
};

// Cargar configuración
const currentEnv = loadEnvConfig();
const envConfig = ENV_CONFIG[currentEnv] || ENV_CONFIG.development;

// Configuración final con fallbacks
const config = {
  // Entorno
  ENV: currentEnv,
  IS_DEVELOPMENT: currentEnv === 'development',
  IS_PREVIEW: currentEnv === 'preview',
  IS_PRODUCTION: currentEnv === 'production',
  
  // API
  API_URL: process.env.EXPO_PUBLIC_API_URL || envConfig.API_URL,
  API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT) || envConfig.API_TIMEOUT,
  API_RETRY_ATTEMPTS: parseInt(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS) || 3,
  API_RETRY_DELAY: parseInt(process.env.EXPO_PUBLIC_API_RETRY_DELAY) || 1000,
  
  // App
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || envConfig.APP_NAME,
  VERSION: process.env.EXPO_PUBLIC_VERSION || envConfig.VERSION,
  
  // Logging
  LOG_REQUESTS: process.env.EXPO_PUBLIC_LOG_REQUESTS === 'true' || envConfig.LOG_REQUESTS,
  LOG_RESPONSES: process.env.EXPO_PUBLIC_LOG_RESPONSES === 'true' || envConfig.LOG_RESPONSES,
  
  // Notifications
  NOTIFICATION_DEFAULT_TIME: process.env.EXPO_PUBLIC_NOTIFICATION_DEFAULT_TIME || '08:00',
  NOTIFICATION_URGENT_THRESHOLD: parseInt(process.env.EXPO_PUBLIC_NOTIFICATION_URGENT_THRESHOLD) || 2,
  NOTIFICATION_URGENT_REMINDER: parseInt(process.env.EXPO_PUBLIC_NOTIFICATION_URGENT_REMINDER) || 1,
};

module.exports = config;
