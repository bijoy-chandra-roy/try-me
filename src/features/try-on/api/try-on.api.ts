import { apiClient, apiClientFormData } from '@/shared/lib/api-client';
import type { TryOnResult } from '@/shared/types';

export async function submitTryOn(
  userImage: File,
  productId: string,
  signal?: AbortSignal
): Promise<TryOnResult> {
  const formData = new FormData();
  formData.append('userImage', userImage);
  formData.append('productId', productId);
  formData.append('privacyConsent', 'true');

  return apiClientFormData<TryOnResult>('/try-on', formData, { signal });
}

export async function deleteTryOnHistory(id: string): Promise<void> {
  await apiClient<{ deleted: boolean }>(`/try-on/history/${id}`, { method: 'DELETE' });
}
