import type { ProductCategory } from '@/shared/types';
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
  sizes: string[];
  inStock: boolean;
  merchantId?: string | null;
};

class ProductRepository {
  private toRecord(doc: ProductDocument | Record<string, unknown>): ProductRecord {
    const d = doc as ProductDocument;
    return {
      _id: String(d._id),
      name: d.name,
      description: d.description,
      price: d.price,
      category: d.category,
      imageUrl: d.imageUrl,
      sizes: d.sizes,
      inStock: d.inStock,
      merchantId: d.merchantId ? String(d.merchantId) : null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
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
    const product = await Product.create(data);
    return this.toRecord(product);
  }

  async update(id: string, data: Partial<CreateProductInput>): Promise<ProductRecord | null> {
    const product = await Product.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!product) return null;
    return this.toRecord(product as unknown as ProductDocument);
  }

  async delete(id: string): Promise<boolean> {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }

  async insertMany(
    products: {
      name: string;
      description: string;
      price: number;
      category: ProductCategory;
      imageUrl: string;
      sizes: string[];
      inStock: boolean;
      merchantId?: string | null;
    }[]
  ) {
    return Product.insertMany(products);
  }

  async deleteAll() {
    return Product.deleteMany({});
  }

  async count(filters?: { merchantId?: string }): Promise<number> {
    const query: Record<string, unknown> = {};
    if (filters?.merchantId) query.merchantId = filters.merchantId;
    return Product.countDocuments(query);
  }
}

export const productRepository = new ProductRepository();
