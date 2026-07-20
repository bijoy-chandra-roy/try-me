import { Address, type AddressDocument } from './address.model';

export type AddressRecord = {
  _id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAddressInput = {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
};

class AddressRepository {
  private toRecord(doc: AddressDocument): AddressRecord {
    return {
      _id: String(doc._id),
      userId: String(doc.userId),
      label: doc.label,
      fullName: doc.fullName,
      phone: doc.phone,
      line1: doc.line1,
      line2: doc.line2 || '',
      city: doc.city,
      state: doc.state,
      postalCode: doc.postalCode,
      country: doc.country,
      isDefault: doc.isDefault,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByUser(userId: string): Promise<AddressRecord[]> {
    const docs = await Address.find({ userId }).sort({ isDefault: -1, updatedAt: -1 }).lean();
    return docs.map((d) => this.toRecord(d as unknown as AddressDocument));
  }

  async findById(id: string): Promise<AddressRecord | null> {
    const doc = await Address.findById(id).lean();
    if (!doc) return null;
    return this.toRecord(doc as unknown as AddressDocument);
  }

  async create(userId: string, data: CreateAddressInput): Promise<AddressRecord> {
    const count = await Address.countDocuments({ userId });
    const isDefault = data.isDefault ?? count === 0;
    if (isDefault) {
      await Address.updateMany({ userId }, { $set: { isDefault: false } });
    }
    const doc = await Address.create({
      userId,
      label: data.label?.trim() || 'Home',
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      line1: data.line1.trim(),
      line2: data.line2?.trim() || '',
      city: data.city.trim(),
      state: data.state.trim(),
      postalCode: data.postalCode.trim(),
      country: (data.country || 'US').trim(),
      isDefault,
    });
    return this.toRecord(doc);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<CreateAddressInput>
  ): Promise<AddressRecord | null> {
    if (data.isDefault) {
      await Address.updateMany({ userId }, { $set: { isDefault: false } });
    }
    const update: Record<string, unknown> = {};
    if (data.label !== undefined) update.label = data.label.trim() || 'Home';
    if (data.fullName !== undefined) update.fullName = data.fullName.trim();
    if (data.phone !== undefined) update.phone = data.phone.trim();
    if (data.line1 !== undefined) update.line1 = data.line1.trim();
    if (data.line2 !== undefined) update.line2 = data.line2.trim();
    if (data.city !== undefined) update.city = data.city.trim();
    if (data.state !== undefined) update.state = data.state.trim();
    if (data.postalCode !== undefined) update.postalCode = data.postalCode.trim();
    if (data.country !== undefined) update.country = data.country.trim();
    if (data.isDefault !== undefined) update.isDefault = data.isDefault;

    const doc = await Address.findOneAndUpdate({ _id: id, userId }, { $set: update }, {
      new: true,
      runValidators: true,
    }).lean();
    if (!doc) return null;
    return this.toRecord(doc as unknown as AddressDocument);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await Address.findOneAndDelete({ _id: id, userId });
    if (!result) return false;
    if (result.isDefault) {
      const next = await Address.findOne({ userId }).sort({ updatedAt: -1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }
    return true;
  }
}

export const addressRepository = new AddressRepository();
