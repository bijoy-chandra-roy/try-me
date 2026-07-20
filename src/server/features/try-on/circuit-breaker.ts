import { config } from '@/server/config';

class CircuitBreaker<T> {
  constructor(
    private timeoutMs: number,
    private fallbackFn: () => Promise<T>
  ) {}

  async execute(operation: () => Promise<T>): Promise<{ data: T; fromFallback: boolean }> {
    try {
      const result = await this.executeWithTimeout(operation);
      return { data: result, fromFallback: false };
    } catch (error) {
      console.error('[Circuit Breaker] Fallback triggered due to error:', error);
      const fallback = await this.fallbackFn();
      return { data: fallback, fromFallback: true };
    }
  }

  private executeWithTimeout(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`CIRCUIT_BREAKER_TIMEOUT_EXCEEDED (${this.timeoutMs}ms)`)),
        this.timeoutMs
      );

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}

export function createVtoCircuitBreaker<T>(fallbackFn: () => Promise<T>) {
  return new CircuitBreaker(config.vtoTimeoutMs, fallbackFn);
}
