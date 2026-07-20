export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Internal server error';
}

export function getErrorStatus(error: unknown): number {
  if (isAppError(error)) return error.statusCode;
  if (error instanceof Error && 'statusCode' in error) {
    return (error as Error & { statusCode: number }).statusCode;
  }
  return 500;
}
