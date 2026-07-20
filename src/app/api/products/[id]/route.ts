import { ensureDbConnection } from '@/server/db/connection';
import { productService } from '@/server/features/products/product.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const { id } = await context.params;
    const product = await productService.getProductById(id);
    return jsonSuccess(product);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_products');
    const { id } = await context.params;
    const body = await request.json();
    const product = await productService.updateProduct(user, id, body);
    return jsonSuccess(product);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_products');
    const { id } = await context.params;
    await productService.deleteProduct(user, id);
    return jsonSuccess({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
