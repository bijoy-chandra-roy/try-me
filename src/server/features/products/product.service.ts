import { AppError } from '@/server/lib/errors';
import type { SessionUser } from '@/server/lib/auth-guard';
import { hasPermission } from '@/shared/auth/permissions';
import {
  productRepository,
  type ProductFilters,
  type ProductRecord,
  type CreateProductInput,
} from './product.repository';

class ProductService {
  async getProducts(filters: ProductFilters): Promise<ProductRecord[]> {
    return productRepository.findAll(filters);
  }

  async getProductById(id: string): Promise<ProductRecord> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async getMerchantProducts(merchantId: string): Promise<ProductRecord[]> {
    return productRepository.findAll({ merchantId });
  }

  private canManageProduct(user: SessionUser, product: ProductRecord): boolean {
    if (user.role === 'admin' || user.role === 'super_admin') return true;
    if (user.role === 'merchant' && product.merchantId === user.merchantId) return true;
    return false;
  }

  async createProduct(user: SessionUser, data: CreateProductInput): Promise<ProductRecord> {
    if (!hasPermission(user.role, 'manage_products')) {
      throw new AppError('Forbidden', 403);
    }

    if (user.role === 'merchant') {
      if (!user.merchantId) {
        throw new AppError('Merchant profile not linked', 400);
      }
      data.merchantId = user.merchantId;
    }

    return productRepository.create(data);
  }

  async updateProduct(
    user: SessionUser,
    id: string,
    data: Partial<CreateProductInput>
  ): Promise<ProductRecord> {
    const product = await this.getProductById(id);
    if (!this.canManageProduct(user, product)) {
      throw new AppError('Forbidden', 403);
    }

    if (user.role === 'merchant') {
      delete data.merchantId;
    }

    const updated = await productRepository.update(id, data);
    if (!updated) throw new AppError('Product not found', 404);
    return updated;
  }

  async deleteProduct(user: SessionUser, id: string): Promise<void> {
    const product = await this.getProductById(id);
    if (!this.canManageProduct(user, product)) {
      throw new AppError('Forbidden', 403);
    }

    const deleted = await productRepository.delete(id);
    if (!deleted) throw new AppError('Product not found', 404);
  }
}

export const productService = new ProductService();
