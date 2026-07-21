# Sequence Diagram — Virtual Try-On with Circuit Breaker

Maps the end-to-end try-on flow: guest rate limiting, image upload, SSE-based VTO call, circuit-breaker fallback, and history persistence.

```mermaid
sequenceDiagram
    actor User
    participant FE as Next.js Frontend
    participant MW as Middleware / Auth Guard
    participant RH as Route Handler<br/>POST /api/try-on
    participant RL as Guest Rate Limiter
    participant TryOn as TryOnService
    participant Upload as UploadService
    participant Product as ProductService
    participant ImgBB as ImgBB API
    participant CB as Circuit Breaker
    participant VTO as VTO API (SSE)
    participant Cache as Fallback Cache
    participant Hist as TryOnHistoryService
    participant DB as MongoDB

    User->>FE: Upload photo + select product
    FE->>RH: POST /api/try-on (multipart)

    RH->>MW: getOptionalAuth()
    alt Guest (no session)
        RH->>RL: checkGuestRateLimit(IP)
        alt Rate limit exceeded
            RL-->>RH: 429 Too Many Requests
            RH-->>FE: Error response
        end
    else Authenticated
        RH->>MW: requirePermission(try_on)
    end

    RH->>TryOn: processTryOn(file, productId, userId?)

    TryOn->>Product: getProductById(productId)
    Product->>DB: findById
    DB-->>Product: Product document
    Product-->>TryOn: garment imageUrl

    TryOn->>Upload: uploadUserImage(file)
    Upload->>ImgBB: POST base64 image
    alt ImgBB success
        ImgBB-->>Upload: Public image URL
    else ImgBB failure
        ImgBB-->>Upload: HTTP error
        Upload-->>TryOn: throw
        TryOn-->>RH: 500 error
        RH-->>FE: Error response
    end

    TryOn->>CB: execute(vtoApiClient.generateTryOn)

    par VTO SSE call with timeout (default 300s)
        CB->>VTO: POST /call/tryon → SSE stream
        alt VTO completes within timeout
            VTO-->>CB: Composite image URL
            CB-->>TryOn: Result (fromFallback: false)
        else VTO timeout or error event
            Note over CB: Timer fires or SSE error — intercept
            CB->>Cache: Read fallback-vto-result.jpg
            Cache-->>CB: Pre-generated composite
            CB-->>TryOn: Result (fromFallback: true)
        end
    end

    TryOn->>Upload: uploadImageFromSource(composite)
    Upload->>ImgBB: Persist composite to ImgBB
    ImgBB-->>Upload: Composite URL

    opt Authenticated user
        TryOn->>Hist: saveHistory(userId, result)
        Hist->>DB: insert TryOnHistory
    end

    TryOn-->>RH: TryOnResponse
    RH-->>FE: JSON { compositeImageUrl, fromFallback, source }
    FE-->>User: Display result + Live/Fallback badge
```

## Key Resilience Points

| Point | Behavior |
|-------|----------|
| **Guest rate limit** | In-memory per-IP counter (default 3/hour from `SystemConfig`) |
| **Maintenance mode** | Blocks guest try-on; admins with `manage_system` bypass |
| **Circuit breaker** | Wraps VTO SSE call; timeout or error → local fallback image |
| **SSE error handling** | `event: error` always throws immediately (fail-fast to fallback) |
| **History** | Saved only for authenticated users with `try_on` permission |

[← Diagram index](README.md)
