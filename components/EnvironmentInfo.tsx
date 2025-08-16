import { ENV } from '@/constants/Config';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EnvironmentInfoProps {
  showInProduction?: boolean;
}

export default function EnvironmentInfo({ showInProduction = false }: EnvironmentInfoProps) {
  // Solo mostrar en desarrollo o si se especifica explícitamente
  if (ENV.isProduction && !showInProduction) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Ionicons 
          name={ENV.isDevelopment ? "code-slash" : "rocket"} 
          size={12} 
          color={ENV.isDevelopment ? "#F39C12" : "#27AE60"} 
        />
        <Text style={[styles.text, { color: ENV.isDevelopment ? "#F39C12" : "#27AE60" }]}>
          {ENV.isDevelopment ? 'DEV' : 'PROD'}
        </Text>
      </View>
      
      {ENV.isDevelopment && (
        <View style={styles.apiInfo}>
          <Text style={styles.apiText}>
            API: {ENV.API_URL}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 1000,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  apiInfo: {
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  apiText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
});
