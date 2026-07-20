import type { ProductCategory, ProductCustomField } from '@/shared/types';
import { Product, type ProductDocument } from './product.model';

export interface ProductFilters {
  category?: ProductCategory;
  inStock?: boolean;
  merchantId?: string;
}

export type ProductRecord = Omit<ProductDocument, '_id' | 'merchantId'> & {
  _id: string;
  merchantId?: string | null;
};

export type CreateProductInput = {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  sizes?: string[];
  customFields?: ProductCustomField[];
  inStock?: boolean;
  stockQuantity?: number;
  merchantId?: string | null;
};

function normalizeSizes(sizes?: string[] | null): string[] {
  if (!Array.isArray(sizes)) return [];
  return sizes.map((s) => String(s).trim()).filter(Boolean);
}

/** Accepts current { label, options } and legacy { label, value }. */
function normalizeCustomFields(
  fields?: Array<Partial<ProductCustomField> & { value?: string }> | null
): ProductCustomField[] {
  if (!Array.isArray(fields)) return [];

  return fields
    .map((f) => {
      const fromOptions = Array.isArray(f?.options)
        ? f.options.map((o) => String(o).trim()).filter(Boolean)
        : [];
      const fromLegacyValue =
        typeof f?.value === 'string' && f.value.trim() ? [f.value.trim()] : [];

      return {
        label: String(f?.label ?? '').trim(),
        options: fromOptions.length > 0 ? fromOptions : fromLegacyValue,
      };
    })
    .filter((f) => f.options.length > 0);
}

function resolveStock(data: {
  stockQuantity?: number;
  inStock?: boolean;
}): { stockQuantity: number; inStock: boolean } {
  if (typeof data.stockQuantity === 'number' && !Number.isNaN(data.stockQuantity)) {
    const stockQuantity = Math.max(0, Math.floor(data.stockQuantity));
    return { stockQuantity, inStock: stockQuantity > 0 };
  }
  if (typeof data.inStock === 'boolean') {
    const stockQuantity = data.inStock ? 10 : 0;
    return { stockQuantity, inStock: stockQuantity > 0 };
  }
  return { stockQuantity: 0, inStock: false };
}

class ProductRepository {
  private toRecord(doc: ProductDocument | Record<string, unknown>): ProductRecord {
    const d = doc as ProductDocument;
    const stockQuantity =
      typeof d.stockQuantity === 'number'
        ? d.stockQuantity
        : d.inStock
          ? 10
          : 0;
    return {
      _id: String(d._id),
      name: d.name,
      description: d.description,
      price: d.price,
      category: d.category,
      imageUrl: d.imageUrl,
      sizes: normalizeSizes(d.sizes),
      customFields: normalizeCustomFields(d.customFields),
      stockQuantity,
      inStock: stockQuantity > 0,
      merchantId: d.merchantId ? String(d.merchantId) : null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  private prepareInput(data: CreateProductInput | Partial<CreateProductInput>) {
    const prepared: Partial<CreateProductInput> = { ...data };
    if ('sizes' in data) {
      prepared.sizes = normalizeSizes(data.sizes);
    }
    if ('customFields' in data) {
      prepared.customFields = normalizeCustomFields(data.customFields);
    }
    if ('stockQuantity' in data || 'inStock' in data) {
      const stock = resolveStock(data);
      prepared.stockQuantity = stock.stockQuantity;
      prepared.inStock = stock.inStock;
    }
    return prepared;
  }

  async findAll(filters: ProductFilters = {}): Promise<ProductRecord[]> {
    const query: Record<string, unknown> = {};
    if (filters.category) query.category = filters.category;
    if (filters.inStock !== undefined) query.inStock = filters.inStock;
    if (filters.merchantId) query.merchantId = filters.merchantId;
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    return products.map((p) => this.toRecord(p as unknown as ProductDocument));
  }

  async findById(id: string): Promise<ProductRecord | null> {
    const product = await Product.findById(id).lean();
    if (!product) return null;
    return this.toRecord(product as unknown as ProductDocument);
  }

  async create(data: CreateProductInput): Promise<ProductRecord> {
    const stock = resolveStock(data);
    const prepared = this.prepareInput({
      ...data,
      sizes: data.sizes ?? [],
      customFields: data.customFields ?? [],
      stockQuantity: stock.stockQuantity,
      inStock: stock.inStock,
    }) as CreateProductInput;
    const product = await Product.create(prepared);
    return this.toRecord(product);
  }

  async update(id: string, data: Partial<CreateProductInput>): Promise<ProductRecord | null> {
    const product = await Product.findByIdAndUpdate(id, this.prepareInput(data), {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) return null;
    return this.toRecord(product as unknown as ProductDocument);
  }

  async decrementStock(id: string, quantity: number): Promise<ProductRecord | null> {
    const product = await Product.findOneAndUpdate(
      { _id: id, stockQuantity: { $gte: quantity } },
      [
        {
          $set: {
            stockQuantity: { $subtract: ['$stockQuantity', quantity] },
            inStock: { $gt: [{ $subtract: ['$stockQuantity', quantity] }, 0] },
          },
        },
      ],
      { new: true }
    ).lean();
    if (!product) return null;
    return this.toRecord(product as unknown as ProductDocument);
  }

  async incrementStock(id: string, quantity: number): Promise<ProductRecord | null> {
    const product = await Product.findByIdAndUpdate(
      id,
      [
        {
          $set: {
            stockQuantity: { $add: ['$stockQuantity', quantity] },
            inStock: true,
          },
        },
      ],
      { new: true }
    ).lean();
    if (!product) return null;
    return this.toRecord(product as unknown as ProductDocument);
  }

  async delete(id: string): Promise<boolean> {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }

  async insertMany(products: CreateProductInput[]) {
    return Product.insertMany(
      products.map((p) => {
        const stock = resolveStock(p);
        return {
          ...p,
          sizes: normalizeSizes(p.sizes),
          customFields: normalizeCustomFields(p.customFields),
          stockQuantity: stock.stockQuantity,
          inStock: stock.inStock,
        };
      })
    );
  }

  async deleteAll() {
    return Product.deleteMany({});
  }

  async count(filters?: { merchantId?: string }): Promise<number> {
    const query: Record<string, unknown> = {};
    if (filters?.merchantId) query.merchantId = filters.merchantId;
    return Product.countDocuments(query);
  }

  /** Backfill stockQuantity for legacy documents that only have inStock. */
  async migrateStockQuantities(): Promise<number> {
    const missing = await Product.updateMany(
      { $or: [{ stockQuantity: { $exists: false } }, { stockQuantity: null }] },
      [
        {
          $set: {
            stockQuantity: {
              $cond: [{ $eq: ['$inStock', true] }, 10, 0],
            },
          },
        },
      ]
    );
    await Product.updateMany({}, [
      {
        $set: {
          inStock: { $gt: ['$stockQuantity', 0] },
        },
      },
    ]);
    return missing.modifiedCount;
  }
}

export const productRepository = new ProductRepository();
