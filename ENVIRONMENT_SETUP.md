# Configuración de Entornos - mbswmoments

Este documento describe cómo configurar y usar diferentes entornos (desarrollo y producción) en la aplicación mbswmoments.

## 🏗️ Estructura de Configuración

### Archivos de Configuración

- `constants/Config.ts` - Configuración centralizada de la aplicación
- `app.config.js` - Configuración de Expo con variables de entorno
- `env.development` - Variables de entorno para desarrollo
- `env.production` - Variables de entorno para producción

### URLs por Entorno

| Entorno | URL de la API | Descripción |
|---------|---------------|-------------|
| **Desarrollo** | `http://192.168.3.19:3000` | Servidor local para desarrollo |
| **Producción** | `https://services.sweetmoments.mx` | Servidor de producción |

## 🚀 Scripts Disponibles

### Configuración de Entorno
```bash
# Configurar entorno de desarrollo
npm run set-env:dev

# Configurar entorno de producción
npm run set-env:prod
```

### Desarrollo
```bash
# Iniciar en modo desarrollo (usa configuración de .env)
npm run start:dev
npm run android:dev
npm run ios:dev
npm run web:dev
```

### Producción
```bash
# Iniciar en modo producción (usa configuración de .env)
npm run start:prod
npm run android:prod
npm run ios:prod
npm run web:prod
```

### Construcción
```bash
# Construir para producción
npm run build:android
npm run build:ios
npm run build:web
```

## 🔧 Configuración de Variables de Entorno

### Variables Disponibles

| Variable | Desarrollo | Producción | Descripción |
|----------|------------|------------|-------------|
| `EXPO_PUBLIC_ENV` | `development` | `production` | Entorno actual |
| `EXPO_PUBLIC_API_URL` | `http://192.168.3.19:3000` | `https://services.sweetmoments.mx` | URL de la API |
| `EXPO_PUBLIC_API_TIMEOUT` | `10000` | `15000` | Timeout de la API (ms) |
| `EXPO_PUBLIC_LOG_REQUESTS` | `true` | `false` | Log de requests |
| `EXPO_PUBLIC_LOG_RESPONSES` | `true` | `false` | Log de responses |

### Configuración de Notificaciones

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `EXPO_PUBLIC_NOTIFICATION_DEFAULT_TIME` | `08:00` | Hora por defecto para notificaciones |
| `EXPO_PUBLIC_NOTIFICATION_URGENT_THRESHOLD` | `2` | Horas para considerar pedido urgente |
| `EXPO_PUBLIC_NOTIFICATION_URGENT_REMINDER` | `1` | Horas antes para recordatorio urgente |

## 📱 Indicador de Entorno

La aplicación incluye un indicador visual del entorno actual:

- **Desarrollo**: Badge naranja con "DEV" y URL de la API
- **Producción**: Badge verde con "PROD" (solo si se especifica)

## 🔄 Cómo Cambiar de Entorno

### Método 1: Script de Configuración (Recomendado)
```bash
# Configurar para desarrollo
npm run set-env:dev

# Configurar para producción
npm run set-env:prod
```

### Método 2: Scripts de Inicio
```bash
# Desarrollo (usa configuración actual de .env)
npm run start:dev

# Producción (usa configuración actual de .env)
npm run start:prod
```

### Método 3: Manual
Copiar el contenido de `env.development` o `env.production` a un archivo `.env` en la raíz del proyecto.

## 🛠️ Configuración de la API

La configuración de la API se maneja automáticamente según el entorno:

```typescript
// constants/Config.ts
export const ENV = {
  API_URL: __DEV__ 
    ? 'http://192.168.3.19:3000'  // Desarrollo
    : 'https://services.sweetmoments.mx', // Producción
};
```

### Características por Entorno

#### Desarrollo
- ✅ Logging detallado de requests/responses
- ✅ Timeout más corto (10s)
- ✅ Indicador visual del entorno
- ✅ URL local

#### Producción
- ❌ Logging deshabilitado
- ✅ Timeout más largo (15s)
- ✅ URL de producción
- ❌ Indicador visual (opcional)

## 🔍 Verificación del Entorno

Para verificar que estás usando el entorno correcto:

1. **Indicador Visual**: Busca el badge en la esquina superior derecha
2. **Logs de Consola**: En desarrollo verás logs de API
3. **URL de la API**: Verifica en los logs que use la URL correcta

## 🚨 Consideraciones Importantes

### Desarrollo
- Asegúrate de que tu servidor local esté corriendo en `192.168.3.19:3000`
- Las notificaciones push no funcionan en Expo Go
- Usa `npm run start:dev` para desarrollo

### Producción
- Verifica que `https://services.sweetmoments.mx` esté disponible
- Usa un development build para notificaciones completas
- Usa `npm run start:prod` para pruebas de producción

## 📝 Personalización

Para agregar nuevas variables de entorno:

1. Agregar la variable a `env.development` y `env.production`
2. Actualizar `constants/Config.ts` para usar la variable
3. Actualizar `app.config.js` si es necesario
4. Documentar en este archivo

## 🔧 Troubleshooting

### Problema: No se conecta a la API
- Verifica que el servidor esté corriendo
- Confirma que estés usando el entorno correcto
- Revisa los logs de la consola

### Problema: Variables de entorno no se cargan
- Ejecuta `npm run set-env:dev` o `npm run set-env:prod` para configurar el entorno
- Reinicia el servidor de desarrollo
- Verifica que el archivo `.env` esté en la raíz
- Confirma que las variables empiecen con `EXPO_PUBLIC_`

### Problema: Indicador de entorno no aparece
- Verifica que `EnvironmentInfo` esté importado en `_layout.tsx`
- Confirma que no estés en producción (por defecto se oculta)
- Revisa que el componente esté renderizado correctamente
