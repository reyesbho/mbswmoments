import { OrderStatusColors } from "@/constants/Colors";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function ProductItem({ product, handleToggleStatus, handleEditProduct, handleDeleteProduct }: { product: Product, handleToggleStatus: (product: Product) => void, handleEditProduct: (product: Product) => void, handleDeleteProduct: (product: Product) => void }) {
    return (
            <View style={styles.productCard}>
              <View style={styles.productHeader}>
                
                {product.imagen && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: product.imagen }} style={styles.productImage} />
                  </View>
                )}
              
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.descripcion}</Text>
                  {product.tag && (
                    <Text style={styles.productTag}>#{product.tag}</Text>
                  )}
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(product)}
                    style={[
                      styles.statusButton,
                      { backgroundColor: product.estatus ? OrderStatusColors.DONE : OrderStatusColors.CANCELED },
                    ]}
                  >
                    <Ionicons
                      name={product.estatus ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEditProduct(product)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="create-outline" size={20} color="#4ECDC4" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteProduct(product)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={OrderStatusColors.CANCELED} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.productStatus}>
                <Text style={[
                  styles.statusText,
                  { color: product.estatus ? OrderStatusColors.DONE : OrderStatusColors.CANCELED },
                ]}>
                  {product.estatus ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
    )
}

const styles = StyleSheet.create({
    productImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
    },
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
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
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
      alignItems: 'flex-start',
      marginBottom: 12,
      gap:10,
      alignContent:'center',
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2C3E50',
      marginBottom: 4,
    },
    productTag: {
      fontSize: 12,
      color: '#4ECDC4',
      fontWeight: '500',
    },
    productActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusButton: {
      padding: 4,
      borderRadius: 4,
    },
    actionButton: {
      padding: 4,
    },
    imageContainer: {
      backgroundColor: '#F8F9FA',
      padding: 8,
      borderRadius: 8,
      marginBottom: 8,
  
    },
    productStatus: {
      alignItems: 'flex-end',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
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
    switch: {
      width: 44,
      height: 24,
      borderRadius: 12,
      padding: 2,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E9ECEF',
      alignItems: 'center',
    },
    saveButton: {
      flex: 1,
      backgroundColor: '#4ECDC4',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
  }); 