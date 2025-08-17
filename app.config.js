import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'SMoments',
  slug: 'mbswmoments',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/sweet-moments.png',
  scheme: 'mbswmoments',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  
  // Configuración específica por plataforma
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.sweetmoments.mbswmoments',
  },
  
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/sweet-moments.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: 'com.sweetmoments.mbswmoments',
  },
  
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  
  // Plugins
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],
  
  // Experimentos
  experiments: {
    typedRoutes: true,
  },
  
  // Variables de entorno
  extra: {
    // Determinar el entorno basado en NODE_ENV o __DEV__
    isDevelopment: process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production' || process.env.EXPO_PUBLIC_ENV === 'production',
    
    // URLs de la API
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://services.sweetmoments.mx' 
        : 'http://192.168.3.19:3000'),
    
    // EAS Project ID
    eas: {
      projectId: '21d40380-ad65-474f-aed4-acb2867529fa',
    },
  },
});
