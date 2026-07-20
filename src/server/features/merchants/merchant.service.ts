import { AppError } from '@/server/lib/errors';
import { merchantRepository } from './merchant.repository';

class MerchantService {
  async getMerchants() {
    return merchantRepository.findAll();
  }

  async getMerchantById(id: string) {
    const merchant = await merchantRepository.findById(id);
    if (!merchant) throw new AppError('Merchant not found', 404);
    return merchant;
  }

  async getMerchantByOwnerId(ownerId: string) {
    return merchantRepository.findByOwnerId(ownerId);
  }

  async createMerchant(data: { name: string; description: string; ownerId: string }) {
    const existing = await merchantRepository.findByOwnerId(data.ownerId);
    if (existing) {
      throw new AppError('Merchant profile already exists for this user', 409);
    }
    return merchantRepository.create(data);
  }

  async updateMerchant(
    id: string,
    data: Partial<{ name: string; description: string; status: 'pending' | 'approved' | 'suspended' }>
  ) {
    const merchant = await merchantRepository.update(id, data);
    if (!merchant) throw new AppError('Merchant not found', 404);
    return merchant;
  }
}

export const merchantService = new MerchantService();
