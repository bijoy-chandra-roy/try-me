import { unstable_cache as nextUnstableCache } from 'next/cache';
import { cache } from 'react';

/**
 * Request-deduped + time-based cache (NextFaster pattern).
 * `unstable_cache` alone does not dedupe within a single render;
 * wrapping with React `cache()` fixes that.
 */
export function unstable_cache<Inputs extends unknown[], Output>(
  callback: (...args: Inputs) => Promise<Output>,
  key: string[],
  options: { revalidate: number; tags?: string[] }
): (...args: Inputs) => Promise<Output> {
  return cache(nextUnstableCache(callback, key, options));
}
