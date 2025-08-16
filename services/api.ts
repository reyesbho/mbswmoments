import { APP_CONFIG, getCurrentConfig } from '@/constants/Config';
import { ApiError, AuthResponse, Order, PaginatedOrdersResponse, Product, RegisterResponse, SizeProduct } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private baseURL = APP_CONFIG.api.baseURL;
  private onUnauthorized?: () => void;
  private tokenKey = APP_CONFIG.storage.tokenKey;

  constructor() {
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: APP_CONFIG.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Log request in development
        if (getCurrentConfig().LOG_REQUESTS) {
          console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        }

        if (config.url?.includes('/user/login') || config.url?.includes('/user/register')) {
          return config;
        }
        // Add token from storage if available
        const token = await this.getTokenFromStorage();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      async (response: AxiosResponse) => {
        // Log response in development
        if (getCurrentConfig().LOG_RESPONSES) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }

        // Store token if provided in response
        if (response.data && response.data.token) {
          await this.setTokenInStorage(response.data.token);
        }
        
        return response;
      },
      async (error) => {
        if (error.response?.status === 401
           && !(error.config?.url?.includes('/user/login') || error.config?.url?.includes('/user/register'))
        ) {
          // Clear token on unauthorized
          await this.clearTokenFromStorage();
          
          // Always call unauthorized callback for 401 errors
          // The AuthContext will handle whether to redirect or not
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
          
          // Don't retry 401 errors, just redirect
          return Promise.reject(new Error('Unauthorized - Please login again'));
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
      return null;
    }
  }

  private async setTokenInStorage(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Error setting token in storage:', error);
    }
  }

  private async clearTokenFromStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.tokenKey);
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
      
      const response = await this.api.request<T>(config);
      return response.data;
    } catch (error: any) {
      
      // If it's a 401 error, don't retry, just throw the error
      if (error.response?.status === 401) {
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
    const response = await this.post<RegisterResponse>('/user/register', { email, password });
    
    // Store token if provided in response
    if (response.token) {
      await this.setTokenInStorage(response.token);
    }
    
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/user/login', { email, password });
    
    // Store token if provided in response
    if (response.token) {
      await this.setTokenInStorage(response.token);
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>('/user/logout');
    
    // Clear token on logout
    await this.clearTokenFromStorage();
    
    return response;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return this.get<Product[]>('/api/products');
  }

  async getProduct(id: string): Promise<Product> {
    return this.get<Product>(`/api/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return this.post<Product>('/api/products', product);
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.patch<Product>(`/api/products/${id}`, { estatus: product.estatus });
  }

  async updateProductStatus(id: string, estatus: boolean): Promise<Product> {
    return this.patch<Product>(`/api/products/${id}`, { estatus });
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/api/products/${id}`);
  }

  // Size methods
  async getSizes(): Promise<SizeProduct[]> {
    return this.get<SizeProduct[]>('/api/sizes');
  }

  async getSize(id: string): Promise<SizeProduct> {
    return this.get<SizeProduct>(`/api/sizes/${id}`);
  }

  async createSize(size: Omit<SizeProduct, 'id'>): Promise<SizeProduct> {
    return this.post<SizeProduct>('/api/sizes', size);
  }

  async updateSize(id: string, size: Partial<SizeProduct>): Promise<SizeProduct> {
    return this.patch<SizeProduct>(`/api/sizes/${id}`, size);
  }

  async updateSizeStatus(id: string, estatus: boolean): Promise<SizeProduct> {
    return this.patch<SizeProduct>(`/api/sizes/${id}`, { estatus });
  }

  async deleteSize(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/api/sizes/${id}`);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    const response = await this.get<PaginatedOrdersResponse>('/api/pedidos?estatus=ALL&pageSize=100');
    
    // Handle the correct response structure
    if (response && Array.isArray(response.pedidos)) {
      return response.pedidos;
    } else {
      return [];
    }
  }

  async getOrder(id: string): Promise<Order> {
    return this.get<Order>(`/api/pedidos/${id}`);
  }

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    return this.post<Order>('/api/pedidos', order);
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    return this.patch<Order>(`/api/pedidos/${id}`, order);
  }
}

export const apiService = new ApiService(); 