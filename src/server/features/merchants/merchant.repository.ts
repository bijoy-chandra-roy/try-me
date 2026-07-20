import { Merchant, type MerchantDocument } from './merchant.model';

export type MerchantRecord = Omit<MerchantDocument, '_id' | 'ownerId'> & {
  _id: string;
  ownerId: string;
};

class MerchantRepository {
  private toRecord(doc: MerchantDocument | Record<string, unknown>): MerchantRecord {
    const d = doc as MerchantDocument;
    return {
      _id: String(d._id),
      name: d.name,
      description: d.description,
      ownerId: String(d.ownerId),
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async findAll(): Promise<MerchantRecord[]> {
    const merchants = await Merchant.find().sort({ createdAt: -1 }).lean();
    return merchants.map((m) => this.toRecord(m as unknown as MerchantDocument));
  }

  async findById(id: string): Promise<MerchantRecord | null> {
    const merchant = await Merchant.findById(id).lean();
    if (!merchant) return null;
    return this.toRecord(merchant as unknown as MerchantDocument);
  }

  async findByOwnerId(ownerId: string): Promise<MerchantRecord | null> {
    const merchant = await Merchant.findOne({ ownerId }).lean();
    if (!merchant) return null;
    return this.toRecord(merchant as unknown as MerchantDocument);
  }

  async create(data: { name: string; description: string; ownerId: string; status?: 'pending' | 'approved' | 'suspended' }) {
    const merchant = await Merchant.create({
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
      status: data.status ?? 'approved',
    });
    return this.toRecord(merchant);
  }

  async update(
    id: string,
    data: Partial<{ name: string; description: string; status: 'pending' | 'approved' | 'suspended' }>
  ): Promise<MerchantRecord | null> {
    const merchant = await Merchant.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!merchant) return null;
    return this.toRecord(merchant as unknown as MerchantDocument);
  }

  async count(): Promise<number> {
    return Merchant.countDocuments();
  }
}

export const merchantRepository = new MerchantRepository();
