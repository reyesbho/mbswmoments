import { useOrders } from '@/hooks/useApi';
import { Order } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function OrdersScreen() {
  const router = useRouter();
  const { data: orders, isLoading } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'today' | 'upcoming'>('all');

  


  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.lugarEntrega?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterStatus) {
      case 'today':
        filtered = filtered.filter(order => {
          const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
          return deliveryDate.toDateString() === today.toDateString();
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(order => {
          const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
          return deliveryDate > now;
        });
        break;
      default:
        break;
    }
    
    // Sort by delivery date (earliest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.fechaEntrega.seconds * 1000);
      const dateB = new Date(b.fechaEntrega.seconds * 1000);
      return dateA.getTime() - dateB.getTime();
    });
  }, [orders, searchQuery, filterStatus]);

  const formatDeliveryDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const calculateTotal = (order: Order) => {
    return order.productos.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
  };

  const getStatusColor = (order: Order) => {
    const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
    const now = new Date();
    const diffHours = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return '#E74C3C'; // Overdue
    if (diffHours < 24) return '#F39C12'; // Today
    return '#27AE60'; // Upcoming
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/orders/${order.id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderClient}>{order.cliente}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order) }]} />
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderDate}>
            📅 {formatDeliveryDate(order.fechaEntrega)}
          </Text>
          <Text style={styles.orderProducts}>
            📦 {order.productos.length} producto{order.productos.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={styles.orderTotal}>
          ${calculateTotal(order).toFixed(2)}
        </Text>
      </View>
      
      {order.lugarEntrega && (
        <Text style={styles.orderLocation} numberOfLines={1}>
          📍 {order.lugarEntrega}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={48} color="#CCC" />
      <Text style={styles.emptyStateText}>
        {searchQuery || filterStatus !== 'all' 
          ? 'No se encontraron pedidos' 
          : 'No hay pedidos aún'
        }
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery || filterStatus !== 'all'
          ? 'Intenta ajustar los filtros'
          : 'Crea tu primer pedido para comenzar'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pedidos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/orders/new')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#7F8C8D" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente o dirección..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7F8C8D" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'all' && styles.activeFilterTab]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'all' && styles.activeFilterTabText]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'today' && styles.activeFilterTab]}
          onPress={() => setFilterStatus('today')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'today' && styles.activeFilterTabText]}>
            Hoy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'upcoming' && styles.activeFilterTab]}
          onPress={() => setFilterStatus('upcoming')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'upcoming' && styles.activeFilterTabText]}>
            Próximos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  userText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#4ECDC4',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  activeFilterTabText: {
    color: 'white',
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  orderProducts: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  orderLocation: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 8,
    textAlign: 'center',
  },
});
