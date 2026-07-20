import { AppError } from '@/server/lib/errors';
import type { SessionUser } from '@/server/lib/auth-guard';
import { hasPermission } from '@/shared/auth/permissions';
import { orderService } from '@/server/features/orders/order.service';
import { reviewRepository, type ReviewRecord } from './review.repository';

function serialize(review: ReviewRecord) {
  return {
    ...review,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

class ReviewService {
  async listByProduct(productId: string) {
    const reviews = await reviewRepository.findByProduct(productId);
    return reviews.map(serialize);
  }

  async listByUser(userId: string) {
    const reviews = await reviewRepository.findByUser(userId);
    return reviews.map(serialize);
  }

  async create(
    user: SessionUser,
    productId: string,
    input: { rating: number; comment?: string; orderId?: string }
  ) {
    if (!hasPermission(user.role, 'manage_reviews')) {
      throw new AppError('Forbidden', 403);
    }

    const rating = Math.round(Number(input.rating));
    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const deliveredOrderId = await orderService.hasDeliveredPurchase(user.id, productId);
    if (!deliveredOrderId) {
      throw new AppError('You can only review products from delivered orders', 403);
    }
    const orderId = input.orderId || deliveredOrderId;
    if (input.orderId && input.orderId !== deliveredOrderId) {
      // Allow any delivered order that contains this product for this user
      const stillValid = await orderService.hasDeliveredPurchase(user.id, productId);
      if (!stillValid) {
        throw new AppError('You can only review products from delivered orders', 403);
      }
    }

    try {
      const review = await reviewRepository.create({
        userId: user.id,
        productId,
        orderId,
        rating,
        comment: (input.comment || '').trim(),
      });
      return serialize(review);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new AppError('You already reviewed this product for this order', 409);
      }
      throw error;
    }
  }

  async update(
    user: SessionUser,
    id: string,
    input: { rating?: number; comment?: string }
  ) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new AppError('Review not found', 404);

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (review.userId !== user.id && !isAdmin) {
      throw new AppError('Forbidden', 403);
    }

    const patch: { rating?: number; comment?: string } = {};
    if (input.rating !== undefined) {
      const rating = Math.round(Number(input.rating));
      if (rating < 1 || rating > 5) throw new AppError('Rating must be between 1 and 5', 400);
      patch.rating = rating;
    }
    if (input.comment !== undefined) patch.comment = input.comment.trim();

    const updated = await reviewRepository.update(id, patch);
    return serialize(updated!);
  }

  async remove(user: SessionUser, id: string) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new AppError('Review not found', 404);

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (review.userId !== user.id && !isAdmin) {
      throw new AppError('Forbidden', 403);
    }

    await reviewRepository.delete(id);
  }
}

export const reviewService = new ReviewService();
