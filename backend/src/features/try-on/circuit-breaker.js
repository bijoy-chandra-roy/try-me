const config = require('../../config');

class CircuitBreaker {
  constructor({ timeoutMs, fallbackFn }) {
    this.timeoutMs = timeoutMs;
    this.fallbackFn = fallbackFn;
  }

  async execute(operation) {
    try {
      const result = await this._executeWithTimeout(operation);
      return { data: result, fromFallback: false };
    } catch {
      const fallback = await this.fallbackFn();
      return { data: fallback, fromFallback: true };
    }
  }

  _executeWithTimeout(operation) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CIRCUIT_BREAKER_TIMEOUT')), this.timeoutMs);

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

function createVtoCircuitBreaker(fallbackFn) {
  return new CircuitBreaker({
    timeoutMs: config.vtoTimeoutMs,
    fallbackFn,
  });
}

module.exports = { CircuitBreaker, createVtoCircuitBreaker };
