import { apiService } from '@/services/api';
import { Order, Product, RegisterForm, SizeProduct } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: async ({ email, password }: RegisterForm) => {
      return apiService.login(email, password);
    },
    retry: false, // No retry for auth errors
    onError: (error:AxiosError) => {
        if (error.status === 500 || error.message.includes('Network Error'))
            throw new Error('Servicio no disponible');

        throw new Error('Credenciales incorrectas');
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async ({ email, password }: RegisterForm) => {
      return apiService.register(email, password);
    },
    retry: false, // No retry for auth errors
    onError: (error) => {
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      return apiService.logout();
    },
    retry: false, // No retry for logout
    onError: (error) => {
    },
  });
};

// Product hooks
export const useProducts = (estatus?: boolean) => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      return apiService.getProducts(estatus);
    },
    retry: false, // No retry for any errors
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      return apiService.getProduct(id);
    },
    retry: false, // No retry for any errors
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      return apiService.createProduct(product);
    },
    retry: false, // No retry for mutations
    onError: (error) => {
    },
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async ({ id, product }: { id: string; product: Partial<Product> }) => {
      return apiService.updateProduct(id, product);
    },
    retry: false,
    onError: (error) => {
    },
  });
};

export const useUpdateProductStatus = () => {
  return useMutation({
    mutationFn: async ({ id, estatus }: { id: string; estatus: boolean }) => {
      return apiService.updateProductStatus(id, estatus);
    },
    retry: false,
    onError: (error) => {
    },
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.deleteProduct(id);
    },
    retry: false,
    onError: (error) => {
    },
  });
};

// Size hooks
export const useSizes = (estatus?: boolean) => {
  return useQuery({
    queryKey: ['sizes'],
    queryFn: async () => {
      return apiService.getSizes(estatus);
    },
    retry: false, // No retry for any errors
  });
};

export const useSize = (id: string) => {
  return useQuery({
    queryKey: ['size', id],
    queryFn: async () => {
      return apiService.getSize(id);
    },
    retry: false, // No retry for any errors
    enabled: !!id,
  });
};

export const useCreateSize = () => {
  return useMutation({
    mutationFn: async (size: Omit<SizeProduct, 'id'>) => {
      return apiService.createSize(size);
    },
    retry: false,
    onError: (error) => {
    },
  });
};

export const useUpdateSize = () => {
  return useMutation({
    mutationFn: async ({ id, size }: { id: string; size: Partial<SizeProduct> }) => {
      return apiService.updateSize(id, size);
    },
    retry: false,
    onError: (error) => {
    },
  });
};

export const useUpdateSizeStatus = () => {
  return useMutation({
    mutationFn: async ({ id, estatus }: { id: string; estatus: boolean }) => {
      return apiService.updateSizeStatus(id, estatus);
    },
    retry: false,
    onError: (error) => {
    },
  });
};

export const useDeleteSize = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      return apiService.deleteSize(id);
    },
    retry: false,
    onError: (error) => {
    },
  });
};

// Order hooks
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      return apiService.getOrders();
    },
    retry: false, // No retry for any errors
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      return apiService.getOrder(id);
    },
    retry: false, // No retry for any errors
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<Order, 'id'>) => {
      return apiService.createOrder(order);
    },
    retry: false,
    onError: (error) => {
    },
    onSuccess: () => {
      // Invalidate and refetch orders query to update the list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, order }: { id: string; order: Partial<Order> }) => {
      return apiService.updateOrder(id, order);
    },
    retry: false,
    onError: (error) => {
    },
    onSuccess: () => {
      // Invalidate and refetch orders query to update the list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}; 