import { HeaderView } from '@/components/HeaderView';
import { useCalendarOrders } from '@/hooks/useCalendarOrders';
import { Order } from '@/types';
import { formatMonthYear, formatTime, getDayName, getDayOfMonth } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { parse } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CalendarScreen() {
  const router = useRouter();
  // Inicializar con el primer día del mes actual
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const { orders, loading, ordersByDay } = useCalendarOrders(selectedDate);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      // Siempre establecer el día al primer día del mes seleccionado
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      setSelectedDate(firstDayOfMonth);
    }
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const renderOrderItem = (order: Order) => (
    <TouchableOpacity 
      key={order.id} 
      style={styles.orderItem}
      onPress={() => handleOrderPress(order.id)}
      activeOpacity={0.7}
    >
      <View style={styles.orderContent}>
        <View style={styles.orderClientContainer}>
            <Text style={styles.orderClient}>{order.cliente}</Text>
            {order.lugarEntrega && (
            <Text style={styles.orderLocation}>{order.lugarEntrega}</Text>
            )}
        </View>
        <View style={styles.orderTimeContainer}>
          <Ionicons name="time-outline" size={16} color="#7F8C8D" />
          <Text style={styles.orderTime}>
            {formatTime(order.fechaEntrega)}
          </Text>
        </View>
        
      </View>
      <Ionicons name="chevron-forward" size={16} color="#7F8C8D" />
    </TouchableOpacity>
  );

  const renderDaySection = (dateKey: string, dayOrders: Order[]) => {
    const date = parse(dateKey, 'yyyy-MM-dd', new Date());
    const dayName = getDayName(date);
    const formattedDate = getDayOfMonth(date);

    return (
      <View key={dateKey} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>
            {dayName} - {formattedDate}
          </Text>
          <View style={styles.orderCount}>
            <Text style={styles.orderCountText}>
              {dayOrders.length} pedido{dayOrders.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <View style={styles.ordersContainer}>
          {dayOrders.map(renderOrderItem)}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderView title="Calendario de Pedidos" />
      
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
          <Text style={styles.dateText}>
            {formatMonthYear(selectedDate)}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#7F8C8D" />
        </TouchableOpacity>
      </View>

             {showDatePicker && (
         <DateTimePicker
           value={selectedDate}
           mode="date"
           display="spinner"
           onChange={handleDateChange}
           maximumDate={new Date()}
         />
       )}

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Cargando pedidos...</Text>
          </View>
        ) : Object.keys(ordersByDay).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#7F8C8D" style={{ opacity: 0.5 }} />
            <Text style={styles.emptyText}>
              No hay pedidos para {formatMonthYear(selectedDate)}
            </Text>
          </View>
        ) : (
          <View style={styles.daysContainer}>
            {Object.entries(ordersByDay)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, dayOrders]) => renderDaySection(dateKey, dayOrders))
            }
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingBottom: 10,
  },
  dateSelector: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    textTransform: 'capitalize',
    color: '#2C3E50',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#7F8C8D',
  },
  daysContainer: {
    paddingBottom: 20,
  },
  dayCard: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  orderCount: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ordersContainer: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#F8F9FA',
    padding: 5,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    justifyContent: 'space-between',
  },
  orderTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderClientContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 4,
    flex: 1,
  },
  orderTime: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#2C3E50',
  },
  orderClient: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
    color: '#2C3E50',
  },
  orderLocation: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});
