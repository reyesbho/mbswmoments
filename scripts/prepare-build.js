const fs = require('fs');
const path = require('path');

const buildProfile = process.argv[2];

if (!buildProfile || !['development', 'preview', 'production'].includes(buildProfile)) {
  console.log('❌ Uso: node scripts/prepare-build.js [development|preview|production]');
  console.log('Ejemplo: node scripts/prepare-build.js preview');
  process.exit(1);
}

const envFiles = {
  development: 'env.development',
  preview: 'env.preview',
  production: 'env.production'
};

const sourceFile = path.join(__dirname, '..', envFiles[buildProfile]);
const targetFile = path.join(__dirname, '..', '.env');

try {
  // Leer el archivo de entorno correspondiente
  const envContent = fs.readFileSync(sourceFile, 'utf8');
  
  // Escribir al archivo .env
  fs.writeFileSync(targetFile, envContent);
  
  console.log(`✅ Entorno preparado para build: ${buildProfile.toUpperCase()}`);
  console.log(`📁 Archivo .env actualizado desde: ${envFiles[buildProfile]}`);
  
  // Mostrar información del entorno
  const envInfo = {
    development: { apiUrl: 'http://localhost:3000', appName: 'SMoments (Dev)' },
    preview: { apiUrl: 'https://services.sweetmoments.mx', appName: 'SMoments (Preview)' },
    production: { apiUrl: 'https://services.sweetmoments.mx', appName: 'SMoments' }
  };
  
  const info = envInfo[buildProfile];
  console.log(`🌐 URL de la API: ${info.apiUrl}`);
  console.log(`📱 Nombre de la App: ${info.appName}`);
  
} catch (error) {
  console.error('❌ Error al preparar el entorno:', error.message);
  process.exit(1);
}
