import { AppError } from '@/server/lib/errors';
import type { SessionUser } from '@/server/lib/auth-guard';
import { hasPermission } from '@/shared/auth/permissions';
import type {
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ShippingAddress,
} from '@/shared/types';
import { ORDER_STATUS_FLOW } from '@/shared/types';
import { addressRepository } from '@/server/features/addresses/address.repository';
import { cartService } from '@/server/features/cart/cart.service';
import { productRepository } from '@/server/features/products/product.repository';
import { getPaymentProvider } from '@/server/features/payments/payment.provider';
import { orderRepository, type OrderRecord } from './order.repository';

function generateOrderNumber(): string {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TM-${now}-${rand}`;
}

function aggregateOrderStatus(items: OrderItem[]): OrderStatus {
  if (items.every((i) => i.merchantStatus === 'cancelled')) return 'cancelled';
  const active = items.filter((i) => i.merchantStatus !== 'cancelled');
  if (active.length === 0) return 'cancelled';
  if (active.every((i) => i.merchantStatus === 'delivered')) return 'delivered';
  if (active.every((i) => i.merchantStatus === 'shipped' || i.merchantStatus === 'delivered')) {
    return 'shipped';
  }
  if (active.some((i) => i.merchantStatus === 'processing' || i.merchantStatus === 'shipped' || i.merchantStatus === 'delivered')) {
    return 'processing';
  }
  if (active.every((i) => i.merchantStatus === 'confirmed' || ORDER_STATUS_FLOW.indexOf(i.merchantStatus) > 1)) {
    return 'confirmed';
  }
  return 'pending';
}

function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}

function canAdvance(from: OrderStatus, to: OrderStatus): boolean {
  if (to === 'cancelled') return from === 'pending' || from === 'confirmed';
  const fromIdx = ORDER_STATUS_FLOW.indexOf(from);
  const toIdx = ORDER_STATUS_FLOW.indexOf(to);
  return fromIdx >= 0 && toIdx === fromIdx + 1;
}

function serializeOrder(order: OrderRecord) {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

/** Merchants need fulfillment location but not full customer contact details. */
function redactShippingForMerchant(address: ShippingAddress): ShippingAddress {
  return {
    label: address.label,
    fullName: address.fullName,
    phone: '',
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };
}

function serializeOrderForMerchant(order: OrderRecord, merchantId: string) {
  return serializeOrder({
    ...order,
    shippingAddress: redactShippingForMerchant(order.shippingAddress),
    items: order.items.filter((i) => i.merchantId === merchantId),
  });
}

class OrderService {
  async checkout(
    user: SessionUser,
    input: { addressId?: string; shippingAddress?: ShippingAddress }
  ) {
    const cart = await cartService.getCart(user.id);
    if (!cart.items.length) {
      throw new AppError('Cart is empty', 400);
    }

    let shippingAddress: ShippingAddress;
    if (input.addressId) {
      const address = await addressRepository.findById(input.addressId);
      if (!address || address.userId !== user.id) {
        throw new AppError('Address not found', 404);
      }
      shippingAddress = {
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };
    } else if (input.shippingAddress) {
      const a = input.shippingAddress;
      for (const key of ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode', 'country'] as const) {
        if (!a[key]?.trim()) throw new AppError(`${key} is required`, 400);
      }
      shippingAddress = a;
    } else {
      throw new AppError('Shipping address is required', 400);
    }

    const decremented: { productId: string; quantity: number }[] = [];
    try {
      for (const item of cart.items) {
        const updated = await productRepository.decrementStock(item.productId, item.quantity);
        if (!updated) {
          throw new AppError(
            `Insufficient stock for "${item.name}"`,
            400
          );
        }
        decremented.push({ productId: item.productId, quantity: item.quantity });
      }

      const orderItems: OrderItem[] = cart.items.map((item) => ({
        productId: item.productId,
        merchantId: item.merchantId ?? null,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        size: item.size,
        customSelections: item.customSelections ?? {},
        quantity: item.quantity,
        merchantStatus: 'pending' as OrderStatus,
      }));

      const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const total = subtotal;
      const orderNumber = generateOrderNumber();

      const order = await orderRepository.create({
        userId: user.id,
        orderNumber,
        status: 'pending',
        items: orderItems,
        shippingAddress,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        paymentProvider: 'cod',
        subtotal,
        total,
      });

      const payment = await getPaymentProvider().createPayment({
        orderId: order._id,
        amount: total,
        currency: 'usd',
      });

      const finalized = await orderRepository.update(order._id, {
        paymentStatus: payment.status,
        paymentProvider: payment.provider,
        paymentExternalId: payment.externalId,
      });

      await cartService.clear(user.id);
      return serializeOrder(finalized ?? order);
    } catch (error) {
      for (const d of decremented) {
        await productRepository.incrementStock(d.productId, d.quantity);
      }
      throw error;
    }
  }

  async listForUser(user: SessionUser, query?: { orderNumber?: string; userId?: string }) {
    if (hasPermission(user.role, 'view_all_orders')) {
      if (query?.orderNumber || query?.userId) {
        return (await orderRepository.search(query)).map(serializeOrder);
      }
      return (await orderRepository.findAll()).map(serializeOrder);
    }

    if (hasPermission(user.role, 'fulfill_orders') && user.merchantId) {
      const orders = await orderRepository.findByMerchant(user.merchantId);
      return orders.map((order) => serializeOrderForMerchant(order, user.merchantId!));
    }

    if (!hasPermission(user.role, 'view_own_orders')) {
      throw new AppError('Forbidden', 403);
    }
    return (await orderRepository.findByUser(user.id)).map(serializeOrder);
  }

  async getById(user: SessionUser, id: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    if (hasPermission(user.role, 'view_all_orders')) {
      return serializeOrder(order);
    }

    if (hasPermission(user.role, 'fulfill_orders') && user.merchantId) {
      const hasItems = order.items.some((i) => i.merchantId === user.merchantId);
      if (!hasItems) throw new AppError('Order not found', 404);
      return serializeOrderForMerchant(order, user.merchantId);
    }

    if (order.userId !== user.id) throw new AppError('Order not found', 404);
    return serializeOrder(order);
  }

  async updateStatus(
    user: SessionUser,
    id: string,
    input: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      advance?: boolean;
    }
  ) {
    const order = await orderRepository.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    // Customer cancel
    if (
      input.status === 'cancelled' &&
      order.userId === user.id &&
      !hasPermission(user.role, 'view_all_orders')
    ) {
      if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw new AppError('Order can no longer be cancelled', 400);
      }
      const items = order.items.map((i) => ({ ...i, merchantStatus: 'cancelled' as OrderStatus }));
      await this.restock(order.items);
      const updated = await orderRepository.update(id, {
        status: 'cancelled',
        items,
      });
      return serializeOrder(updated!);
    }

    // Support/admin full control
    if (hasPermission(user.role, 'view_all_orders')) {
      let items = order.items;
      let status = order.status;

      if (input.status) {
        if (input.status === 'cancelled' && order.status !== 'cancelled') {
          await this.restock(order.items);
          items = items.map((i) => ({ ...i, merchantStatus: 'cancelled' as OrderStatus }));
        } else if (input.status !== 'cancelled') {
          items = items.map((i) =>
            i.merchantStatus === 'cancelled'
              ? i
              : { ...i, merchantStatus: input.status as OrderStatus }
          );
        }
        status = input.status;
      } else if (input.advance) {
        const next = nextStatus(order.status);
        if (!next) throw new AppError('Order cannot be advanced further', 400);
        items = items.map((i) =>
          i.merchantStatus === 'cancelled' ? i : { ...i, merchantStatus: next }
        );
        status = next;
      }

      const patch: Partial<OrderRecord> = { status, items };
      if (input.paymentStatus) patch.paymentStatus = input.paymentStatus;
      if (status === 'delivered' && order.paymentMethod === 'cod' && !input.paymentStatus) {
        patch.paymentStatus = 'paid';
      }

      const updated = await orderRepository.update(id, patch);
      return serializeOrder(updated!);
    }

    // Merchant fulfillment
    if (hasPermission(user.role, 'fulfill_orders') && user.merchantId) {
      const merchantId = user.merchantId;
      const ownsItems = order.items.some((i) => i.merchantId === merchantId);
      if (!ownsItems) throw new AppError('Order not found', 404);

      const targetStatus =
        input.status ??
        (input.advance
          ? (() => {
              const merchantItems = order.items.filter((i) => i.merchantId === merchantId);
              const current = merchantItems[0]?.merchantStatus ?? 'pending';
              const next = nextStatus(current);
              if (!next) throw new AppError('Cannot advance further', 400);
              return next;
            })()
          : undefined);

      if (!targetStatus && !input.paymentStatus) {
        throw new AppError('status or advance is required', 400);
      }

      const items = order.items.map((item) => {
        if (item.merchantId !== merchantId) return item;
        if (!targetStatus) return item;
        if (!canAdvance(item.merchantStatus, targetStatus) && targetStatus !== item.merchantStatus) {
          throw new AppError(
            `Cannot move item from ${item.merchantStatus} to ${targetStatus}`,
            400
          );
        }
        return { ...item, merchantStatus: targetStatus };
      });

      const status = aggregateOrderStatus(items);
      const patch: Partial<OrderRecord> = { items, status };
      if (input.paymentStatus) patch.paymentStatus = input.paymentStatus;
      if (status === 'delivered' && order.paymentMethod === 'cod') {
        patch.paymentStatus = input.paymentStatus ?? 'paid';
      }

      const updated = await orderRepository.update(id, patch);
      return serializeOrderForMerchant(updated!, merchantId);
    }

    throw new AppError('Forbidden', 403);
  }

  private async restock(items: OrderItem[]) {
    for (const item of items) {
      if (item.merchantStatus === 'cancelled') continue;
      await productRepository.incrementStock(item.productId, item.quantity);
    }
  }

  async hasDeliveredPurchase(userId: string, productId: string): Promise<string | null> {
    const orders = await orderRepository.findByUser(userId);
    for (const order of orders) {
      if (order.status !== 'delivered') continue;
      const hit = order.items.find(
        (i) => i.productId === productId && i.merchantStatus === 'delivered'
      );
      if (hit) return order._id;
    }
    return null;
  }
}

export const orderService = new OrderService();
export { serializeOrder };
