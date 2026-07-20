import type { UserRole } from '@/shared/auth/roles';

export type { UserRole };

export type ProductCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'accessories';

export interface ProductCustomField {
  /** Optional heading; empty means options display like sizes */
  label: string;
  options: string[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  sizes: string[];
  customFields: ProductCustomField[];
  inStock: boolean;
  stockQuantity: number;
  merchantId?: string | null;
  averageRating?: number;
  reviewCount?: number;
}

export interface TryOnResult {
  compositeImageUrl: string;
  userImageUrl: string;
  productImageUrl: string;
  productName: string;
  source: 'vto-api' | 'fallback-cache';
  fromFallback: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type UserStatus = 'active' | 'inactive';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  merchantId?: string | null;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Merchant {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

export interface TryOnHistory {
  _id: string;
  userId?: string | null;
  productId: string;
  productName: string;
  compositeImageUrl: string;
  userImageUrl: string;
  productImageUrl: string;
  source: 'vto-api' | 'fallback-cache';
  fromFallback: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalMerchants: number;
  totalTryOns: number;
  totalOrders: number;
  totalRevenue: number;
  recentTryOns: TryOnHistory[];
}

export interface MerchantStats {
  productCount: number;
  tryOnCount: number;
  inStockCount: number;
  lowStockCount: number;
  orderCount: number;
  unitsSold: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentProviderName = 'cod' | 'stripe';

export interface ShippingAddress {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Address extends ShippingAddress {
  _id: string;
  userId: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  merchantId?: string | null;
  name: string;
  imageUrl: string;
  price: number;
  size?: string;
  customSelections?: Record<string, string>;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  merchantId?: string | null;
  name: string;
  imageUrl: string;
  price: number;
  size?: string;
  customSelections?: Record<string, string>;
  quantity: number;
  merchantStatus: OrderStatus;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProviderName;
  paymentExternalId?: string;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  userName?: string;
  createdAt: string;
  updatedAt?: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];
