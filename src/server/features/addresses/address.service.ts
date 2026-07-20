import { AppError } from '@/server/lib/errors';
import {
  addressRepository,
  type AddressRecord,
  type CreateAddressInput,
} from './address.repository';

export type { AddressRecord, CreateAddressInput };

class AddressService {
  async list(userId: string): Promise<AddressRecord[]> {
    return addressRepository.findByUser(userId);
  }

  async get(userId: string, id: string): Promise<AddressRecord> {
    const address = await addressRepository.findById(id);
    if (!address || address.userId !== userId) {
      throw new AppError('Address not found', 404);
    }
    return address;
  }

  async create(userId: string, data: CreateAddressInput): Promise<AddressRecord> {
    this.validateRequired(data);
    return addressRepository.create(userId, data);
  }

  async update(
    userId: string,
    id: string,
    data: Partial<CreateAddressInput>
  ): Promise<AddressRecord> {
    for (const key of ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'] as const) {
      if (data[key] !== undefined && !String(data[key]).trim()) {
        throw new AppError(`${key} cannot be empty`, 400);
      }
    }
    const updated = await addressRepository.update(id, userId, data);
    if (!updated) throw new AppError('Address not found', 404);
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await addressRepository.delete(id, userId);
    if (!deleted) throw new AppError('Address not found', 404);
  }

  private validateRequired(data: CreateAddressInput) {
    for (const key of ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'] as const) {
      if (!data[key] || !String(data[key]).trim()) {
        throw new AppError(`${key} is required`, 400);
      }
    }
  }
}

export const addressService = new AddressService();
