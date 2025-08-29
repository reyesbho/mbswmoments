import Toast, { useToast } from '@/components/Toast';
import { OrderStatusColors } from '@/constants/Colors';
import { useOrder, useProducts, useSizes, useUpdateOrder } from '@/hooks/useApi';
import { Order, OrderProduct, Product, SizeProduct } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: order, isLoading, refetch } = useOrder(id);
  const { data: products } = useProducts();
  const { data: sizes } = useSizes();
  const updateOrderMutation = useUpdateOrder();
  const { toast, showToast, hideToast, showSuccess, showError } = useToast();

  // Edit states
  const [isEditingCliente, setIsEditingCliente] = useState(false);
  const [isEditingLugarEntrega, setIsEditingLugarEntrega] = useState(false);
  const [isEditingFecha, setIsEditingFecha] = useState(false);
  const [isEditingHora, setIsEditingHora] = useState(false);
  const [editingCliente, setEditingCliente] = useState('');
  const [editingLugarEntrega, setEditingLugarEntrega] = useState('');
  const [editingFecha, setEditingFecha] = useState(new Date());
  const [editingHora, setEditingHora] = useState(new Date());

  // Local changes tracking
  const [localChanges, setLocalChanges] = useState<{
    cliente?: string;
    lugarEntrega?: string;
    fechaEntrega?: { seconds: number; nanoseconds: number };
  }>({});

  // Add product modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);

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
      if (order.estatus === 'DONE') return OrderStatusColors.DONE;
      if (order.estatus === 'CANCELED') return OrderStatusColors.CANCELED;
      if (order.estatus === 'INCOMPLETE') return OrderStatusColors.INCOMPLETE;
      if (order.estatus === 'BACKLOG') return OrderStatusColors.BACKLOG;
      if (order.estatus === 'DELETE') return OrderStatusColors.DELETE;
    }
    
    // Lógica original basada en fecha
    const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
    const now = new Date();
    const diffHours = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return OrderStatusColors.CANCELED; // Overdue
    if (diffHours < 24) return OrderStatusColors.INCOMPLETE; // Today
    return OrderStatusColors.DONE; // Upcoming
  };

  const getStatusText = (order: Order) => {
    // Si el pedido tiene un estatus específico, usarlo
    if (order.estatus) {
      if (order.estatus === 'DONE') return 'Entregado';
      if (order.estatus === 'CANCELED') return 'Cancelado';
      if (order.estatus === 'INCOMPLETE') return 'Incompleto';
      if (order.estatus === 'BACKLOG') return 'Por hacer';
      if (order.estatus === 'DELETE') return 'Eliminado';
    }
    
    // Lógica original basada en fecha
    const deliveryDate = new Date(order.fechaEntrega.seconds * 1000);
    const now = new Date();
    const diffHours = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'Vencido';
    if (diffHours < 24) return 'Para hoy';
    return 'Próximo';
  };

  const handleEditCliente = () => {
    if (!order) return;
    setEditingCliente(order.cliente);
    setIsEditingCliente(true);
  };

  const handleSaveCliente = () => {
    if (!editingCliente.trim()) {
      showError('El nombre del cliente es requerido');
      return;
    }

    // Almacenar cambio localmente
    setLocalChanges(prev => ({
      ...prev,
      cliente: editingCliente.trim()
    }));
    setIsEditingCliente(false);
    showSuccess('Cliente actualizado localmente');
  };

  const handleEditLugarEntrega = () => {
    if (!order) return;
    setEditingLugarEntrega(order.lugarEntrega || '');
    setIsEditingLugarEntrega(true);
  };

  const handleSaveLugarEntrega = () => {
    // Almacenar cambio localmente
    setLocalChanges(prev => ({
      ...prev,
      lugarEntrega: editingLugarEntrega.trim() || undefined
    }));
    setIsEditingLugarEntrega(false);
    showSuccess('Dirección actualizada localmente');
  };

  const handleEditFecha = () => {
    if (!order) return;
    const currentDate = new Date(order.fechaEntrega.seconds * 1000);
    setEditingFecha(currentDate);
    setEditingHora(currentDate);
    setIsEditingFecha(true);
  };

  const handleEditHora = () => {
    if (!order) return;
    const currentDate = new Date(order.fechaEntrega.seconds * 1000);
    setEditingHora(currentDate);
    setIsEditingHora(true);
  };

  const handleSaveFecha = () => {
    // Combinar la fecha seleccionada con la hora actual
    const newDate = new Date(editingFecha);
    newDate.setHours(editingHora.getHours());
    newDate.setMinutes(editingHora.getMinutes());
    
    const newFechaEntrega = {
      seconds: Math.floor(newDate.getTime() / 1000),
      nanoseconds: (newDate.getTime() % 1000) * 1000000,
    };

    // Almacenar cambio localmente
    setLocalChanges(prev => ({
      ...prev,
      fechaEntrega: newFechaEntrega
    }));
    setIsEditingFecha(false);
    showSuccess('Fecha actualizada localmente');
  };

  const handleSaveHora = () => {
    // Combinar la fecha actual con la hora seleccionada
    const currentDate = new Date(order!.fechaEntrega.seconds * 1000);
    currentDate.setHours(editingHora.getHours());
    currentDate.setMinutes(editingHora.getMinutes());
    
    const newFechaEntrega = {
      seconds: Math.floor(currentDate.getTime() / 1000),
      nanoseconds: (currentDate.getTime() % 1000) * 1000000,
    };

    // Almacenar cambio localmente
    setLocalChanges(prev => ({
      ...prev,
      fechaEntrega: newFechaEntrega
    }));
    setIsEditingHora(false);
    showSuccess('Hora actualizada localmente');
  };

  const handleSaveAllChanges = async () => {
    if (Object.keys(localChanges).length === 0) {
      showError('No hay cambios para guardar');
      return;
    }

    try {
      await updateOrderMutation.mutateAsync({
        id: order!.id,
        order: localChanges
      });
      setLocalChanges({});
      showSuccess('Todos los cambios guardados correctamente');
      // Invalidar y recargar datos
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await refetch();
    } catch (error: any) {
      showError(error.message || 'Error al guardar los cambios');
    }
  };

  const handleDiscardChanges = () => {
    setLocalChanges({});
    setIsEditingCliente(false);
    setIsEditingLugarEntrega(false);
    setIsEditingFecha(false);
    setIsEditingHora(false);
    showSuccess('Cambios descartados');
  };

  const handleAddProduct = () => {
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = (productIndex: number) => {
    if (!order) return;
    
    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro de que quieres eliminar este producto del pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedProductos = order.productos.filter((_, index) => index !== productIndex);
              await updateOrderMutation.mutateAsync({
                id: order.id,
                order: { productos: updatedProductos }
              });
              showSuccess('Producto eliminado correctamente');
              // Invalidar y recargar datos
              await queryClient.invalidateQueries({ queryKey: ['orders'] });
              await refetch();
            } catch (error: any) {
              showError(error.message || 'Error al eliminar el producto');
            }
          },
        },
      ]
    );
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
              showSuccess('Pedido confirmado correctamente');
              // Invalidar y recargar datos
              await queryClient.invalidateQueries({ queryKey: ['orders'] });
              await refetch();
            } catch (error: any) {
              showError(error.message || 'Error al confirmar el pedido');
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
            showSuccess('El pedido ha sido eliminado');
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
            {/* Cliente */}
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#7F8C8D" />
              <Text style={styles.infoLabel}>Cliente:</Text>
              {isEditingCliente ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editingCliente}
                    onChangeText={setEditingCliente}
                    placeholder="Nombre del cliente"
                  />
                  <TouchableOpacity onPress={handleSaveCliente} style={styles.saveButton}>
                    <Ionicons name="checkmark" size={16} color="#27AE60" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setIsEditingCliente(false)} 
                    style={styles.cancelButton}
                  >
                    <Ionicons name="close" size={16} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.valueContainer}>
                  <Text style={[
                    styles.infoValue,
                    localChanges.cliente && styles.changedValue
                  ]}>
                    {localChanges.cliente || order.cliente}
                  </Text>
                  <TouchableOpacity onPress={handleEditCliente} style={styles.editIcon}>
                    <Ionicons name="create-outline" size={16} color="#4ECDC4" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Lugar de Entrega */}
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#7F8C8D" />
              <Text style={styles.infoLabel}>Dirección:</Text>
              {isEditingLugarEntrega ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editingLugarEntrega}
                    onChangeText={setEditingLugarEntrega}
                    placeholder="Dirección de entrega"
                    multiline
                  />
                  <TouchableOpacity onPress={handleSaveLugarEntrega} style={styles.saveButton}>
                    <Ionicons name="checkmark" size={16} color="#27AE60" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setIsEditingLugarEntrega(false)} 
                    style={styles.cancelButton}
                  >
                    <Ionicons name="close" size={16} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.valueContainer}>
                  <Text style={[
                    styles.infoValue,
                    localChanges.lugarEntrega !== undefined && styles.changedValue
                  ]}>
                    {localChanges.lugarEntrega !== undefined ? localChanges.lugarEntrega : (order.lugarEntrega || 'No especificada')}
                  </Text>
                  <TouchableOpacity onPress={handleEditLugarEntrega} style={styles.editIcon}>
                    <Ionicons name="create-outline" size={16} color="#4ECDC4" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Fecha de Entrega */}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#7F8C8D" />
              <Text style={styles.infoLabel}>Fecha:</Text>
              {isEditingFecha ? (
                <View style={styles.editContainer}>
                  <Text style={styles.editDateText}>
                    {format(editingFecha, 'dd/MM/yyyy')}
                  </Text>
                </View>
              ) : (
                <View style={styles.valueContainer}>
                  <Text style={[
                    styles.infoValue,
                    localChanges.fechaEntrega && styles.changedValue
                  ]}>
                    {localChanges.fechaEntrega 
                      ? format(new Date(localChanges.fechaEntrega.seconds * 1000), 'dd/MM/yyyy')
                      : format(new Date(order.fechaEntrega.seconds * 1000), 'dd/MM/yyyy')
                    }
                  </Text>
                  <TouchableOpacity onPress={handleEditFecha} style={styles.editIcon}>
                    <Ionicons name="create-outline" size={16} color="#4ECDC4" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Hora de Entrega */}
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#7F8C8D" />
              <Text style={styles.infoLabel}>Hora:</Text>
              {isEditingHora ? (
                <View style={styles.editContainer}>
                  <Text style={styles.editDateText}>
                    {format(editingHora, 'HH:mm')}
                  </Text>
                </View>
              ) : (
                <View style={styles.valueContainer}>
                  <Text style={[
                    styles.infoValue,
                    localChanges.fechaEntrega && styles.changedValue
                  ]}>
                    {localChanges.fechaEntrega 
                      ? format(new Date(localChanges.fechaEntrega.seconds * 1000), 'HH:mm')
                      : format(new Date(order.fechaEntrega.seconds * 1000), 'HH:mm')
                    }
                  </Text>
                  <TouchableOpacity onPress={handleEditHora} style={styles.editIcon}>
                    <Ionicons name="create-outline" size={16} color="#4ECDC4" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Save/Discard Changes Buttons */}
          {Object.keys(localChanges).length > 0 && (
            <View style={styles.changesActions}>
              <TouchableOpacity 
                onPress={handleDiscardChanges} 
                style={styles.discardButton}
              >
                <Ionicons name="close-circle-outline" size={20} color="#E74C3C" />
                <Text style={styles.discardButtonText}>Descartar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveAllChanges} 
                style={styles.saveAllButton}
                disabled={updateOrderMutation.isPending}
              >
                <Ionicons name="save-outline" size={20} color="white" />
                <Text style={styles.saveAllButtonText}>
                  {updateOrderMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>
            <TouchableOpacity onPress={handleAddProduct} style={styles.addProductButton}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addProductButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>
          
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
              <TouchableOpacity onPress={() => handleDeleteProduct(index)} style={styles.deleteProductButton}>
                <Ionicons name="trash-outline" size={18} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total del Pedido</Text>
          <Text style={styles.totalAmount}>${calculateTotal(order).toFixed(2)}</Text>
        </View>
      </ScrollView>

      {/* Date/Time Picker Modals */}
      {isEditingFecha && (
        <DateTimePicker
          value={editingFecha}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              setEditingFecha(selectedDate);
              // Obtener la fecha/hora actual del pedido o de los cambios locales
              const currentDateTime = localChanges.fechaEntrega 
                ? new Date(localChanges.fechaEntrega.seconds * 1000)
                : new Date(order!.fechaEntrega.seconds * 1000);
              
              // Combinar la nueva fecha con la hora actual
              const newDate = new Date(selectedDate);
              newDate.setHours(currentDateTime.getHours());
              newDate.setMinutes(currentDateTime.getMinutes());
              
              const newFechaEntrega = {
                seconds: Math.floor(newDate.getTime() / 1000),
                nanoseconds: (newDate.getTime() % 1000) * 1000000,
              };

              setLocalChanges(prev => ({
                ...prev,
                fechaEntrega: newFechaEntrega
              }));
              
              // Cerrar el picker y mostrar confirmación
              setTimeout(() => {
                setIsEditingFecha(false);
                showSuccess('Fecha actualizada localmente');
              }, 100);
            } else if (event.type === 'dismissed') {
              // Si el usuario cancela, cerrar sin actualizar
              setIsEditingFecha(false);
            }
          }}
        />
      )}

      {isEditingHora && (
        <DateTimePicker
          value={editingHora}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              setEditingHora(selectedDate);
              // Obtener la fecha/hora actual del pedido o de los cambios locales
              const currentDateTime = localChanges.fechaEntrega 
                ? new Date(localChanges.fechaEntrega.seconds * 1000)
                : new Date(order!.fechaEntrega.seconds * 1000);
              
              // Combinar la fecha actual con la nueva hora
              const newDate = new Date(currentDateTime);
              newDate.setHours(selectedDate.getHours());
              newDate.setMinutes(selectedDate.getMinutes());
              
              const newFechaEntrega = {
                seconds: Math.floor(newDate.getTime() / 1000),
                nanoseconds: (newDate.getTime() % 1000) * 1000000,
              };

              setLocalChanges(prev => ({
                ...prev,
                fechaEntrega: newFechaEntrega
              }));
              
              // Cerrar el picker y mostrar confirmación
              setTimeout(() => {
                setIsEditingHora(false);
                showSuccess('Hora actualizada localmente');
              }, 100);
            } else if (event.type === 'dismissed') {
              // Si el usuario cancela, cerrar sin actualizar
              setIsEditingHora(false);
            }
          }}
        />
      )}

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        products={products || []}
        sizes={sizes || []}
        onAddProduct={async (newProduct) => {
          try {
            const updatedProductos = [...order.productos, newProduct];
            await updateOrderMutation.mutateAsync({
              id: order.id,
              order: { productos: updatedProductos }
            });
            setShowAddProductModal(false);
            showSuccess('Producto agregado correctamente');
            // Invalidar y recargar datos
            await queryClient.invalidateQueries({ queryKey: ['orders'] });
            await refetch();
          } catch (error: any) {
            showError(error.message || 'Error al agregar el producto');
          }
        }}
      />

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

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  products: Product[];
  sizes: SizeProduct[];
  onAddProduct: (producto: OrderProduct) => Promise<void>;
}

