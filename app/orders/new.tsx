import { useCreateOrder, useProducts, useSizes } from '@/hooks/useApi';
import { OrderProduct, Product, SizeProduct } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface FormData {
  cliente: string;
  lugarEntrega: string;
  fechaEntrega: Date;
  productos: OrderProduct[];
}

interface FormErrors {
  cliente?: string;
  productos?: string;
}

export default function NewOrderScreen() {
  const router = useRouter();
  const { data: products } = useProducts();
  const { data: sizes } = useSizes();
  const createOrderMutation = useCreateOrder();
  
  const [formData, setFormData] = useState<FormData>({
    cliente: '',
    lugarEntrega: '',
    fechaEntrega: new Date(),
    productos: [],
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (field: keyof FormData, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleAddProduct = () => {
    if (!products || products.length === 0) {
      Alert.alert('Error', 'No hay productos disponibles');
      return;
    }
    setShowProductModal(true);
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.cliente.trim()) {
      newErrors.cliente = 'El nombre del cliente es requerido';
    }

    if (formData.productos.length === 0) {
      newErrors.productos = 'Debe agregar al menos un producto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Convert Date to Firebase Timestamp format
      const orderData = {
        ...formData,
        fechaEntrega: {
          seconds: Math.floor(formData.fechaEntrega.getTime() / 1000),
          nanoseconds: (formData.fechaEntrega.getTime() % 1000) * 1000000,
        },
      };

      await createOrderMutation.mutateAsync(orderData);
      Alert.alert('Éxito', 'Pedido creado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear el pedido');
    }
  };

  const calculateTotal = () => {
    return formData.productos.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Pedido</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
          <Ionicons name="checkmark" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre del Cliente *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.cliente && styles.textInputError
              ]}
              value={formData.cliente}
              onChangeText={(value) => handleInputChange('cliente', value)}
              placeholder="Ingrese el nombre del cliente"
            />
            {errors.cliente && (
              <Text style={styles.errorText}>{errors.cliente}</Text>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Dirección de Entrega</Text>
            <TextInput
              style={styles.textInput}
              value={formData.lugarEntrega}
              onChangeText={(value) => handleInputChange('lugarEntrega', value)}
              placeholder="Ingrese la dirección de entrega"
              multiline
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Fecha de Entrega</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#7F8C8D" />
                <Text style={styles.dateButtonText}>
                  {formData.fechaEntrega.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#7F8C8D" />
                <Text style={styles.timeButtonText}>
                  {formData.fechaEntrega.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>
            <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {formData.productos.map((producto, index) => (
            <View key={index} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{producto.producto.descripcion}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveProduct(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.productDetails}>
                <Text style={styles.productInfo}>
                  Tamaño: {producto.size.descripcion}
                </Text>
                <Text style={styles.productInfo}>
                  Cantidad: {producto.cantidad}
                </Text>
                <Text style={styles.productPrice}>
                  ${producto.precio.toFixed(2)}
                </Text>
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
            </View>
          ))}

          {formData.productos.length === 0 && (
            <View style={styles.emptyProducts}>
              <Ionicons name="cube-outline" size={48} color="#CCC" />
              <Text style={styles.emptyProductsText}>No hay productos agregados</Text>
              <Text style={styles.emptyProductsSubtext}>
                Agrega productos al pedido
              </Text>
            </View>
          )}
          
          {errors.productos && (
            <Text style={styles.errorText}>{errors.productos}</Text>
          )}
        </View>

        {/* Total */}
        {formData.productos.length > 0 && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total del Pedido</Text>
            <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
          </View>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.fechaEntrega}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              // Preserve the current time when changing date
              const newDate = new Date(selectedDate);
              newDate.setHours(formData.fechaEntrega.getHours());
              newDate.setMinutes(formData.fechaEntrega.getMinutes());
              handleInputChange('fechaEntrega', newDate);
            }
          }}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={formData.fechaEntrega}
          mode="time"
          display="default"
          is24Hour={false}
          minuteInterval={15}
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (event.type === 'set' && selectedDate) {
              // Preserve the current date when changing time
              const newDate = new Date(formData.fechaEntrega);
              newDate.setHours(selectedDate.getHours());
              newDate.setMinutes(selectedDate.getMinutes());
              handleInputChange('fechaEntrega', newDate);
            }
          }}
        />
      )}

      {/* Product Selection Modal */}
      <ProductSelectionModal
        visible={showProductModal}
        onClose={() => setShowProductModal(false)}
        products={products || []}
        sizes={sizes || []}
        onAddProduct={(producto) => {
          setFormData(prev => ({
            ...prev,
            productos: [...prev.productos, producto],
          }));
          setShowProductModal(false);
        }}
      />
    </View>
  );
}

interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  products: Product[];
  sizes: SizeProduct[];
  onAddProduct: (producto: OrderProduct) => void;
}

function ProductSelectionModal({
  visible,
  onClose,
  products,
  sizes,
  onAddProduct,
}: ProductSelectionModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeProduct | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [precio, setPrecio] = useState('');
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState('');
  const [modalErrors, setModalErrors] = useState<{
    producto?: string;
    size?: string;
    cantidad?: string;
    precio?: string;
  }>({});

  const clearModalError = (field: keyof typeof modalErrors) => {
    if (modalErrors[field]) {
      setModalErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleAddCharacteristic = () => {
    if (nuevaCaracteristica.trim()) {
      setCaracteristicas(prev => [...prev, nuevaCaracteristica.trim()]);
      setNuevaCaracteristica('');
    }
  };

  const handleRemoveCharacteristic = (index: number) => {
    setCaracteristicas(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setCantidad('1');
    setPrecio('');
    setCaracteristicas([]);
    setNuevaCaracteristica('');
    setModalErrors({});
  };

  const validateModalForm = (): boolean => {
    const newErrors: typeof modalErrors = {};

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

    setModalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateModalForm()) {
      return;
    }

    // TypeScript guard - these are guaranteed to be non-null after validation
    if (!selectedProduct || !selectedSize) {
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

    onAddProduct(producto);
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
                    clearModalError('producto');
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
            {modalErrors.producto && (
              <Text style={styles.errorText}>{modalErrors.producto}</Text>
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
                    clearModalError('size');
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
            {modalErrors.size && (
              <Text style={styles.errorText}>{modalErrors.size}</Text>
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
                    modalErrors.cantidad && styles.textInputError
                  ]}
                  value={cantidad}
                  onChangeText={(value) => {
                    setCantidad(value);
                    clearModalError('cantidad');
                  }}
                  keyboardType="numeric"
                  placeholder="1"
                />
                {modalErrors.cantidad && (
                  <Text style={styles.errorText}>{modalErrors.cantidad}</Text>
                )}
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.modalSectionTitle}>Precio *</Text>
                <TextInput
                  style={[
                    styles.modalTextInput,
                    modalErrors.precio && styles.textInputError
                  ]}
                  value={precio}
                  onChangeText={(value) => {
                    setPrecio(value);
                    clearModalError('precio');
                  }}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
                {modalErrors.precio && (
                  <Text style={styles.errorText}>{modalErrors.precio}</Text>
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
           <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
             <Text style={styles.cancelButtonText}>Cancelar</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
             <Text style={styles.confirmButtonText}>Agregar</Text>
           </TouchableOpacity>
         </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  saveButton: {
    backgroundColor: '#4ECDC4',
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  textInput: {
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
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
    marginLeft: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  timeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
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
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  characteristics: {
    marginTop: 8,
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
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyProductsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
  },
  emptyProductsSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 8,
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
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 