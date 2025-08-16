# Sistema de Notificaciones - MBSW Moments

## 📋 Descripción General

El sistema de notificaciones permite a los usuarios recibir recordatorios diarios sobre sus pedidos programados para el día actual. Incluye notificaciones automáticas, recordatorios urgentes y un widget informativo en la pantalla principal.

## 🚀 Características Principales

### ✅ Notificaciones Diarias Automáticas
- **Resumen diario**: Notificación automática con el resumen de pedidos del día
- **Hora configurable**: El usuario puede establecer la hora de notificación (por defecto 8:00 AM)
- **Días personalizables**: Selección de días de la semana para recibir notificaciones
- **Mensajes inteligentes**: Diferentes mensajes según la cantidad y urgencia de pedidos

### ⚠️ Recordatorios Urgentes
- **Notificaciones de urgencia**: Para pedidos que deben entregarse en las próximas 2 horas
- **Programación automática**: Se programan automáticamente 1 hora antes de la entrega
- **Navegación directa**: Al tocar la notificación, se navega al pedido específico

### 📱 Widget Informativo
- **Resumen visual**: Muestra los pedidos del día en la pantalla principal
- **Indicadores de urgencia**: Badge rojo para pedidos urgentes
- **Navegación rápida**: Toca el widget para filtrar y ver solo los pedidos de hoy

## 🛠️ Configuración

### Permisos
1. La aplicación solicita permisos de notificación al iniciar
2. Si se deniegan, se muestra un mensaje explicativo
3. Los permisos se pueden habilitar desde la configuración del dispositivo

### Configuración de Notificaciones
1. **Habilitar/Deshabilitar**: Toggle principal para activar el sistema
2. **Hora de notificación**: Selector de hora (formato 24h)
3. **Días de la semana**: Botones para seleccionar días específicos
4. **Pruebas**: Botones para enviar notificaciones de prueba

## 📁 Estructura de Archivos

```
services/
├── notifications.ts          # Servicio principal de notificaciones
hooks/
├── useNotifications.ts       # Hook personalizado para React
components/
├── NotificationSettings.tsx  # Componente de configuración
├── TodaysOrdersWidget.tsx    # Widget de pedidos del día
app/
├── notifications.tsx         # Pantalla de configuración
└── _layout.tsx              # Configuración global de notificaciones
```

## 🔧 Implementación Técnica

### Servicio de Notificaciones (`services/notifications.ts`)

```typescript
class NotificationService {
  // Singleton pattern
  static getInstance(): NotificationService
  
  // Gestión de permisos
  async requestPermissions(): Promise<boolean>
  
  // Programación de notificaciones
  async scheduleDailyNotification(): Promise<void>
  async scheduleUrgentReminders(): Promise<void>
  
  // Notificaciones inmediatas
  async sendTodaysOrdersNotification(): Promise<void>
  
  // Configuración
  getSettings(): NotificationSettings
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void>
}
```

### Hook Personalizado (`hooks/useNotifications.ts`)

```typescript
const useNotifications = () => {
  // Estado
  const [settings, setSettings] = useState<NotificationSettings>()
  const [todaysOrders, setTodaysOrders] = useState<TodaysOrdersData>()
  const [isLoading, setIsLoading] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<string>()
  
  // Acciones
  const requestPermissions = useCallback(async () => Promise<boolean>)
  const updateSettings = useCallback(async (settings) => Promise<void>)
  const toggleNotifications = useCallback(async (enabled) => Promise<void>)
  const sendImmediateNotification = useCallback(async () => Promise<void>)
}
```

## 🎯 Tipos de Notificaciones

### 1. Notificación Diaria
- **Trigger**: Hora configurada diariamente
- **Contenido**: Resumen de pedidos del día
- **Acción**: Navega a la pantalla de pedidos

### 2. Notificación Urgente
- **Trigger**: 1 hora antes de la entrega
- **Contenido**: Recordatorio específico del pedido
- **Acción**: Navega al pedido específico

### 3. Notificación de Prueba
- **Trigger**: Manual (botón en configuración)
- **Contenido**: Estado actual de pedidos
- **Acción**: Solo informativa

## 📊 Estados de Pedidos

El sistema considera diferentes estados para las notificaciones:

- **INCOMPLETE**: Pedidos sin confirmar
- **BACKLOG**: Pedidos confirmados, por hacer
- **DONE**: Pedidos completados (no se notifican)
- **CANCELED**: Pedidos cancelados (no se notifican)

## 🔄 Flujo de Trabajo

1. **Inicio de la app**: Se verifica el estado de permisos
2. **Autenticación**: Se programan notificaciones si el usuario está autenticado
3. **Configuración**: El usuario puede personalizar la configuración
4. **Ejecución**: Las notificaciones se ejecutan según la programación
5. **Interacción**: Al tocar una notificación, se navega a la pantalla correspondiente

## 🧪 Pruebas

### Notificaciones de Prueba
- **Enviar notificación inmediata**: Prueba el sistema completo
- **Programar recordatorios urgentes**: Prueba los recordatorios de urgencia

### Verificación
- Verificar que las notificaciones aparecen en el momento correcto
- Comprobar que la navegación funciona correctamente
- Validar que los mensajes son apropiados según el contexto

## 🚨 Consideraciones Importantes

### Dispositivos Físicos
- Las notificaciones solo funcionan en dispositivos físicos
- En el simulador, se muestran logs en la consola

### Permisos
- Los permisos deben ser otorgados por el usuario
- Si se deniegan, se debe guiar al usuario a la configuración del dispositivo

### Programación
- Las notificaciones se reprograman cada vez que se actualiza la configuración
- Se cancelan todas las notificaciones anteriores antes de programar nuevas

### Rendimiento
- El servicio usa un patrón singleton para evitar múltiples instancias
- Las consultas de pedidos se optimizan para solo obtener los del día actual

## 🔮 Futuras Mejoras

1. **Notificaciones Push**: Integración con servidor para notificaciones remotas
2. **Sonidos personalizados**: Diferentes sonidos según el tipo de notificación
3. **Badges**: Contador de notificaciones en el icono de la app
4. **Notificaciones grupales**: Agrupar notificaciones similares
5. **Configuración avanzada**: Más opciones de personalización
6. **Analytics**: Seguimiento del uso de notificaciones

## 📞 Soporte

Para problemas o preguntas sobre el sistema de notificaciones:

1. Verificar que los permisos están habilitados
2. Comprobar que la configuración es correcta
3. Revisar los logs en la consola para errores
4. Probar en un dispositivo físico (no simulador)

---

**Desarrollado para MBSW Moments** 🎂
