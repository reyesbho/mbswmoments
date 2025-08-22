import { useOrdersByDateRange } from '@/hooks/useApi';
import { Order } from '@/types';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface OrdersByDay {
  [key: string]: Order[];
}

export const useCalendarOrders = (selectedDate: Date) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersByDay, setOrdersByDay] = useState<OrdersByDay>({});

  // Función para convertir timestamp de Firestore a Date
  const timestampToDate = (timestamp: { seconds: number; nanoseconds: number }): Date => {
    return new Date(timestamp.seconds * 1000);
  };

  // Calcular fechas de inicio y fin del mes
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  
  // Formatear fechas para la API
  const fechaInicio = format(startOfMonth, 'dd-MM-yyyy');
  const fechaFin = format(endOfMonth, 'dd-MM-yyyy');
  
  // Usar el hook específico para obtener órdenes del mes
  const { data: allOrders, isLoading, error } = useOrdersByDateRange(fechaInicio, fechaFin, 'ALL');

  // Procesar órdenes cuando cambien los datos
  useEffect(() => {
    if (allOrders) {
      setOrders(allOrders);
      
      // Organizar pedidos por día
      const grouped: OrdersByDay = {};
      allOrders.forEach(order => {
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
    }
  }, [allOrders]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    }
  }, [error]);

  return {
    orders,
    loading: isLoading,
    ordersByDay,
    loadOrders: () => {}, // Ya no necesitamos esta función manual
  };
};
