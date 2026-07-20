# Sequence Diagram — Circuit Breaker Flow

Maps the chronological data flow from user upload through ImgBB, VTO API call, timeout/error interception, and fallback cache serving.

```mermaid
sequenceDiagram
    actor User
    participant FE as Next.js Frontend
    participant BE as Express Backend
    participant ImgBB as ImgBB API
    participant DB as MongoDB
    participant CB as Circuit Breaker
    participant VTO as VTO API (IDM-VTON)
    participant Cache as Fallback Cache

    User->>FE: Upload reference photo + select product
    FE->>BE: POST /api/try-on (userImage, productId)

    BE->>ImgBB: Upload user image (base64)
    alt ImgBB success
        ImgBB-->>BE: Standard image URL
    else ImgBB failure
        ImgBB-->>BE: HTTP error
        BE-->>FE: 500 error response
    end

    BE->>DB: Fetch product by productId
    DB-->>BE: Product document (garment imageUrl)

    BE->>CB: Execute VTO call (10s deadline)

    par VTO API call with timeout
        CB->>VTO: POST user URL + garment URL
        alt VTO responds within 10s
            VTO-->>CB: Composite try-on image
            CB-->>BE: Result (fromFallback: false)
        else VTO timeout (>10s)
            Note over CB: Timer fires — intercept
            CB->>Cache: Read fallback-vto-result.jpg
            Cache-->>CB: Pre-generated composite (base64)
            CB-->>BE: Result (fromFallback: true)
        else VTO HTTP error
            VTO-->>CB: 4xx / 5xx error
            Note over CB: Error intercepted instantly
            CB->>Cache: Read fallback-vto-result.jpg
            Cache-->>CB: Pre-generated composite (base64)
            CB-->>BE: Result (fromFallback: true)
        end
    end

    BE-->>FE: JSON { compositeImageUrl, fromFallback, source }
    FE-->>User: Display try-on result
```

[← Diagram index](diagrams.md)
