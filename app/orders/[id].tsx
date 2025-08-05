import { useOrder, useUpdateOrder } from '@/hooks/useApi';
import { Order } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading } = useOrder(id);
  const updateOrderMutation = useUpdateOrder();

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
    // Si el pedido tiene un estatus específico, usarlo
    if (order.estatus) {
      if (order.estatus === 'DONE') return '#27AE60'; // Verde para entregado
      if (order.estatus === 'CANCELED') return '#E74C3C'; // Rojo para cancelado
      if (order.estatus === 'INCOMPLETE') return '#E67E22'; // Naranja para incompleto
      if (order.estatus === 'BACKLOG') return '#9B59B6'; // Púrpura para por hacer
    }
    
    // Lógica original basada en fecha
    const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
    const now = new Date();
    const diffHours = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return '#E74C3C'; // Overdue
    if (diffHours < 24) return '#F39C12'; // Today
    return '#27AE60'; // Upcoming
  };

  const getStatusText = (order: Order) => {
    // Si el pedido tiene un estatus específico, usarlo
    if (order.estatus) {
      if (order.estatus === 'DONE') return 'Entregado';
      if (order.estatus === 'CANCELED') return 'Cancelado';
      if (order.estatus === 'INCOMPLETE') return 'Incompleto';
      if (order.estatus === 'BACKLOG') return 'Por hacer';
    }
    
    // Lógica original basada en fecha
    const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
    const now = new Date();
    const diffHours = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'Vencido';
    if (diffHours < 24) return 'Para hoy';
    return 'Próximo';
  };

  const handleEdit = () => {
    router.push(`/orders/${id}/edit`);
  };

  const handleConfirmOrder = () => {
    Alert.alert(
      'Confirmar Pedido',
      '¿Estás seguro de que quieres confirmar este pedido? Esto cambiará el estatus a "Por hacer".',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            try {
              await updateOrderMutation.mutateAsync({
                id: order!.id,
                order: { estatus: 'BACKLOG' }
              });
              Alert.alert('Éxito', 'Pedido confirmado correctamente');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error al confirmar el pedido');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Pedido',
      '¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // Implement delete functionality
            Alert.alert('Eliminado', 'El pedido ha sido eliminado');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando pedido...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Pedido no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Pedido</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color="#4ECDC4" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order) }]} />
            <Text style={styles.statusText}>{getStatusText(order)}</Text>
          </View>
          <Text style={styles.orderId}>Pedido #{order.id.slice(-8)}</Text>
          
          {/* Confirm Order Button - Only show if not already confirmed */}
          {(!order.estatus || order.estatus === 'INCOMPLETE') && (
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirmOrder}
              disabled={updateOrderMutation.isPending}
            >
              <Ionicons 
                name="checkmark-circle-outline" 
                size={20} 
                color="white" 
              />
              <Text style={styles.confirmButtonText}>
                {updateOrderMutation.isPending ? 'Confirmando...' : 'Confirmar Pedido'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#7F8C8D" />
              <Text style={styles.infoLabel}>Cliente:</Text>
              <Text style={styles.infoValue}>{order.cliente}</Text>
            </View>
            {order.lugarEntrega && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#7F8C8D" />
                <Text style={styles.infoLabel}>Dirección:</Text>
                <Text style={styles.infoValue}>{order.lugarEntrega}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#7F8C8D" />
              <Text style={styles.infoLabel}>Fecha de Entrega:</Text>
              <Text style={styles.infoValue}>{formatDeliveryDate(order.fechaEntrega)}</Text>
            </View>
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos</Text>
          {order.productos.map((producto, index) => (
            <View key={index} style={styles.productCard}>
              
              <View style={styles.productHeader}>
                <Image source={{uri: producto.producto.imagen}} style={styles.productImage}></Image>
                <Text style={styles.productName}>{producto.producto.descripcion}</Text>
                <Text style={styles.productQuantity}>x{producto.cantidad}</Text>
              </View>
              
              <View style={styles.productDetails}>
                <Text style={styles.productSize}>Tamaño: {producto.size.descripcion}</Text>
                <Text style={styles.productPrice}>${producto.precio.toFixed(2)}</Text>
              </View>
              
              {producto.caracteristicas && producto.caracteristicas.length > 0 && (
                <View style={styles.characteristics}>
                  <Text style={styles.characteristicsTitle}>Características:</Text>
                  {producto.caracteristicas.map((caracteristica, idx) => (
                    <Text key={idx} style={styles.characteristic}>
                      • {caracteristica}
                    </Text>
                  ))}
                </View>
              )}
              
              <View style={styles.productSubtotal}>
                <Text style={styles.subtotalText}>
                  Subtotal: ${(producto.precio * producto.cantidad).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total del Pedido</Text>
          <Text style={styles.totalAmount}>${calculateTotal(order).toFixed(2)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  productImage: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
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
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  orderId: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  productCard: {
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap:10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  productQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productSize: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  characteristics: {
    marginBottom: 8,
  },
  characteristicsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  characteristic: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  productSubtotal: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 8,
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'right',
  },
  totalCard: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  confirmButton: {
    backgroundColor: '#4ecd7d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 