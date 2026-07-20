import { apiClientFormData } from '@/shared/lib/api-client';
import type { TryOnResult } from '@/shared/types';

export async function submitTryOn(
  userImage: File,
  productId: string
): Promise<TryOnResult> {
  const formData = new FormData();
  formData.append('userImage', userImage);
  formData.append('productId', productId);

  return apiClientFormData<TryOnResult>('/try-on', formData);
}
