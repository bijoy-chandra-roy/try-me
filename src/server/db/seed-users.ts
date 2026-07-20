import { authService } from '@/server/features/auth/auth.service';
import { userRepository } from '@/server/features/auth/user.repository';
import { merchantRepository } from '@/server/features/merchants/merchant.repository';
import { Product } from '@/server/features/products/product.model';

export const DEV_PASSWORD = 'TryMe123!';

export async function seedUsersIfEmpty() {
  const existing = await userRepository.findAll();
  if (existing.length > 0) return;

  const passwordHash = await authService.hashPassword(DEV_PASSWORD);

  await userRepository.create({
    email: 'superadmin@tryme.local',
    passwordHash,
    name: 'Super Admin',
    role: 'super_admin',
  });

  await userRepository.create({
    email: 'admin@tryme.local',
    passwordHash,
    name: 'Platform Admin',
    role: 'admin',
  });

  const merchantUser = await userRepository.create({
    email: 'merchant@tryme.local',
    passwordHash,
    name: 'Demo Merchant',
    role: 'merchant',
  });

  const merchant = await merchantRepository.create({
    name: 'TryMe Boutique',
    description: 'Curated fashion essentials for virtual try-on demos.',
    ownerId: merchantUser._id,
  });

  await userRepository.update(merchantUser._id, { merchantId: merchant._id });

  await userRepository.create({
    email: 'support@tryme.local',
    passwordHash,
    name: 'Support Agent',
    role: 'support',
  });

  await userRepository.create({
    email: 'customer@tryme.local',
    passwordHash,
    name: 'Demo Customer',
    role: 'customer',
  });

  await Product.updateMany({}, { $set: { merchantId: merchant._id } });

  console.log('Seeded demo users (password: TryMe123!)');
  console.log(`  Super Admin: superadmin@tryme.local`);
  console.log(`  Admin: admin@tryme.local`);
  console.log(`  Merchant: merchant@tryme.local`);
  console.log(`  Support: support@tryme.local`);
  console.log(`  Customer: customer@tryme.local`);
}
