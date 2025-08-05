import { HeaderView } from '@/components/HeaderView';
import { ProductItem } from '@/components/ProductItem';
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct, useUpdateProductStatus } from '@/hooks/useApi';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProductsScreen() {
  const router = useRouter();
  const { data: products, isLoading, refetch } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const updateStatusMutation = useUpdateProductStatus();
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products?.filter(product =>
    product.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que quieres eliminar "${product.descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProductMutation.mutateAsync(product.id);
              Alert.alert('Éxito', 'Producto eliminado correctamente');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error al eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: product.id,
        estatus: !product.estatus,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar el estado');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderView title="Productos" hasBackButton={true} />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#7F8C8D" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7F8C8D" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductItem product={item} handleToggleStatus={handleToggleStatus} handleEditProduct={handleEditProduct} handleDeleteProduct={handleDeleteProduct} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No se encontraron productos' : 'No hay productos aún'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Intenta ajustar la búsqueda' : 'Agrega tu primer producto'}
            </Text>
          </View>
        }
      />

      {/* Add/Edit Product Modal */}
      <ProductModal
        visible={showModal}
        product={editingProduct}
        onClose={() => setShowModal(false)}
        onSave={async (productData) => {
          try {
            if (editingProduct) {
              await updateProductMutation.mutateAsync({
                id: editingProduct.id,
                product: productData,
              });
              Alert.alert('Éxito', 'Producto actualizado correctamente');
            } else {
              await createProductMutation.mutateAsync(productData);
              Alert.alert('Éxito', 'Producto creado correctamente');
            }
            setShowModal(false);
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al guardar el producto');
          }
        }}
      />
    </View>
  );
}

interface ProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id'>) => Promise<void>;
}

function ProductModal({ visible, product, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    descripcion: '',
    imagen: '',
    estatus: true,
    tag: '',
  });

  React.useEffect(() => {
    if (product) {
      setFormData({
        descripcion: product.descripcion,
        imagen: product.imagen || '',
        estatus: product.estatus,
        tag: product.tag || '',
      });
    } else {
      setFormData({
        descripcion: '',
        imagen: '',
        estatus: true,
        tag: '',
      });
    }
  }, [product]);

  const handleSave = async () => {
    if (!formData.descripcion.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return;
    }

    await onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descripción *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.descripcion}
              onChangeText={(value) => setFormData(prev => ({ ...prev, descripcion: value }))}
              placeholder="Ingrese la descripción del producto"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>URL de Imagen</Text>
            <TextInput
              style={styles.textInput}
              value={formData.imagen}
              onChangeText={(value) => setFormData(prev => ({ ...prev, imagen: value }))}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tag</Text>
            <TextInput
              style={styles.textInput}
              value={formData.tag}
              onChangeText={(value) => setFormData(prev => ({ ...prev, tag: value.toLowerCase() }))}
              placeholder="tag-del-producto"
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.inputLabel}>Estado</Text>
            <TouchableOpacity
              style={[
                styles.switch,
                { backgroundColor: formData.estatus ? '#27AE60' : '#E74C3C' },
              ]}
              onPress={() => setFormData(prev => ({ ...prev, estatus: !prev.estatus }))}
            >
              <View style={[
                styles.switchThumb,
                { transform: [{ translateX: formData.estatus ? 20 : 0 }] },
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar</Text>
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
  productsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
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
  saveButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 