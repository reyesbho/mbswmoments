import { HeaderView } from '@/components/HeaderView';
import { useOrders, useUpdateOrder } from '@/hooks/useApi';
import { Order } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function OrdersScreen() {
  const router = useRouter();
  const { data: orders, isLoading } = useOrders();
  const updateOrderMutation = useUpdateOrder();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'today' | 'upcoming'>('today');
  const [filterOrderStatus, setFilterOrderStatus] = useState<'INCOMPLETE' | 'BACKLOG' | 'DONE'>('BACKLOG');
  const [showFilters, setShowFilters] = useState(false);

  // Suppress deprecation warning for Swipeable
  React.useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('Swipeable')) return;
      originalWarn.apply(console, args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  


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

    switch (filterOrderStatus) {
      case 'INCOMPLETE':
        filtered = filtered.filter(order => order.estatus === 'INCOMPLETE');
        break;
      case 'BACKLOG':
        filtered = filtered.filter(order => order.estatus === 'BACKLOG');
        break;
      case 'DONE':
        filtered = filtered.filter(order => order.estatus === 'DONE');
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
  }, [orders, searchQuery, filterStatus, filterOrderStatus]);

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
    // Si el pedido tiene un estado específico, usarlo
    if (order.estatus === 'DONE') return '#27AE60'; // Verde para entregado
    if (order.estatus === 'CANCELED') return '#E74C3C'; // Rojo para cancelado
    if (order.estatus === 'INCOMPLETE') return '#E67E22'; // Naranja para incompleto
    if (order.estatus === 'BACKLOG') return '#9B59B6'; // Púrpura para por hacer
    
    // Si no tiene estado, usar la lógica de fecha
    const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
    const now = new Date();
    const diffHours = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return '#E74C3C'; // Overdue
    if (diffHours < 24) return '#F39C12'; // Today
    return '#27AE60'; // Upcoming
  };

  const getStatusText = (order: Order) => {
    if (order.estatus === 'DONE') return 'Entregado';
    if (order.estatus === 'CANCELED') return 'Cancelado';
    if (order.estatus === 'INCOMPLETE') return 'Incompleto';
    if (order.estatus === 'BACKLOG') return 'Por hacer';
    return 'Pendiente';
  };

  const LoadingIcon = () => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          rotate: withRepeat(
            withTiming('360deg', { duration: 1000 }),
            -1,
            false
          ),
        },
      ],
    }));

    return (
      <Animated.View style={animatedStyle}>
        <Ionicons name="sync" size={16} color="#7F8C8D" style={styles.loadingIcon} />
      </Animated.View>
    );
  };

  const handleSwipeRight = (order: Order) => {
    Alert.alert(
      'Confirmar Pedido Completado',
      `¿Estás seguro de que quieres marcar el pedido de ${order.cliente} como completado?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            updateOrderMutation.mutate(
              {
                id: order.id,
                order: { estatus: 'DONE' }
              },
              {
                onSuccess: () => {
                  Alert.alert('Éxito', 'Pedido marcado como completado');
                },
                onError: (error) => {
                  Alert.alert('Error', 'No se pudo actualizar el pedido');
                }
              }
            );
          },
        },
      ]
    );
  };

  const handleSwipeLeft = (order: Order) => {
    Alert.alert(
      'Confirmar Cancelación',
      `¿Estás seguro de que quieres cancelar el pedido de ${order.cliente}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            updateOrderMutation.mutate(
              {
                id: order.id,
                order: { estatus: 'CANCELED' }
              },
              {
                onSuccess: () => {
                  Alert.alert('Éxito', 'Pedido cancelado');
                },
                onError: (error) => {
                  Alert.alert('Error', 'No se pudo cancelar el pedido');
                }
              }
            );
          },
        },
      ]
    );
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const renderRightActions = () => {
      if(order.estatus === 'INCOMPLETE'){
        return(
          <TouchableOpacity
            style={styles.swipeRightAction}
            onPress={() => handleSwipeRight(order)}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.swipeActionText}>Confirmar</Text>
          </TouchableOpacity>)
        }else{
          return(
              <TouchableOpacity
              style={styles.swipeRightAction}
              onPress={() => handleSwipeRight(order)}
            >
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.swipeActionText}>Completado</Text>
            </TouchableOpacity>  
          )
        }
      }
      

    const renderLeftActions = () => (
      <TouchableOpacity
        style={styles.swipeLeftAction}
        onPress={() => handleSwipeLeft(order)}
      >
        <Ionicons name="close-circle" size={24} color="white" />
        <Text style={styles.swipeActionText}>Cancelar</Text>
      </TouchableOpacity>
    );

    const isOrderCompleted = order.estatus === 'DONE' || order.estatus === 'CANCELED';

    return (
      <Swipeable
        renderRightActions={isOrderCompleted ? undefined : renderRightActions}
        renderLeftActions={isOrderCompleted ? undefined : renderLeftActions}
        rightThreshold={40}
        leftThreshold={40}
        enabled={!isOrderCompleted}
      >
        <TouchableOpacity
          style={[
            styles.orderCard,
            updateOrderMutation.isPending && styles.updatingCard,
            isOrderCompleted && styles.completedCard
          ]}
          onPress={() => router.push(`/orders/${order.id}`)}
          disabled={updateOrderMutation.isPending}
        >
          <View style={styles.orderHeader}>
            <Text style={styles.orderClient}>{order.cliente}</Text>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: getStatusColor(order) }]}>
                {getStatusText(order)}
              </Text>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order) }]} />
              {updateOrderMutation.isPending && <LoadingIcon />}
              {isOrderCompleted && (
                <Ionicons name="lock-closed" size={14} color="#BDC3C7" style={styles.lockIcon} />
              )}
            </View>
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
      </Swipeable>
    );
  };

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
      <HeaderView 
        title="Pedidos" >
          
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/orders/new')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </HeaderView>

      {/* Filter Button */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name={showFilters ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#4ECDC4" 
          />
          <Text style={styles.filterButtonText}>
            Filtros {showFilters ? '(Ocultar)' : '(Mostrar)'}
          </Text>
          <View style={styles.activeFiltersIndicator}>
            <Text style={styles.activeFiltersCount}>
              {filterStatus !== 'all' || filterOrderStatus !== 'BACKLOG' ? '2' : '0'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Collapsible Filter Section */}
      {showFilters && (
        <View style={styles.collapsibleFilterContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Fecha de entrega</Text>
            <View style={styles.filterChipsContainer}>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'all' && styles.activeFilterChip]}
                onPress={() => setFilterStatus('all')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'all' && styles.activeFilterChipText]}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'today' && styles.activeFilterChip]}
                onPress={() => setFilterStatus('today')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'today' && styles.activeFilterChipText]}>
                  Hoy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'upcoming' && styles.activeFilterChip]}
                onPress={() => setFilterStatus('upcoming')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'upcoming' && styles.activeFilterChipText]}>
                  Próximos
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Estado del pedido</Text>
            <View style={styles.filterChipsContainer}>
              <TouchableOpacity
                style={[styles.filterChip, filterOrderStatus === 'INCOMPLETE' && styles.activeFilterChip]}
                onPress={() => setFilterOrderStatus('INCOMPLETE')}
              >
                <Text style={[styles.filterChipText, filterOrderStatus === 'INCOMPLETE' && styles.activeFilterChipText]}>
                  Incompleto
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterOrderStatus === 'BACKLOG' && styles.activeFilterChip]}
                onPress={() => setFilterOrderStatus('BACKLOG')}
              >
                <Text style={[styles.filterChipText, filterOrderStatus === 'BACKLOG' && styles.activeFilterChipText]}>
                  Por hacer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterOrderStatus === 'DONE' && styles.activeFilterChip]}
                onPress={() => setFilterOrderStatus('DONE')}
              >
                <Text style={[styles.filterChipText, filterOrderStatus === 'DONE' && styles.activeFilterChipText]}>
                  Entregado
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={isLoading || updateOrderMutation.isPending}
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  filterButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    flex: 1,
    marginLeft: 8,
  },
  activeFiltersIndicator: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFiltersCount: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  collapsibleFilterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activeFilterChip: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  activeFilterChipText: {
    color: 'white',
    fontWeight: '600',
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updatingCard: {
    opacity: 0.6,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#e4e8ed',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  lockIcon: {
    marginLeft: 6,
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
  swipeRightAction: {
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  swipeLeftAction: {
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
