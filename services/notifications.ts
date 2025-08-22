import { NOTIFICATION_CONFIG, NOTIFICATION_TYPES } from '@/constants/Notifications';
import { Order } from '@/types';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { apiService } from './api';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  time: string; // formato "HH:mm"
  daysOfWeek: number[]; // 0 = domingo, 1 = lunes, etc.
}

export class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    enabled: false,
    time: NOTIFICATION_CONFIG.DEFAULT_TIME,
    daysOfWeek: NOTIFICATION_CONFIG.DEFAULT_DAYS,
  };

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Solicitar permisos de notificación
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Las notificaciones solo funcionan en dispositivos físicos');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permisos de notificación no otorgados');
        return false;
      }

      return true;
    } catch (error) {
      console.log('Error al solicitar permisos de notificación:', error);
      return false;
    }
  }

  // Configurar el token para notificaciones push (si es necesario)
  async getExpoPushToken(): Promise<string | null> {
    try {
      // Verificar si estamos en Expo Go
      if (__DEV__) {
        console.log('Nota: Las notificaciones push no están disponibles en Expo Go. Usa un development build para funcionalidad completa.');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Reemplazar con tu project ID
      });
      return token.data;
    } catch (error) {
      console.error('Error al obtener el token de notificación:', error);
      return null;
    }
  }

  // Obtener pedidos para el día actual
  private async getTodaysOrders(): Promise<Order[]> {
    try {
      const allOrders = await apiService.getOrders();
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      return allOrders.filter(order => {
        const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
        return deliveryDate >= startOfDay && deliveryDate < endOfDay && 
               order.estatus !== 'DONE' && order.estatus !== 'CANCELED';
      });
    } catch (error) {
      console.error('Error al obtener pedidos del día:', error);
      return [];
    }
  }

  // Crear mensaje de notificación
  private createNotificationMessage(orders: Order[]): string {
    if (orders.length === 0) {
      return NOTIFICATION_CONFIG.MESSAGES.NO_ORDERS;
    }

    if (orders.length === 1) {
      const order = orders[0];
      const deliveryTime = new Date(order.fechaEntrega.seconds * 1000);
      const timeString = deliveryTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return NOTIFICATION_CONFIG.MESSAGES.SINGLE_ORDER
        .replace('{cliente}', order.cliente)
        .replace('{hora}', timeString);
    }

    const urgentOrders = orders.filter(order => {
      const deliveryTime = new Date(order.fechaEntrega.seconds * 1000);
      const now = new Date();
      const diffHours = (deliveryTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours < NOTIFICATION_CONFIG.WIDGET_URGENT_THRESHOLD;
    });

    if (urgentOrders.length > 0) {
      return NOTIFICATION_CONFIG.MESSAGES.URGENT_ORDERS
        .replace('{total}', orders.length.toString())
        .replace('{urgent}', urgentOrders.length.toString());
    }

    return NOTIFICATION_CONFIG.MESSAGES.MULTIPLE_ORDERS
      .replace('{count}', orders.length.toString());
  }

  // Programar notificación diaria
  async scheduleDailyNotification(): Promise<void> {
    if (!this.settings.enabled) {
      await this.cancelAllNotifications();
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('No se pueden programar notificaciones sin permisos');
      return;
    }

    // Cancelar notificaciones existentes
    await this.cancelAllNotifications();

    // Programar una sola notificación diaria que se repite todos los días
    const [hours, minutes] = this.settings.time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_CONFIG.TITLES.DAILY_SUMMARY,
        body: "Revisa los pedidos programados para hoy",
        data: { type: NOTIFICATION_TYPES.DAILY_SUMMARY },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    console.log('Notificación diaria programada');
  }

  // Enviar notificación inmediata con pedidos del día
  async sendTodaysOrdersNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return;
    }

    const todaysOrders = await this.getTodaysOrders();
    const message = this.createNotificationMessage(todaysOrders);

         await Notifications.scheduleNotificationAsync({
       content: {
         title: NOTIFICATION_CONFIG.TITLES.TODAYS_ORDERS,
         body: message,
         data: { 
           type: NOTIFICATION_TYPES.TODAYS_ORDERS,
           ordersCount: todaysOrders.length,
           orders: todaysOrders.map(order => ({
             id: order.id,
             cliente: order.cliente,
             hora: new Date(order.fechaEntrega.seconds * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
           }))
         },
       },
      trigger: null, // Envío inmediato
    });
  }

  // Programar notificación de recordatorio para pedidos urgentes
  async scheduleUrgentReminders(): Promise<void> {
    if (!this.settings.enabled) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const todaysOrders = await this.getTodaysOrders();
         const urgentOrders = todaysOrders.filter(order => {
       const deliveryTime = new Date(order.fechaEntrega.seconds * 1000);
       const now = new Date();
       const diffHours = (deliveryTime.getTime() - now.getTime()) / (1000 * 60 * 60);
       return diffHours > 0 && diffHours < NOTIFICATION_CONFIG.URGENT_THRESHOLD;
     });

    for (const order of urgentOrders) {
      const deliveryTime = new Date(order.fechaEntrega.seconds * 1000);
             const reminderTime = new Date(deliveryTime.getTime() - NOTIFICATION_CONFIG.URGENT_REMINDER * 60 * 60 * 1000);

      if (reminderTime > new Date()) {
                 await Notifications.scheduleNotificationAsync({
           content: {
             title: NOTIFICATION_CONFIG.TITLES.URGENT_ORDER,
             body: NOTIFICATION_CONFIG.MESSAGES.URGENT_REMINDER.replace('{cliente}', order.cliente),
             data: { 
               type: NOTIFICATION_TYPES.URGENT_ORDER,
               orderId: order.id,
               cliente: order.cliente
             },
           },
          trigger: {
            date: reminderTime,
          },
        });
      }
    }
  }

  // Cancelar todas las notificaciones
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Obtener configuración actual
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Actualizar configuración
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.scheduleDailyNotification();
  }

  // Verificar si las notificaciones están habilitadas
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  // Obtener pedidos del día para mostrar en la UI
  async getTodaysOrdersForDisplay(): Promise<{
    orders: Order[];
    message: string;
    urgentCount: number;
  }> {
    const orders = await this.getTodaysOrders();
         const urgentOrders = orders.filter(order => {
       const deliveryTime = new Date(order.fechaEntrega.seconds * 1000);
       const now = new Date();
       const diffHours = (deliveryTime.getTime() - now.getTime()) / (1000 * 60 * 60);
       return diffHours > 0 && diffHours < NOTIFICATION_CONFIG.WIDGET_URGENT_THRESHOLD;
     });

    return {
      orders,
      message: this.createNotificationMessage(orders),
      urgentCount: urgentOrders.length,
    };
  }
}

// Exportar instancia singleton
export const notificationService = NotificationService.getInstance();
