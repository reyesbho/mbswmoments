import { ApiError, AuthResponse, Order, PaginatedOrdersResponse, Product, RegisterResponse, SizeProduct } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://192.168.3.10:3000';
  private onUnauthorized?: () => void;
  private tokenKey = 'auth_token'; // Para localStorage

  constructor() {
    console.log('Initializing ApiService with baseURL:', this.baseURL);
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Add token from storage if available
        const token = await this.getTokenFromStorage();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token added to request headers');
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      async (response: AxiosResponse) => {
        // Store token if provided in response
        if (response.data && response.data.token) {
          await this.setTokenInStorage(response.data.token);
        }
        
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          console.error('🔐 Unauthorized access - Clearing token and rejecting');
          // Clear token on unauthorized
          await this.clearTokenFromStorage();
          
          // Always call unauthorized callback for 401 errors
          // The AuthContext will handle whether to redirect or not
          if (this.onUnauthorized) {
            console.log('🔄 Calling unauthorized callback');
            this.onUnauthorized();
          }
          
          // Don't retry 401 errors, just redirect
          return Promise.reject(new Error('Unauthorized - Please login again'));
        }
        
        if (error.code === 'ECONNREFUSED') {
          console.error('🌐 Connection refused - Server might not be running');
        }
        
        if (error.code === 'NETWORK_ERROR') {
          console.error('🌐 Network error - Check internet connection');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Token management for AsyncStorage and cookies
  private async getTokenFromStorage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  }

  private async setTokenInStorage(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.tokenKey, token);
      console.log('💾 Token stored in AsyncStorage');
    } catch (error) {
      console.error('Error setting token in storage:', error);
    }
  }

  private async clearTokenFromStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.tokenKey);
      console.log('🗑️ Token cleared from AsyncStorage');
    } catch (error) {
      console.error('Error clearing token from storage:', error);
    }
  }

  // Set callback for unauthorized access
  setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorized = callback;
  }

  // Generic request method
  private async request<T>(config: any): Promise<T> {
    try {
      console.log('📡 Making request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        withCredentials: config.withCredentials,
      });
      
      const response = await this.api.request<T>(config);
      console.log('✅ Request successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Request failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // If it's a 401 error, don't retry, just throw the error
      if (error.response?.status === 401) {
        console.log('🚫 401 error detected - No retry, redirecting to login');
        throw new Error('Unauthorized - Please login again');
      }
      
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An error occurred',
      };
      throw apiError;
    }
  }

  // GET request
  private async get<T>(url: string): Promise<T> {
    return this.request<T>({ method: 'GET', url });
  }

  // POST request
  private async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }

  // PATCH request
  private async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  // PUT request
  private async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  // DELETE request
  private async delete<T>(url: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url });
  }

  // Auth methods
  async register(email: string, password: string): Promise<RegisterResponse> {
    console.log('👤 Registering user:', { email });
    const response = await this.post<RegisterResponse>('/user/register', { email, password });
    
    // Store token if provided in response
    if (response.token) {
      await this.setTokenInStorage(response.token);
    }
    
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('🔑 Logging in user:', { email });
    const response = await this.post<AuthResponse>('/user/login', { email, password });
    
    // Store token if provided in response
    if (response.token) {
      await this.setTokenInStorage(response.token);
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    console.log('🚪 Logging out user');
    const response = await this.post<{ message: string }>('/user/logout');
    
    // Clear token on logout
    await this.clearTokenFromStorage();
    
    return response;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    console.log('📦 Fetching products');
    return this.get<Product[]>('/api/products');
  }

  async getProduct(id: string): Promise<Product> {
    console.log('📦 Fetching product:', id);
    return this.get<Product>(`/api/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    console.log('📦 Creating product:', product);
    return this.post<Product>('/api/products', product);
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    console.log('📦 Updating product:', { id, product });
    return this.patch<Product>(`/api/products/${id}`, { estatus: product.estatus });
  }

  async updateProductStatus(id: string, estatus: boolean): Promise<Product> {
    console.log('📦 Updating product status:', { id, estatus });
    return this.patch<Product>(`/api/products/${id}`, { estatus });
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    console.log('📦 Deleting product:', id);
    return this.delete<{ message: string }>(`/api/products/${id}`);
  }

  // Size methods
  async getSizes(): Promise<SizeProduct[]> {
    console.log('📏 Fetching sizes');
    return this.get<SizeProduct[]>('/api/sizes');
  }

  async getSize(id: string): Promise<SizeProduct> {
    console.log('📏 Fetching size:', id);
    return this.get<SizeProduct>(`/api/sizes/${id}`);
  }

  async createSize(size: Omit<SizeProduct, 'id'>): Promise<SizeProduct> {
    console.log('📏 Creating size:', size);
    return this.post<SizeProduct>('/api/sizes', size);
  }

  async updateSize(id: string, size: Partial<SizeProduct>): Promise<SizeProduct> {
    console.log('📏 Updating size:', { id, size });
    return this.patch<SizeProduct>(`/api/sizes/${id}`, size);
  }

  async updateSizeStatus(id: string, estatus: boolean): Promise<SizeProduct> {
    console.log('📏 Updating size status:', { id, estatus });
    return this.patch<SizeProduct>(`/api/sizes/${id}`, { estatus });
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    console.log('📋 Fetching orders');
    const response = await this.get<PaginatedOrdersResponse>('/api/pedidos?estatus=ALL&pageSize=100');
    
    // Handle the correct response structure
    if (response && Array.isArray(response.pedidos)) {
      console.log('📋 Orders found:', response.pedidos.length, 'Total:', response.total);
      return response.pedidos;
    } else {
      console.warn('📋 Unexpected orders response structure:', response);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order> {
    console.log('📋 Fetching order:', id);
    return this.get<Order>(`/api/pedidos/${id}`);
  }

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    console.log('📋 Creating order:', order);
    return this.post<Order>('/api/pedidos', order);
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    console.log('📋 Updating order:', { id, order });
    return this.patch<Order>(`/api/pedidos/${id}`, order);
  }
}

export const apiService = new ApiService(); 