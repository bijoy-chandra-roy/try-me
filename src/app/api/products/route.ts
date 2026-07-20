import type { NextRequest } from 'next/server';
import type { ProductCategory } from '@/shared/types';
import { ensureDbConnection } from '@/server/db/connection';
import { productService } from '@/server/features/products/product.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await ensureDbConnection();

    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category') as ProductCategory | null;
    const inStockParam = searchParams.get('inStock');

    const filters: { category?: ProductCategory; inStock?: boolean } = {};
    if (category) filters.category = category;
    if (inStockParam !== null) filters.inStock = inStockParam === 'true';

    const products = await productService.getProducts(filters);
    return jsonSuccess(products);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbConnection();
    const user = await requirePermission('manage_products');

    const body = await request.json();
    const product = await productService.createProduct(user, body);
    return jsonSuccess(product, 201);
  } catch (error) {
    return jsonError(error);
  }
}
