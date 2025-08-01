import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useApi';
import { apiService } from '@/services/api';
import { Order } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout, redirectToAuth } = useAuth();
  const { data: ordersData, isLoading, error, refetch } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Ensure orders is always an array
  const orders = Array.isArray(ordersData) ? ordersData : [];
  
  // Debug logs
  useEffect(() => {
    console.log('📋 Orders data type:', typeof ordersData);
    console.log('📋 Orders data:', ordersData);
    console.log('📋 Orders array:', orders);
  }, [ordersData, orders]);

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      console.log('Dashboard error:', error);
      // If it's an authentication error, redirect to auth
      if (error instanceof Error && error.message.includes('401')) {
        console.log('🔄 Authentication error detected, redirecting to auth');
        redirectToAuth();
      }
    }
  }, [error, redirectToAuth]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
      // If refresh fails due to auth error, redirect
      if (error instanceof Error && error.message.includes('401')) {
        redirectToAuth();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const testServerConnection = async () => {
    setTestingConnection(true);
    try {
      console.log('🧪 Testing server connection...');
      // Try to fetch products as a test
      const products = await apiService.getProducts();
      console.log('✅ Server connection successful:', products);
      Alert.alert(
        'Conexión Exitosa',
        'El servidor está funcionando correctamente.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar con el servidor. Verifica que el servidor esté corriendo en http://192.168.3.10:3000',
        [{ text: 'OK' }]
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const formatDeliveryDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const calculateTotal = (order: Order) => {
    return order.productos.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Error al cargar datos</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'No se pudieron cargar los pedidos'}
        </Text>
        <View style={styles.errorActions}>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.retryButton, styles.testButton]} 
            onPress={testServerConnection}
            disabled={testingConnection}
          >
            <Text style={styles.retryButtonText}>
              {testingConnection ? 'Probando...' : 'Probar Conexión'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>¡Hola!</Text>
          <Text style={styles.userText}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Main Action Button */}
      <View style={styles.mainActionContainer}>
        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="list" size={32} color="white" />
          <Text style={styles.mainActionText}>Ver Todos los Pedidos</Text>
          <Text style={styles.mainActionSubtext}>
            Gestiona todos tus pedidos de pastelería
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="list-outline" size={24} color="#4ECDC4" />
          <Text style={styles.statNumber}>{orders?.length || 0}</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color="#45B7D1" />
          <Text style={styles.statNumber}>
            {orders?.filter(order => {
              const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
              const today = new Date();
              return deliveryDate.toDateString() === today.toDateString();
            }).length || 0}
          </Text>
          <Text style={styles.statLabel}>Hoy</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={24} color="#96CEB4" />
          <Text style={styles.statNumber}>
            ${orders?.reduce((total, order) => total + calculateTotal(order), 0).toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/orders/new')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#4ECDC4" />
          <Text style={styles.actionText}>Nuevo Pedido</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/products')}
        >
          <Ionicons name="cube-outline" size={24} color="#45B7D1" />
          <Text style={styles.actionText}>Productos</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders */}
      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pedidos Recientes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/orders/${order.id}`)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderClient}>{order.cliente}</Text>
                  <Text style={styles.orderDate}>
                    {formatDeliveryDate(order.fechaEntrega)}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderProducts}>
                    {order.productos.length} producto{order.productos.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.orderTotal}>
                    ${calculateTotal(order).toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No hay pedidos aún</Text>
              <Text style={styles.emptySubtext}>
                Crea tu primer pedido para comenzar
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButton: {
    backgroundColor: '#45B7D1',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  userText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  mainActionContainer: {
    padding: 20,
  },
  mainActionButton: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  mainActionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
  },
  mainActionSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
  },
  recentContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  orderDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderProducts: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 4,
  },
});
