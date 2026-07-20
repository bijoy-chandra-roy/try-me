import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/shared/types';
import { getErrorMessage, getErrorStatus } from './errors';

export function jsonSuccess<T>(data: T, status = 200) {
  const body: ApiResponse<T> = { success: true, data };
  return NextResponse.json(body, { status });
}

export function jsonError(error: unknown) {
  const status = getErrorStatus(error);
  const body: ApiResponse<null> = {
    success: false,
    data: null,
    error: getErrorMessage(error),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  return NextResponse.json(body, { status });
}
