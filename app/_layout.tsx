import { NOTIFICATION_TYPES } from '@/constants/Notifications';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { notificationService } from '@/services/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry 401 errors to prevent cycling
        if (error?.message?.includes('Unauthorized') || error?.response?.status === 401) {
          return false;
        }
        // Only retry once for other errors
        return failureCount < 1;
      },
      retryDelay: 1000,
    },
    mutations: {
      retry: false, // Never retry mutations
    },
  },
});

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Configurar manejo de notificaciones
  useEffect(() => {
    // Configurar el listener para notificaciones recibidas
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Configurar el listener para cuando se toca una notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // Manejar diferentes tipos de notificaciones
      if (data?.type === NOTIFICATION_TYPES.DAILY_SUMMARY) {
        // Navegar a la pantalla de pedidos
        // Aquí podrías usar router.push('/') si tuvieras acceso al router
        console.log('Navegando a pedidos desde notificación diaria');
      } else if (data?.type === NOTIFICATION_TYPES.URGENT_ORDER) {
        // Navegar al pedido específico
        console.log('Navegando a pedido urgente:', data.orderId);
      }
    });

    // Programar notificaciones diarias si están habilitadas
    if (isAuthenticated) {
      notificationService.scheduleDailyNotification();
    }

    return () => {
      // Usar el método recomendado para remover suscripciones
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="notifications" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
