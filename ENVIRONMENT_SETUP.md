# Configuración de Entornos - SMoments

Esta documentación explica cómo configurar y usar los diferentes entornos de la aplicación SMoments.

## 📁 Archivos de Configuración

### Archivos de Entorno
- `env.development` - Configuración para desarrollo local
- `env.preview` - Configuración para pruebas (preview)
- `env.production` - Configuración para producción
- `.env` - Archivo activo (se genera automáticamente)

### URLs de API por Entorno
- **Desarrollo**: `http://localhost:3000`
- **Preview**: `https://services.sweetmoments.mx`
- **Producción**: `https://services.sweetmoments.mx`

## 🚀 Comandos de Configuración

### Cambiar Entorno Manualmente
```bash
# Configurar para desarrollo
npm run set-env:dev

# Configurar para preview
npm run set-env:preview

# Configurar para producción
npm run set-env:prod
```

### Iniciar la Aplicación
```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## 📱 Builds de la Aplicación

### Build Preview (APK)
```bash
npm run build:preview
```
- Genera un APK para pruebas
- Apunta a `https://services.sweetmoments.mx`
- Distribución interna

### Build Producción (AAB)
```bash
npm run build:production
```
- Genera un AAB para Google Play Store
- Apunta a `https://services.sweetmoments.mx`
- Optimizado para producción

### Build Manual con EAS
```bash
# Preview
npx eas build --platform android --profile preview

# Producción
npx eas build --platform android --profile production
```

## 🔧 Configuración de Variables

### Variables Principales
- `EXPO_PUBLIC_ENV` - Entorno actual (development/preview/production)
- `EXPO_PUBLIC_API_URL` - URL del servidor de API
- `EXPO_PUBLIC_APP_NAME` - Nombre de la aplicación
- `EXPO_PUBLIC_VERSION` - Versión de la aplicación

### Configuración de API
- `EXPO_PUBLIC_API_TIMEOUT` - Timeout de requests (ms)
- `EXPO_PUBLIC_API_RETRY_ATTEMPTS` - Intentos de reintento
- `EXPO_PUBLIC_API_RETRY_DELAY` - Delay entre reintentos (ms)

### Configuración de Logging
- `EXPO_PUBLIC_LOG_REQUESTS` - Log de requests (true/false)
- `EXPO_PUBLIC_LOG_RESPONSES` - Log de responses (true/false)

## 📋 Flujo de Trabajo Recomendado

### Para Desarrollo
1. Ejecutar `npm run set-env:dev`
2. Iniciar servidor local en `http://localhost:3000`
3. Ejecutar `npm run start:dev`

### Para Testing
1. Ejecutar `npm run build:preview`
2. Instalar APK en dispositivo/emulador
3. Probar funcionalidades

### Para Producción
1. Ejecutar `npm run build:production`
2. Subir AAB a Google Play Console

## 🔍 Verificación de Configuración

### Verificar Entorno Actual
```bash
# Ver contenido del archivo .env
cat .env

# Ver URL de API configurada
grep EXPO_PUBLIC_API_URL .env
```

### Verificar en la Aplicación
La aplicación muestra el entorno actual en:
- Nombre de la aplicación
- Logs de consola
- Información de debug

## ⚠️ Notas Importantes

1. **Archivo .env**: Se genera automáticamente, no editar manualmente
2. **Servidor Local**: Asegúrate de que el servidor esté corriendo en `localhost:3000` para desarrollo
3. **Builds**: Los builds de EAS usan las variables de entorno configuradas en `eas.json`
4. **Caché**: Limpia el caché si hay problemas: `npx expo start --clear`

## 🛠️ Solución de Problemas

### Error de Conexión a API
- Verificar que el servidor esté corriendo
- Verificar URL en el archivo `.env`
- Verificar configuración de red

### Build Fallido
- Verificar configuración en `eas.json`
- Verificar variables de entorno
- Revisar logs de EAS Build

### Problemas de Caché
```bash
npx expo start --clear
npx expo install --fix
```
