import { HeaderView } from '@/components/HeaderView';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderView title="Perfil" />

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#4ECDC4" />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userRole}>Usuario</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <Text style={styles.actionText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  profileSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  actionsContainer: {
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 12,
  },
});