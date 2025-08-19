const fs = require('fs');
const path = require('path');

try {
  // Leer el archivo .env actual
  const envFile = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envFile)) {
    console.log('❌ Archivo .env no encontrado');
    process.exit(1);
  }
  
  // Cargar variables del archivo .env
  require('dotenv').config({ path: envFile });
  
  // Configuración basada en las variables de entorno
  const config = {
    ENV: process.env.EXPO_PUBLIC_ENV || 'development',
    APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'SMoments',
    VERSION: process.env.EXPO_PUBLIC_VERSION || '1.0.0',
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT) || 10000,
    API_RETRY_ATTEMPTS: parseInt(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS) || 3,
    API_RETRY_DELAY: parseInt(process.env.EXPO_PUBLIC_API_RETRY_DELAY) || 1000,
    LOG_REQUESTS: process.env.EXPO_PUBLIC_LOG_REQUESTS === 'true',
    LOG_RESPONSES: process.env.EXPO_PUBLIC_LOG_RESPONSES === 'true',
    NOTIFICATION_DEFAULT_TIME: process.env.EXPO_PUBLIC_NOTIFICATION_DEFAULT_TIME || '08:00',
    NOTIFICATION_URGENT_THRESHOLD: parseInt(process.env.EXPO_PUBLIC_NOTIFICATION_URGENT_THRESHOLD) || 2,
    NOTIFICATION_URGENT_REMINDER: parseInt(process.env.EXPO_PUBLIC_NOTIFICATION_URGENT_REMINDER) || 1,
  };
  
  console.log('🔍 Configuración Actual del Entorno');
  console.log('=====================================');
  console.log(`📱 Entorno: ${config.ENV.toUpperCase()}`);
  console.log(`📱 Nombre de la App: ${config.APP_NAME}`);
  console.log(`📱 Versión: ${config.VERSION}`);
  console.log(`🌐 URL de la API: ${config.API_URL}`);
  console.log(`⏱️  Timeout de API: ${config.API_TIMEOUT}ms`);
  console.log(`🔄 Reintentos: ${config.API_RETRY_ATTEMPTS}`);
  console.log(`⏳ Delay entre reintentos: ${config.API_RETRY_DELAY}ms`);
  console.log(`📝 Log Requests: ${config.LOG_REQUESTS ? '✅' : '❌'}`);
  console.log(`📝 Log Responses: ${config.LOG_RESPONSES ? '✅' : '❌'}`);
  console.log(`🔔 Hora por defecto: ${config.NOTIFICATION_DEFAULT_TIME}`);
  console.log(`⚠️  Umbral urgente: ${config.NOTIFICATION_URGENT_THRESHOLD}h`);
  console.log(`⏰ Recordatorio urgente: ${config.NOTIFICATION_URGENT_REMINDER}h antes`);
  
  // Verificar archivo .env
  if (fs.existsSync(envFile)) {
    console.log('\n📁 Archivo .env encontrado');
    const envContent = fs.readFileSync(envFile, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`📄 Variables definidas: ${lines.length}`);
  } else {
    console.log('\n❌ Archivo .env no encontrado');
  }
  
} catch (error) {
  console.error('❌ Error al verificar la configuración:', error.message);
  process.exit(1);
}
