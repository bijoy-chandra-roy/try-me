import { AppError } from '@/server/lib/errors';
import { ensureDbConnection } from '@/server/db/connection';
import { cartService } from '@/server/features/cart/cart.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

function serializeCart(cart: Awaited<ReturnType<typeof cartService.getCart>>) {
  return {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items,
    updatedAt: cart.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function GET() {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_cart');
    const cart = await cartService.getCart(user.id);
    return jsonSuccess(serializeCart(cart));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_cart');
    const body = await request.json();
    const cart = await cartService.addItem(user.id, body);
    return jsonSuccess(serializeCart(cart), 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_cart');
    const body = await request.json();
    const cart = await cartService.updateQuantity(
      user.id,
      body.productId,
      Number(body.quantity),
      body.size,
      body.customSelections
    );
    return jsonSuccess(serializeCart(cart));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_cart');
    const { searchParams } = new URL(request.url);
    const clear = searchParams.get('clear') === 'true';

    if (clear) {
      const cart = await cartService.clear(user.id);
      return jsonSuccess(serializeCart(cart));
    }

    const productId = searchParams.get('productId');
    if (!productId) {
      const body = await request.json().catch(() => ({}));
      if (body.clear) {
        const cart = await cartService.clear(user.id);
        return jsonSuccess(serializeCart(cart));
      }
      if (!body.productId) {
        throw new AppError('productId is required', 400);
      }
      const cart = await cartService.removeItem(
        user.id,
        body.productId,
        body.size,
        body.customSelections
      );
      return jsonSuccess(serializeCart(cart));
    }

    let customSelections: Record<string, string> | undefined;
    const customRaw = searchParams.get('customSelections');
    if (customRaw) {
      try {
        customSelections = JSON.parse(customRaw);
      } catch {
        customSelections = undefined;
      }
    }

    const cart = await cartService.removeItem(
      user.id,
      productId,
      searchParams.get('size') || undefined,
      customSelections
    );
    return jsonSuccess(serializeCart(cart));
  } catch (error) {
    return jsonError(error);
  }
}
