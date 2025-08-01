import { apiService } from '@/services/api';
import { LoginForm, Order, Product, RegisterForm, SizeProduct } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: async ({ email, password }: LoginForm) => {
      console.log('🔑 Login mutation called:', { email });
      return apiService.login(email, password);
    },
    retry: false, // No retry for auth errors
    onError: (error) => {
      console.error('❌ Login failed:', error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async ({ email, password }: RegisterForm) => {
      console.log('👤 Register mutation called:', { email });
      return apiService.register(email, password);
    },
    retry: false, // No retry for auth errors
    onError: (error) => {
      console.error('❌ Registration failed:', error);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      console.log('🚪 Logout mutation called');
      return apiService.logout();
    },
    retry: false, // No retry for logout
    onError: (error) => {
      console.error('❌ Logout failed:', error);
    },
  });
};

// Product hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('📦 Fetching products...');
      return apiService.getProducts();
    },
    retry: false, // No retry for any errors
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      console.log('📦 Fetching product:', id);
      return apiService.getProduct(id);
    },
    retry: false, // No retry for any errors
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      console.log('📦 Creating product:', product);
      return apiService.createProduct(product);
    },
    retry: false, // No retry for mutations
    onError: (error) => {
      console.error('❌ Create product failed:', error);
    },
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async ({ id, product }: { id: string; product: Partial<Product> }) => {
      console.log('📦 Updating product:', { id, product });
      return apiService.updateProduct(id, product);
    },
    retry: false,
    onError: (error) => {
      console.error('❌ Update product failed:', error);
    },
  });
};

export const useUpdateProductStatus = () => {
  return useMutation({
    mutationFn: async ({ id, estatus }: { id: string; estatus: boolean }) => {
      console.log('📦 Updating product status:', { id, estatus });
      return apiService.updateProductStatus(id, estatus);
    },
    retry: false,
    onError: (error) => {
      console.error('❌ Update product status failed:', error);
    },
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('📦 Deleting product:', id);
      return apiService.deleteProduct(id);
    },
    retry: false,
    onError: (error) => {
      console.error('❌ Delete product failed:', error);
    },
  });
};

// Size hooks
export const useSizes = () => {
  return useQuery({
    queryKey: ['sizes'],
    queryFn: async () => {
      console.log('📏 Fetching sizes...');
      return apiService.getSizes();
    },
    retry: false, // No retry for any errors
  });
};

export const useSize = (id: string) => {
  return useQuery({
    queryKey: ['size', id],
    queryFn: async () => {
      console.log('📏 Fetching size:', id);
      return apiService.getSize(id);
    },
    retry: false, // No retry for any errors
    enabled: !!id,
  });
};

export const useCreateSize = () => {
  return useMutation({
    mutationFn: async (size: Omit<SizeProduct, 'id'>) => {
      console.log('📏 Creating size:', size);
      return apiService.createSize(size);
    },
    retry: false,
    onError: (error) => {
      console.error('❌ Create size failed:', error);
    },
  });
};

export const useUpdateSize = () => {
  return useMutation({
    mutationFn: async ({ id, size }: { id: string; size: Partial<SizeProduct> }) => {
      console.log('📏 Updating size:', { id, size });
      return apiService.updateSize(id, size);
    },
    retry: false,
    onError: (error) => {
      console.error('❌ Update size failed:', error);
    },
  });
};

export const useUpdateSizeStatus = () => {
  return useMutation({
    mutationFn: async ({ id, estatus }: { id: string; estatus: boolean }) => {
      console.log('📏 Updating size status:', { id, estatus });
      return apiService.updateSizeStatus(id, estatus);
    },
    retry: false,
    onError: (error) => {
      console.error('❌ Update size status failed:', error);
    },
  });
};

// Order hooks
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      console.log('📋 Fetching orders...');
      return apiService.getOrders();
    },
    retry: false, // No retry for any errors
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      console.log('📋 Fetching order:', id);
      return apiService.getOrder(id);
    },
    retry: false, // No retry for any errors
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (order: Omit<Order, 'id'>) => {
      console.log('📋 Creating order:', order);
      return apiService.createOrder(order);
    },
    retry: false,
    onError: (error) => {
      console.error('❌ Create order failed:', error);
    },
  });
};

export const useUpdateOrder = () => {
  return useMutation({
    mutationFn: async ({ id, order }: { id: string; order: Partial<Order> }) => {
      console.log('📋 Updating order:', { id, order });
      return apiService.updateOrder(id, order);
    },
    retry: false,
    onError: (error) => {
      console.error('❌ Update order failed:', error);
    },
  });
}; 