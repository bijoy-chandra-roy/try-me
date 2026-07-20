import { AppError } from '@/server/lib/errors';
import type { SessionUser } from '@/server/lib/auth-guard';
import { hasPermission } from '@/shared/auth/permissions';
import { reviewRepository } from '@/server/features/reviews/review.repository';
import {
  productRepository,
  type ProductFilters,
  type ProductRecord,
  type CreateProductInput,
} from './product.repository';

export type ProductWithReviews = ProductRecord & {
  averageRating: number;
  reviewCount: number;
};

class ProductService {
  private async withReviewStats(products: ProductRecord[]): Promise<ProductWithReviews[]> {
    const stats = await reviewRepository.getStatsForProducts(products.map((p) => p._id));
    return products.map((p) => {
      const s = stats.get(p._id);
      return {
        ...p,
        averageRating: s?.averageRating ?? 0,
        reviewCount: s?.reviewCount ?? 0,
      };
    });
  }

  async getProducts(filters: ProductFilters): Promise<ProductWithReviews[]> {
    const products = await productRepository.findAll(filters);
    return this.withReviewStats(products);
  }

  async getProductById(id: string): Promise<ProductWithReviews> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    const [enriched] = await this.withReviewStats([product]);
    return enriched;
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
