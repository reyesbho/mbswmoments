import { HeaderView } from '@/components/HeaderView';
import { useCreateSize, useDeleteSize, useSizes, useUpdateSize, useUpdateSizeStatus } from '@/hooks/useApi';
import { SizeProduct } from '@/types';
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
  View,
  RefreshControl
} from 'react-native';
import Toast, { useToast } from '@/components/Toast';

export default function SizesScreen() {
  const router = useRouter();
  const { data: sizes, isLoading, refetch } = useSizes();
  const createSizeMutation = useCreateSize();
  const updateSizeMutation = useUpdateSize();
  const deleteSizeMutation = useDeleteSize();
  const updateStatusMutation = useUpdateSizeStatus();
  const { toast, showToast, hideToast, showSuccess, showError } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [editingSize, setEditingSize] = useState<SizeProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSizes = sizes?.filter(size =>
    size.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    size.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleAddSize = () => {
    setEditingSize(null);
    setShowModal(true);
  };

  const handleEditSize = (size: SizeProduct) => {
    setEditingSize(size);
    setShowModal(true);
  };

  const handleDeleteSize = (size: SizeProduct) => {
    Alert.alert(
      'Eliminar Tamaño',
      `¿Estás seguro de que quieres eliminar "${size.descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSizeMutation.mutateAsync(size.id);
              showSuccess('Tamaño eliminado correctamente');
            } catch (error: any) {
              showError(error.message || 'Error al eliminar el tamaño');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (size: SizeProduct) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: size.id,
        estatus: !size.estatus,
      });
      showSuccess('Estado actualizado correctamente');
    } catch (error: any) {
      showError(error.message || 'Error al actualizar el estado');
    }
  };

  const renderSizeItem = ({ item }: { item: SizeProduct }) => (
    <View style={styles.sizeCard}>
      <View style={styles.sizeHeader}>
        <View style={styles.sizeInfo}>
          <Text style={styles.sizeName}>{item.descripcion}</Text>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 2 && (
                <Text style={styles.moreTags}>+{item.tags.length - 2}</Text>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.sizeActions}>
          <TouchableOpacity
            onPress={() => handleToggleStatus(item)}
            style={[
              styles.statusButton,
              item.estatus ? styles.activeStatus : styles.inactiveStatus
            ]}
          >
            <Ionicons
              name={item.estatus ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={item.estatus ? '#27AE60' : '#E74C3C'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleEditSize(item)}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={20} color="#3498DB" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleDeleteSize(item)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="resize-outline" size={64} color="#BDC3C7" />
      <Text style={styles.emptyStateTitle}>No hay tamaños</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery ? 'No se encontraron tamaños con esa búsqueda' : 'Agrega tu primer tamaño'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderView title="Tamaños" hasBackButton={true} />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#7F8C8D" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tamaños..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7F8C8D" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity onPress={handleAddSize} style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sizes List */}
      <FlatList
        data={filteredSizes}
        renderItem={renderSizeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.sizesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={['#4ECDC4']}
            tintColor="#4ECDC4"
            title="Desliza para actualizar"
            titleColor="#7F8C8D"
            progressBackgroundColor="#F8F9FA"
          />
        }
      />

      {/* Add/Edit Size Modal */}
      <SizeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        editingSize={editingSize}
        onSave={async (sizeData) => {
          try {
            if (editingSize) {
              await updateSizeMutation.mutateAsync({
                id: editingSize.id,
                size: sizeData,
              });
              showSuccess('Tamaño actualizado correctamente');
            } else {
              await createSizeMutation.mutateAsync(sizeData);
              showSuccess('Tamaño creado correctamente');
            }
            setShowModal(false);
          } catch (error: any) {
            showError(error.message || 'Error al guardar el tamaño');
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

interface SizeModalProps {
  visible: boolean;
  onClose: () => void;
  editingSize: SizeProduct | null;
  onSave: (sizeData: Omit<SizeProduct, 'id'>) => Promise<void>;
}

function SizeModal({ visible, onClose, editingSize, onSave }: SizeModalProps) {
  const [descripcion, setDescripcion] = useState('');
  const [estatus, setEstatus] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ descripcion?: string }>({});

  React.useEffect(() => {
    if (editingSize) {
      setDescripcion(editingSize.descripcion);
      setEstatus(editingSize.estatus);
      setTags(editingSize.tags || []);
    } else {
      setDescripcion('');
      setEstatus(true);
      setTags([]);
    }
    setNewTag('');
    setErrors({});
  }, [editingSize, visible]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!descripcion.trim()) {
      setErrors({ descripcion: 'La descripción es requerida' });
      return;
    }

    await onSave({
      descripcion: descripcion.trim(),
      estatus,
      tags: tags.length > 0 ? tags : undefined,
    });
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
            {editingSize ? 'Editar Tamaño' : 'Nuevo Tamaño'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descripción *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.descripcion && styles.textInputError
              ]}
              value={descripcion}
              onChangeText={(value) => {
                setDescripcion(value);
                if (errors.descripcion) {
                  setErrors({});
                }
              }}
              placeholder="Ej: Grande, Mediano, Pequeño"
            />
            {errors.descripcion && (
              <Text style={styles.errorText}>{errors.descripcion}</Text>
            )}
          </View>

          {/* Status */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Estado</Text>
            <TouchableOpacity
              style={[
                styles.statusToggle,
                estatus ? styles.activeToggle : styles.inactiveToggle
              ]}
              onPress={() => setEstatus(!estatus)}
            >
              <Ionicons
                name={estatus ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={estatus ? '#27AE60' : '#E74C3C'}
              />
              <Text style={[
                styles.statusText,
                { color: estatus ? '#27AE60' : '#E74C3C' }
              ]}>
                {estatus ? 'Activo' : 'Inactivo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Etiquetas</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Agregar etiqueta"
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity onPress={handleAddTag} style={styles.addTagButton}>
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsList}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagItemText}>{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <Ionicons name="close-circle" size={16} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>
              {editingSize ? 'Actualizar' : 'Crear'}
            </Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sizesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sizeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sizeInfo: {
    flex: 1,
    marginRight: 12,
  },
  sizeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  sizeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusButton: {
    padding: 8,
    borderRadius: 8,
  },
  activeStatus: {
    backgroundColor: '#E8F5E8',
  },
  inactiveStatus: {
    backgroundColor: '#FDE8E8',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 16,
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
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
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
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activeToggle: {
    backgroundColor: '#E8F5E8',
    borderColor: '#27AE60',
  },
  inactiveToggle: {
    backgroundColor: '#FDE8E8',
    borderColor: '#E74C3C',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  tagItemText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '500',
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