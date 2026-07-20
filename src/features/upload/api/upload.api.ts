import { apiClientFormData } from '@/shared/lib/api-client';

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const result = await apiClientFormData<{ url: string }>('/upload', formData);
  return result.url;
}
