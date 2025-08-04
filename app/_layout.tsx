import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

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


  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
        <Stack.Screen name="auth" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
