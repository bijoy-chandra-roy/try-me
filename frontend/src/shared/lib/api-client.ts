import type { ApiResponse } from '@/shared/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.error || 'Request failed', response.status);
  }

  return payload.data;
}

export async function apiClientFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.error || 'Request failed', response.status);
  }

  return payload.data;
}
