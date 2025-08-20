import { HeaderView } from '@/components/HeaderView';
import { ProductItem } from '@/components/ProductItem';
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct, useUpdateProductStatus } from '@/hooks/useApi';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
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
              // Refrescar la lista de productos después de eliminar exitosamente
              refetch();
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
      // Refrescar la lista de productos después de actualizar el estado exitosamente
      refetch();
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
            // Refrescar la lista de productos después de guardar exitosamente
            refetch();
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Función para resetear todos los valores del formulario
  const resetForm = () => {
    setFormData({
      descripcion: '',
      imagen: '',
      estatus: true,
      tag: '',
    });
    setImagePreview(null);
  };

  React.useEffect(() => {
    console.log('useEffect ejecutado con product:', product?.id);
    if (product) {
      const newFormData = {
        descripcion: product.descripcion,
        imagen: product.imagen || '',
        estatus: product.estatus,
        tag: product.tag || '',
      };
      console.log('Inicializando formData con producto existente:', {
        ...newFormData,
        imagen: newFormData.imagen ? newFormData.imagen.substring(0, 50) + '...' : 'sin imagen'
      });
      setFormData(newFormData);
      setImagePreview(product.imagen || null);
    } else {
      console.log('Inicializando formData para nuevo producto');
      resetForm();
    }
  }, [product?.id]); // Solo se ejecuta cuando cambia el ID del producto

  const convertImageToWebP = async (uri: string): Promise<string> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 150, height: 150 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.WEBP,
          base64: true,
        }
      );
      
      if (result.base64) {
        return `data:image/webp;base64,${result.base64}`;
      }
      throw new Error('No se pudo convertir la imagen a base64');
    } catch (error) {
      console.error('Error al convertir imagen:', error);
      throw new Error('Error al procesar la imagen');
    }
  };

  const handleImagePick = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        
        // Check file size (5MB limit)
        if (selectedImage.fileSize && selectedImage.fileSize > 5242880) {
          Alert.alert('Error', 'Tamaño máximo 5MB');
          return;
        }

        // Show preview immediately with temporary URI
        setImagePreview(selectedImage.uri);

        // Convert to WebP and base64
        try {
          const base64Image = await convertImageToWebP(selectedImage.uri);
          console.log('Imagen convertida a base64:', base64Image.substring(0, 50) + '...');
          setFormData(prev => {
            const newFormData = { ...prev, imagen: base64Image };
            console.log('FormData actualizado:', { ...newFormData, imagen: newFormData.imagen.substring(0, 50) + '...' });
            return newFormData;
          });
          // Update preview with the converted base64 image
          setImagePreview(base64Image);
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Error al procesar la imagen');
          setImagePreview(null);
        }
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'Error al seleccionar la imagen');
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imagen: '' }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!formData.descripcion.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return;
    }

    console.log('Guardando producto con formData:', {
      ...formData,
      imagen: formData.imagen ? formData.imagen.substring(0, 50) + '...' : 'sin imagen'
    });

    await onSave(formData);
    // Resetear el formulario después de guardar exitosamente
    resetForm();
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
          <TouchableOpacity onPress={handleClose}>
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
            <Text style={styles.inputLabel}>Imagen del Producto</Text>
            
            {imagePreview ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={handleRemoveImage}
                >
                  <Ionicons name="close-circle" size={24} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePick}>
                <Ionicons name="camera-outline" size={32} color="#7F8C8D" />
                <Text style={styles.imagePickerText}>Seleccionar imagen</Text>
                <Text style={styles.imagePickerSubtext}>Máximo 5MB</Text>
              </TouchableOpacity>
            )}
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
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
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
  // Image picker styles
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 8,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  imagePickerButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7F8C8D',
    marginTop: 8,
  },
  imagePickerSubtext: {
    fontSize: 12,
    color: '#BDC3C7',
    marginTop: 4,
  },
}); 