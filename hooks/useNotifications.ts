import { notificationService, NotificationSettings } from '@/services/notifications';
import { Order } from '@/types';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';

export interface TodaysOrdersData {
  orders: Order[];
  message: string;
  urgentCount: number;
}

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    time: "08:00",
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
  });
  
  const [todaysOrders, setTodaysOrders] = useState<TodaysOrdersData>({
    orders: [],
    message: "",
    urgentCount: 0,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  // Cargar configuración inicial
  useEffect(() => {
    const loadSettings = () => {
      const currentSettings = notificationService.getSettings();
      setSettings(currentSettings);
    };

    loadSettings();
  }, []);

  // Verificar permisos al montar el componente
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);
      } catch (error) {
        console.log('Error al verificar permisos:', error);
        setPermissionStatus('unknown');
      }
    };

    checkPermissions();
  }, []);

  // Solicitar permisos
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        setPermissionStatus('granted');
      }
      return granted;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar configuración
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    setIsLoading(true);
    try {
      await notificationService.updateSettings(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Habilitar/deshabilitar notificaciones
  const toggleNotifications = useCallback(async (enabled: boolean) => {
    if (enabled && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        throw new Error('Se requieren permisos para habilitar las notificaciones');
      }
    }

    await updateSettings({ enabled });
  }, [permissionStatus, requestPermissions, updateSettings]);

  // Obtener pedidos del día
  const loadTodaysOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getTodaysOrdersForDisplay();
      setTodaysOrders(data);
    } catch (error) {
      console.error('Error al cargar pedidos del día:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar notificación inmediata
  const sendImmediateNotification = useCallback(async () => {
    setIsLoading(true);
    try {
      await notificationService.sendTodaysOrdersNotification();
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Programar recordatorios urgentes
  const scheduleUrgentReminders = useCallback(async () => {
    setIsLoading(true);
    try {
      await notificationService.scheduleUrgentReminders();
    } catch (error) {
      console.error('Error al programar recordatorios:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancelar todas las notificaciones
  const cancelAllNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await notificationService.cancelAllNotifications();
    } catch (error) {
      console.error('Error al cancelar notificaciones:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar si las notificaciones están habilitadas
  const isNotificationsEnabled = useCallback(() => {
    return notificationService.isEnabled();
  }, []);

  return {
    // Estado
    settings,
    todaysOrders,
    isLoading,
    permissionStatus,
    
    // Acciones
    requestPermissions,
    updateSettings,
    toggleNotifications,
    loadTodaysOrders,
    sendImmediateNotification,
    scheduleUrgentReminders,
    cancelAllNotifications,
    isNotificationsEnabled,
  };
};
