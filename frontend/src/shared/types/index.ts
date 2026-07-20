export type ProductCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'accessories';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  sizes: string[];
  inStock: boolean;
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
  data: T;
  error?: string;
}
