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
  merchantId?: string | null;
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
  recentTryOns: TryOnHistory[];
}

export interface MerchantStats {
  productCount: number;
  tryOnCount: number;
  inStockCount: number;
}
