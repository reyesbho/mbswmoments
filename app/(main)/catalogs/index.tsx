import { HeaderView } from '@/components/HeaderView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function CatalogsScreen() {
  const router = useRouter();
  

  return (
    <View style={styles.container}>
      
      <HeaderView title="Catalogos" />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Gestionar Catálogos</Text>
        
        <View style={styles.catalogOptions}>
          <TouchableOpacity
            style={styles.catalogOption}
            onPress={() => router.push('/catalogs/products')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="cube-outline" size={32} color="#4ECDC4" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Productos</Text>
              <Text style={styles.optionDescription}>
                Gestiona tu catálogo de productos
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.catalogOption}
            onPress={() => router.push('/catalogs/sizes')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="resize-outline" size={32} color="#45B7D1" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Tamaños</Text>
              <Text style={styles.optionDescription}>
                Configura los tamaños disponibles
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  catalogOptions: {
    gap: 16,
  },
  catalogOption: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  }
}); 