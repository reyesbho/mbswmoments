// Core interfaces for the pastry shop order management system

export interface User {
  uid: string;
  email: string;
  token?: string; // Optional token for compatibility
}

export interface Product {
  id: string;
  descripcion: string;
  imagen?: string;
  estatus: boolean;
  tag?: string;
}

export interface SizeProduct {
  id: string;
  descripcion: string;
  estatus: boolean;
  tags?: string[];
}

export interface OrderProduct {
  cantidad: number;
  size: {
    id: string;
    descripcion: string;
  };
  producto: {
    id: string;
    descripcion: string;
    imagen?: string;
  };
  caracteristicas?: string[];
  precio: number;
}

export interface Order {
  id: string;
  fechaEntrega: {
    seconds: number;
    nanoseconds: number;
  };
  lugarEntrega?: string;
  cliente: string;
  productos: OrderProduct[];
}

export interface AuthResponse {
  token: string;
}

export interface RegisterResponse {
  uid: string;
  email: string;
  token?: string; // Optional token for compatibility
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
}

export interface PaginatedOrdersResponse {
  pedidos: Order[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

// Form interfaces
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateProductForm {
  descripcion: string;
  imagen?: string;
  estatus: boolean;
  tag?: string;
}

export interface CreateSizeForm {
  descripcion: string;
  estatus: boolean;
  tags?: string[];
}

export interface CreateOrderForm {
  fechaEntrega: Date;
  lugarEntrega?: string;
  cliente: string;
  productos: OrderProduct[];
} 