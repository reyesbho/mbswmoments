import { useLogin, useLogout, useRegister } from '@/hooks/useApi';
import { apiService } from '@/services/api';
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  redirectToAuth: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const isAuthenticated = !!user;

  console.log('AuthProvider state:', { user, isAuthenticated, isLoading });

  // Function to redirect to auth page
  const redirectToAuth = () => {
    // Don't redirect during initial auth check
    if (isInitialAuthCheck) {
      console.log('⏸️ Skipping redirect during initial auth check');
      return;
    }
    
    console.log('🔄 Redirecting to auth page');
    setUser(null);
    router.replace('/auth');
  };

  // Function to redirect to orders page (main page)
  const redirectToOrders = () => {
    console.log('🔄 Redirecting to orders page (main)');
    router.replace('/(main)');
  };

  // Prevent redirect during initial auth check
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);

  // Set up unauthorized callback
  useEffect(() => {
    apiService.setUnauthorizedCallback(() => {
      if (!isInitialAuthCheck) {
        redirectToAuth();
      }
    });
  }, [isInitialAuthCheck]);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking for existing authentication...');
        
        // Check if we have a token first
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          console.log('❌ No token found, user not authenticated');
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // If we can fetch orders, user is authenticated
        // Create a user object (we don't have user details from this call)
        const userData: User = {
          uid: 'authenticated_user',
          email: 'user@example.com', // This could be stored or fetched
        };
        
        setUser(userData);
      } catch (error: any) {
        console.log('❌ No valid authentication found:', error.message);
        setUser(null);
        // Don't redirect here, let the user stay on current page
      } finally {
        setIsLoading(false);
        setIsInitialAuthCheck(false); // Allow redirects after initial check
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginMutation.mutateAsync({ email, password });
      const userData: User = {
        uid: email,
        email,
        token: response.token,
      };
      console.log('Login successful, setting user:', userData);
      setUser(userData);
      redirectToOrders();
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      redirectToAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await registerMutation.mutateAsync({ email, password , confirmPassword: password});
      const userData: User = {
        uid: response.uid,
        email: response.email,
        token: response.token,
      };
      console.log('Register successful, setting user:', userData);
      setUser(userData);
      redirectToOrders();
    } catch (error) {
      console.error('Registration failed:', error);
      setUser(null);
      redirectToAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutMutation.mutateAsync();
      console.log('Logout successful, clearing user');
      setUser(null);
      redirectToAuth();
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      redirectToAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    redirectToAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 