const fs = require('fs');
const path = require('path');

const envType = process.argv[2];

if (!envType || !['development', 'production'].includes(envType)) {
  console.log('❌ Uso: node scripts/set-env.js [development|production]');
  console.log('Ejemplo: node scripts/set-env.js development');
  process.exit(1);
}

const envFiles = {
  development: 'env.development',
  production: 'env.production'
};

const sourceFile = path.join(__dirname, '..', envFiles[envType]);
const targetFile = path.join(__dirname, '..', '.env');

try {
  // Leer el archivo de entorno correspondiente
  const envContent = fs.readFileSync(sourceFile, 'utf8');
  
  // Escribir al archivo .env
  fs.writeFileSync(targetFile, envContent);
  
  console.log(`✅ Entorno configurado como: ${envType.toUpperCase()}`);
  console.log(`📁 Archivo .env actualizado desde: ${envFiles[envType]}`);
  
  // Mostrar la URL de la API
  const apiUrl = envType === 'development' 
    ? 'http://192.168.3.19:3000' 
    : 'https://services.sweetmoments.mx';
  
  console.log(`🌐 URL de la API: ${apiUrl}`);
  
} catch (error) {
  console.error('❌ Error al configurar el entorno:', error.message);
  process.exit(1);
}
