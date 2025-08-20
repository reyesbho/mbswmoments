import { apiService } from '@/services/api';
import { Order } from '@/types';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface OrdersByDay {
  [key: string]: Order[];
}

export const useCalendarOrders = (selectedDate: Date) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordersByDay, setOrdersByDay] = useState<OrdersByDay>({});

  // Función para convertir timestamp de Firestore a Date
  const timestampToDate = (timestamp: { seconds: number; nanoseconds: number }): Date => {
    return new Date(timestamp.seconds * 1000);
  };

  // Función para cargar pedidos del mes seleccionado
  const loadOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await apiService.getOrders();
      
      // Filtrar pedidos del mes seleccionado
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const filteredOrders = allOrders.filter(order => {
        const orderDate = timestampToDate(order.fechaEntrega);
        return orderDate >= startOfMonth && orderDate <= endOfMonth;
      });

      setOrders(filteredOrders);
      
      // Organizar pedidos por día
      const grouped: OrdersByDay = {};
      filteredOrders.forEach(order => {
        const orderDate = timestampToDate(order.fechaEntrega);
        const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(order);
      });

      // Ordenar pedidos por hora dentro de cada día
      Object.keys(grouped).forEach(dateKey => {
        grouped[dateKey].sort((a, b) => {
          const timeA = timestampToDate(a.fechaEntrega).getTime();
          const timeB = timestampToDate(b.fechaEntrega).getTime();
          return timeA - timeB;
        });
      });

      setOrdersByDay(grouped);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos cuando cambie la fecha seleccionada
  useEffect(() => {
    loadOrders();
  }, [selectedDate]);

  return {
    orders,
    loading,
    ordersByDay,
    loadOrders,
  };
};
