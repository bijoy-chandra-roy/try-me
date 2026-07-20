import { AppError } from '@/server/lib/errors';
import type { CartItem } from '@/shared/types';
import { productRepository } from '@/server/features/products/product.repository';
import { cartRepository, type CartRecord } from './cart.repository';

export type AddToCartInput = {
  productId: string;
  quantity?: number;
  size?: string;
  customSelections?: Record<string, string>;
};

class CartService {
  async getCart(userId: string): Promise<CartRecord> {
    return cartRepository.getOrCreate(userId);
  }

  async addItem(userId: string, input: AddToCartInput): Promise<CartRecord> {
    const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
    const product = await productRepository.findById(input.productId);
    if (!product) throw new AppError('Product not found', 404);
    if (!product.inStock || product.stockQuantity < 1) {
      throw new AppError('Product is out of stock', 400);
    }

    if ((product.sizes?.length ?? 0) > 0 && !input.size) {
      throw new AppError('Please select a size', 400);
    }
    if (input.size && product.sizes.length > 0 && !product.sizes.includes(input.size)) {
      throw new AppError('Invalid size', 400);
    }

    const cart = await cartRepository.getOrCreate(userId);
    const newItem: CartItem = {
      productId: product._id,
      merchantId: product.merchantId ?? null,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      size: input.size,
      customSelections: input.customSelections ?? {},
      quantity,
    };

    const items = [...cart.items];
    const existingIndex = items.findIndex((item) =>
      cartRepository.sameLineItem(item, newItem)
    );

    if (existingIndex >= 0) {
      const nextQty = items[existingIndex].quantity + quantity;
      if (nextQty > product.stockQuantity) {
        throw new AppError(`Only ${product.stockQuantity} in stock`, 400);
      }
      items[existingIndex] = { ...items[existingIndex], quantity: nextQty, price: product.price };
    } else {
      if (quantity > product.stockQuantity) {
        throw new AppError(`Only ${product.stockQuantity} in stock`, 400);
      }
      items.push(newItem);
    }

    return cartRepository.saveItems(userId, items);
  }

  async updateQuantity(
    userId: string,
    productId: string,
    quantity: number,
    size?: string,
    customSelections?: Record<string, string>
  ): Promise<CartRecord> {
    const cart = await cartRepository.getOrCreate(userId);
    const match = { productId, size, customSelections: customSelections ?? {} };
    const index = cart.items.findIndex((item) => cartRepository.sameLineItem(item, match));
    if (index < 0) throw new AppError('Cart item not found', 404);

    if (quantity <= 0) {
      const items = cart.items.filter((_, i) => i !== index);
      return cartRepository.saveItems(userId, items);
    }

    const product = await productRepository.findById(productId);
    if (!product) throw new AppError('Product not found', 404);
    if (quantity > product.stockQuantity) {
      throw new AppError(`Only ${product.stockQuantity} in stock`, 400);
    }

    const items = [...cart.items];
    items[index] = { ...items[index], quantity: Math.floor(quantity), price: product.price };
    return cartRepository.saveItems(userId, items);
  }

  async removeItem(
    userId: string,
    productId: string,
    size?: string,
    customSelections?: Record<string, string>
  ): Promise<CartRecord> {
    const cart = await cartRepository.getOrCreate(userId);
    const match = { productId, size, customSelections: customSelections ?? {} };
    const items = cart.items.filter((item) => !cartRepository.sameLineItem(item, match));
    return cartRepository.saveItems(userId, items);
  }

  async clear(userId: string): Promise<CartRecord> {
    return cartRepository.clear(userId);
  }
}

export const cartService = new CartService();
