# Class Diagram — TryMe (Spiral 1)

Domain model, backend service layers, and key frontend types.

```mermaid
classDiagram
    direction TB

    class Product {
        <<Mongoose Model>>
        +String name
        +String description
        +Number price
        +ProductCategory category
        +String imageUrl
        +String[] sizes
        +Boolean inStock
        +Date createdAt
        +Date updatedAt
    }

    class ProductRepository {
        +findAll(filters) Product[]
        +findById(id) Product
        +create(data) Product
        +insertMany(products) Product[]
        +deleteAll() void
    }

    class ProductService {
        +getProducts(filters) Product[]
        +getProductById(id) Product
    }

    class ProductController {
        +listProducts(req, res, next) void
        +getProduct(req, res, next) void
    }

    class UploadService {
        +uploadUserImage(file) String
    }

    class ImgBBClient {
        +uploadImage(buffer, filename) String
    }

    class TryOnService {
        +processTryOn(file, productId) TryOnResponse
    }

    class TryOnController {
        +createTryOn(req, res, next) void
    }

    class CircuitBreaker {
        -Number timeoutMs
        -Function fallbackFn
        +execute(operation) CircuitBreakerResult
        -_executeWithTimeout(operation) Promise
    }

    class VtoApiClient {
        -String apiUrl
        +generateTryOn(userImageUrl, garmentImageUrl) VtoResult
        -_extractOutputPath(result) String
    }

    class FallbackCache {
        -String imagePath
        +getFallbackResult() VtoResult
    }

    class TryOnResult {
        <<TypeScript Interface>>
        +String compositeImageUrl
        +String userImageUrl
        +String productImageUrl
        +String productName
        +String source
        +Boolean fromFallback
    }

    class useTryOn {
        <<React Hook>>
        +tryOn(userImage, productId) TryOnResult
        +reset() void
        +Boolean loading
        +String error
        +TryOnResult result
    }

    class useProducts {
        <<React Hook>>
        +Product[] products
        +Boolean loading
        +String error
        +fetchProducts(category) void
    }

    ProductRepository --> Product : persists
    ProductService --> ProductRepository : uses
    ProductController --> ProductService : delegates

    UploadService --> ImgBBClient : uses
    TryOnService --> UploadService : uses
    TryOnService --> ProductService : uses
    TryOnService --> CircuitBreaker : uses
    CircuitBreaker --> VtoApiClient : wraps
    CircuitBreaker --> FallbackCache : on failure
    TryOnController --> TryOnService : delegates

    useTryOn ..> TryOnResult : returns
    useProducts ..> Product : displays
```

## Layer Summary

| Layer | Classes | Responsibility |
|-------|---------|----------------|
| **Domain** | `Product`, `TryOnResult` | Data shape for catalog and try-on responses |
| **Repository** | `ProductRepository` | MongoDB access |
| **Service** | `ProductService`, `UploadService`, `TryOnService` | Business logic and orchestration |
| **Infrastructure** | `ImgBBClient`, `VtoApiClient`, `FallbackCache`, `CircuitBreaker` | External APIs and resilience |
| **Controller** | `ProductController`, `TryOnController` | HTTP request handling |
| **Presentation** | `useProducts`, `useTryOn` | Frontend state and API integration |

[← Diagram index](README.md)
