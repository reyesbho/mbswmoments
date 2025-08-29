import { getStatusColor, OrderStatusColors } from '@/constants/Colors';
import { notificationService } from '@/services/notifications';
import { Order } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface TodaysOrdersWidgetProps {
  onPress?: () => void;
}

export default function TodaysOrdersWidget({ onPress }: TodaysOrdersWidgetProps) {
  const router = useRouter();
  const [todaysOrders, setTodaysOrders] = useState<Order[]>([]);
  const [urgentCount, setUrgentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTodaysOrders();
  }, []);

  const loadTodaysOrders = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getTodaysOrdersForDisplay();
      setTodaysOrders(data.orders);
      setUrgentCount(data.urgentCount);
    } catch (error) {
      console.error('Error al cargar pedidos del día:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Filtrar para mostrar solo los pedidos de hoy
      router.push('/?filter=today');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
          <Text style={styles.title}>Pedidos de Hoy</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4ECDC4" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  if (todaysOrders.length === 0) {
    return (
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <View style={styles.header}>
          <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
          <Text style={styles.title}>Pedidos de Hoy</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={32} color={OrderStatusColors.DONE} />
          <Text style={styles.emptyText}>No hay pedidos para hoy</Text>
          <Text style={styles.emptySubtext}>¡Excelente trabajo!</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
        <Text style={styles.title}>Pedidos de Hoy</Text>
        {urgentCount > 0 && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>{urgentCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.summaryRow}>
          <Text style={styles.orderCount}>
            {todaysOrders.length} pedido{todaysOrders.length !== 1 ? 's' : ''}
          </Text>
          {urgentCount > 0 && (
            <View style={styles.urgentIndicator}>
              <Ionicons name="warning" size={16} color={OrderStatusColors.CANCELED} />
              <Text style={styles.urgentText}>{urgentCount} urgente{urgentCount !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>

        <View style={styles.ordersPreview}>
          {todaysOrders.slice(0, 3).map((order, index) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderClient} numberOfLines={1}>
                  {order.cliente}
                </Text>
                <Text style={styles.orderTime}>
                  {new Date(order.fechaEntrega.seconds * 1000).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(order) }
              ]} />
            </View>
          ))}
          
          {todaysOrders.length > 3 && (
            <View style={styles.moreOrders}>
              <Text style={styles.moreOrdersText}>
                +{todaysOrders.length - 3} más...
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Toca para ver todos</Text>
        <Ionicons name="chevron-forward" size={16} color="#7F8C8D" />
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: OrderStatusColors.CANCELED,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  urgentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: OrderStatusColors.DONE,
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  content: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  urgentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgentText: {
    fontSize: 14,
    color: OrderStatusColors.CANCELED,
    fontWeight: '600',
  },
  ordersPreview: {
    gap: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderInfo: {
    flex: 1,
  },
  orderClient: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  orderTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreOrders: {
    paddingTop: 4,
  },
  moreOrdersText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  footerText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
});