function AddProductModal({
  visible,
  onClose,
  products,
  sizes,
  onAddProduct,
}: AddProductModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeProduct | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [precio, setPrecio] = useState('');
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState('');
  const [errors, setErrors] = useState<{
    producto?: string;
    size?: string;
    cantidad?: string;
    precio?: string;
  }>({});

  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setCantidad('1');
    setPrecio('');
    setCaracteristicas([]);
    setNuevaCaracteristica('');
    setErrors({});
  };

  const handleAddCharacteristic = () => {
    if (nuevaCaracteristica.trim() && !caracteristicas.includes(nuevaCaracteristica.trim())) {
      setCaracteristicas([...caracteristicas, nuevaCaracteristica.trim()]);
      setNuevaCaracteristica('');
    }
  };

  const handleRemoveCharacteristic = (index: number) => {
    setCaracteristicas(caracteristicas.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!selectedProduct) {
      newErrors.producto = 'Seleccione un producto';
    }
    if (!selectedSize) {
      newErrors.size = 'Seleccione un tamaño';
    }
    if (!cantidad || parseInt(cantidad) <= 0) {
      newErrors.cantidad = 'Ingrese una cantidad válida';
    }
    if (!precio || parseFloat(precio) <= 0) {
      newErrors.precio = 'Ingrese un precio válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm() || !selectedProduct || !selectedSize) {
      return;
    }

    const producto: OrderProduct = {
      cantidad: parseInt(cantidad),
      size: {
        id: selectedSize.id,
        descripcion: selectedSize.descripcion,
      },
      producto: {
        id: selectedProduct.id,
        descripcion: selectedProduct.descripcion,
        imagen: selectedProduct.imagen,
      },
      caracteristicas: caracteristicas.length > 0 ? caracteristicas : undefined,
      precio: parseFloat(precio),
    };

    await onAddProduct(producto);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Agregar Producto</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Product Selection */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Producto *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productOption,
                    selectedProduct?.id === product.id && styles.selectedProductOption,
                  ]}
                  onPress={() => {
                    setSelectedProduct(product);
                    setErrors(prev => ({ ...prev, producto: undefined }));
                  }}
                >
                  <Text style={[
                    styles.productOptionText,
                    selectedProduct?.id === product.id && styles.selectedProductOptionText,
                  ]}>
                    {product.descripcion}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.producto && (
              <Text style={styles.errorText}>{errors.producto}</Text>
            )}
          </View>

          {/* Size Selection */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Tamaño *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.sizeOption,
                    selectedSize?.id === size.id && styles.selectedSizeOption,
                  ]}
                  onPress={() => {
                    setSelectedSize(size);
                    setErrors(prev => ({ ...prev, size: undefined }));
                  }}
                >
                  <Text style={[
                    styles.sizeOptionText,
                    selectedSize?.id === size.id && styles.selectedSizeOptionText,
                  ]}>
                    {size.descripcion}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.size && (
              <Text style={styles.errorText}>{errors.size}</Text>
            )}
          </View>

          {/* Quantity and Price */}
          <View style={styles.modalSection}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.modalSectionTitle}>Cantidad *</Text>
                <TextInput
                  style={[
                    styles.modalTextInput,
                    errors.cantidad && styles.textInputError
                  ]}
                  value={cantidad}
                  onChangeText={(value) => {
                    setCantidad(value);
                    setErrors(prev => ({ ...prev, cantidad: undefined }));
                  }}
                  keyboardType="numeric"
                  placeholder="1"
                />
                {errors.cantidad && (
                  <Text style={styles.errorText}>{errors.cantidad}</Text>
                )}
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.modalSectionTitle}>Precio *</Text>
                <TextInput
                  style={[
                    styles.modalTextInput,
                    errors.precio && styles.textInputError
                  ]}
                  value={precio}
                  onChangeText={(value) => {
                    setPrecio(value);
                    setErrors(prev => ({ ...prev, precio: undefined }));
                  }}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
                {errors.precio && (
                  <Text style={styles.errorText}>{errors.precio}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Characteristics */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Características</Text>
            <View style={styles.characteristicInput}>
              <TextInput
                style={styles.modalTextInput}
                value={nuevaCaracteristica}
                onChangeText={setNuevaCaracteristica}
                placeholder="Agregar característica"
                onSubmitEditing={handleAddCharacteristic}
              />
              <TouchableOpacity onPress={handleAddCharacteristic} style={styles.addCharButton}>
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            {caracteristicas.map((caracteristica, index) => (
              <View key={index} style={styles.characteristicItem}>
                <Text style={styles.characteristicText}>• {caracteristica}</Text>
                <TouchableOpacity onPress={() => handleRemoveCharacteristic(index)}>
                  <Ionicons name="close-circle" size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity onPress={handleClose} style={styles.modalCancelButton}>
            <Text style={styles.modalCancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleConfirm} style={styles.modalConfirmButton}>
            <Text style={styles.modalConfirmButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
    marginLeft: 4,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addProductButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
  valueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  editIcon: {
    padding: 4,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    fontSize: 14,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  editDateText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  saveButton: {
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
  },
  cancelButton: {
    padding: 8,
    backgroundColor: '#FDE8E8',
    borderRadius: 6,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  productOption: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedProductOption: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  productOptionText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  selectedProductOptionText: {
    color: 'white',
  },
  sizeOption: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedSizeOption: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  sizeOptionText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  selectedSizeOptionText: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  modalTextInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  textInputError: {
    borderColor: '#E74C3C',
  },
  characteristicInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCharButton: {
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  characteristicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  characteristicText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  changesActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  discardButtonText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  saveAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  saveAllButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  changedValue: {
    fontWeight: 'bold',
    color: '#27AE60',
  },
  deleteProductButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    backgroundColor: '#FDE8E8',
    borderRadius: 6,
  },
}); 