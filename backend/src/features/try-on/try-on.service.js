const uploadService = require('../upload/upload.service');
const productService = require('../products/product.service');
const { createVtoCircuitBreaker } = require('./circuit-breaker');
const { vtoApiClient, fallbackCache } = require('./vto-api.client');

const vtoCircuitBreaker = createVtoCircuitBreaker(() => fallbackCache.getFallbackResult());

class TryOnService {
  async processTryOn({ file, productId }) {
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

module.exports = new TryOnService();
