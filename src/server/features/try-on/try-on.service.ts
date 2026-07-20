import { productService } from '@/server/features/products/product.service';
import { uploadService, type UploadedFile } from '@/server/features/upload/upload.service';
import { createVtoCircuitBreaker } from './circuit-breaker';
import { fallbackCache, vtoApiClient } from './vto-api.client';

const vtoCircuitBreaker = createVtoCircuitBreaker(() => fallbackCache.getFallbackResult());

class TryOnService {
  async processTryOn({ file, productId }: { file: UploadedFile; productId: string }) {
    const product = await productService.getProductById(productId);
    const userImageUrl = await uploadService.uploadUserImage(file);

    const { data, fromFallback } = await vtoCircuitBreaker.execute(() =>
      vtoApiClient.generateTryOn(userImageUrl, product.imageUrl)
    );

    return {
      compositeImageUrl: data.imageUrl,
      userImageUrl,
      productImageUrl: product.imageUrl,
      productName: product.name,
      source: data.source,
      fromFallback,
    };
  }
}

export const tryOnService = new TryOnService();
