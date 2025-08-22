import Toast, { useToast } from '@/components/Toast';
import { useNotifications } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function NotificationSettings() {
  const {
    settings,
    todaysOrders,
    isLoading,
    permissionStatus,
    toggleNotifications,
    updateSettings,
    loadTodaysOrders,
    sendImmediateNotification,
    scheduleUrgentReminders,
  } = useNotifications();

  const { toast, showToast, hideToast, showSuccess, showError } = useToast();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    loadTodaysOrders();
  }, [loadTodaysOrders]);

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      await toggleNotifications(enabled);
      showSuccess(enabled ? 'Notificaciones habilitadas' : 'Notificaciones deshabilitadas');
    } catch (error: any) {
      showError(error.message || 'Error al cambiar configuración');
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      const timeString = selectedDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      updateSettings({ time: timeString });
      showSuccess('Hora de notificación actualizada');
    }
  };

  const handleSendTestNotification = async () => {
    try {
      await sendImmediateNotification();
      showSuccess('Notificación de prueba enviada');
    } catch (error: any) {
      showError(error.message || 'Error al enviar notificación');
    }
  };

  const handleScheduleUrgentReminders = async () => {
    try {
      await scheduleUrgentReminders();
      showSuccess('Recordatorios urgentes programados');
    } catch (error: any) {
      showError(error.message || 'Error al programar recordatorios');
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Permitido';
      case 'denied':
        return 'Denegado';
      case 'undetermined':
        return 'No determinado';
      default:
        return 'Desconocido';
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return '#27AE60';
      case 'denied':
        return '#E74C3C';
      case 'undetermined':
        return '#F39C12';
      default:
        return '#7F8C8D';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="notifications-outline" size={24} color="#2C3E50" />
          <Text style={styles.headerTitle}>Configuración de Notificaciones</Text>
        </View>

        {/* Estado de Permisos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de Permisos</Text>
          <View style={styles.permissionCard}>
            <View style={styles.permissionRow}>
              <Text style={styles.permissionLabel}>Estado:</Text>
              <View style={styles.permissionStatus}>
                <View style={[styles.statusDot, { backgroundColor: getPermissionStatusColor() }]} />
                <Text style={styles.permissionStatusText}>{getPermissionStatusText()}</Text>
              </View>
            </View>
            {permissionStatus === 'denied' && (
              <Text style={styles.permissionWarning}>
                Para recibir notificaciones, debes habilitar los permisos en la configuración de tu dispositivo.
              </Text>
            )}
            {__DEV__ && (
              <View style={styles.expoGoWarning}>
                <Ionicons name="information-circle" size={16} color="#F39C12" />
                <Text style={styles.expoGoWarningText}>
                  Nota: Las notificaciones locales funcionan en Expo Go, pero para notificaciones push completas usa un development build.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Habilitar/Deshabilitar Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones Diarias</Text>
          <View style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Notificaciones Automáticas</Text>
                <Text style={styles.toggleDescription}>
                  Recibe un resumen diario de tus pedidos programados todos los días
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={handleToggleNotifications}
                disabled={isLoading}
                trackColor={{ false: '#E9ECEF', true: '#4ECDC4' }}
                thumbColor={settings.enabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* Configuración de Hora */}
        {settings.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hora de Notificación</Text>
            <TouchableOpacity
              style={styles.timeCard}
              onPress={() => {
                const [hours, minutes] = settings.time.split(':').map(Number);
                const date = new Date();
                date.setHours(hours, minutes, 0, 0);
                setTempTime(date);
                setShowTimePicker(true);
              }}
              disabled={isLoading}
            >
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={20} color="#7F8C8D" />
                <Text style={styles.timeLabel}>Hora:</Text>
                <Text style={styles.timeValue}>{settings.time}</Text>
                <Ionicons name="chevron-forward" size={16} color="#7F8C8D" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Resumen de Pedidos de Hoy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pedidos de Hoy</Text>
          <View style={styles.todaysOrdersCard}>
            <View style={styles.todaysOrdersHeader}>
              <Text style={styles.todaysOrdersTitle}>
                {todaysOrders.orders.length} pedido{todaysOrders.orders.length !== 1 ? 's' : ''}
              </Text>
              {todaysOrders.urgentCount > 0 && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentBadgeText}>{todaysOrders.urgentCount} urgente{todaysOrders.urgentCount !== 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>
            <Text style={styles.todaysOrdersMessage}>{todaysOrders.message}</Text>
            
            {todaysOrders.orders.length > 0 && (
              <View style={styles.ordersList}>
                {todaysOrders.orders.slice(0, 3).map((order) => (
                  <View key={order.id} style={styles.orderItem}>
                    <Text style={styles.orderClient}>{order.cliente}</Text>
                    <Text style={styles.orderTime}>
                      {new Date(order.fechaEntrega.seconds * 1000).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                ))}
                {todaysOrders.orders.length > 3 && (
                  <Text style={styles.moreOrdersText}>
                    +{todaysOrders.orders.length - 3} más...
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Acciones de Prueba */}
        {settings.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones de Prueba</Text>
            <View style={styles.actionsCard}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSendTestNotification}
                disabled={isLoading}
              >
                <Ionicons name="send-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Enviar Notificación de Prueba</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryActionButton]}
                onPress={handleScheduleUrgentReminders}
                disabled={isLoading}
              >
                <Ionicons name="warning-outline" size={20} color="#4ECDC4" />
                <Text style={styles.secondaryActionButtonText}>Programar Recordatorios Urgentes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Toast Component */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        onPress={toast.onPress}
        actionText={toast.actionText}
        showIcon={toast.showIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  permissionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  permissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  permissionStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  permissionWarning: {
    fontSize: 12,
    color: '#E74C3C',
    fontStyle: 'italic',
  },
  expoGoWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  expoGoWarningText: {
    fontSize: 12,
    color: '#856404',
    flex: 1,
    lineHeight: 16,
  },
  toggleCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  timeCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginRight: 8,
  },
  timeValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },


  todaysOrdersCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todaysOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todaysOrdersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  urgentBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  todaysOrdersMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  ordersList: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  orderClient: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  orderTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  moreOrdersText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  secondaryActionButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
});
