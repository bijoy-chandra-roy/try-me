# Activity / Swimlane Diagram — End-to-End Commerce & Try-On Flow

Process flow partitioned by responsible lane, covering browse → try-on → cart → checkout → order tracking.

```mermaid
flowchart TB
    subgraph User["👤 User"]
        U1([Open TryMe])
        U2([Browse / filter catalog])
        U3([Try on a product])
        U4([Add to cart])
        U5([Proceed to checkout])
        U6([Enter shipping address])
        U7([Place order (COD)])
        U8([Track order status])
        U9([Write review after delivery])
    end

    subgraph Frontend["🖥️ Next.js Frontend"]
        F1[Load catalog via useProducts]
        F2[Open TryOnModal]
        F3[POST /api/try-on]
        F4[Show Live / Fallback badge]
        F5[Add item via useCart]
        F6[Load cart & addresses]
        F7[POST /api/checkout]
        F8[Redirect to order page]
        F9[OrdersPanel / review form]
    end

    subgraph Middleware["🔒 Edge Middleware"]
        MW1{Authenticated?}
        MW2{Has permission?}
    end

    subgraph API["⚡ Route Handlers"]
        R1[Product routes]
        R2[Try-on route + rate limit]
        R3[Cart routes]
        R4[Checkout route]
        R5[Order routes]
        R6[Review routes]
    end

    subgraph Server["⚙️ Server Services"]
        S1[ProductService]
        S2[TryOnService + Circuit Breaker]
        S3[CartService]
        S4[OrderService.checkout]
        S5[ReviewService]
    end

    subgraph External["🌐 External Services"]
        E1[(MongoDB)]
        E2[ImgBB API]
        E3[VTO API (SSE)]
        E4[Fallback cache]
    end

    U1 --> F1
    F1 --> R1 --> S1 --> E1
    U2 --> F1
    U3 --> F2 --> F3

    F3 --> MW1
    MW1 -->|Guest| R2
    MW1 -->|Auth| MW2
    MW2 --> R2
    R2 --> S2
    S2 --> E2
    S2 --> E3
    S2 -->|timeout/error| E4
    S2 --> E1
    S2 --> F4
    F4 --> U3

    U4 --> F5 --> MW2
    MW2 --> R3 --> S3 --> E1

    U5 --> F6
    U6 --> F7
    F7 --> MW2 --> R4 --> S4
    S4 --> S3
    S4 --> E1
    S4 --> F8
    F8 --> U7

    U8 --> F9 --> R5 --> E1
    U9 --> F9 --> R6 --> S5 --> E1
```

## Lane Responsibilities

| Lane | Activities |
|------|------------|
| **User** | Browse, try-on, cart, checkout, order tracking, reviews |
| **Next.js Frontend** | Feature hooks, modals, forms, API calls, result display |
| **Edge Middleware** | JWT validation, role/permission checks on protected routes |
| **Route Handlers** | HTTP boundary, parse requests, invoke services, return JSON |
| **Server Services** | Business logic, stock management, circuit-breaker orchestration |
| **External Services** | MongoDB persistence, ImgBB hosting, VTO AI, fallback resilience |

## Decision Points

1. **Guest vs authenticated (Middleware)** — Guests get rate-limited try-on; cart/checkout require sign-in.
2. **Permission check (Middleware + AuthGuard)** — Each API route enforces granular permissions (e.g. `manage_cart`, `place_orders`).
3. **Circuit Breaker (TryOnService)** — VTO timeout or SSE error → instant fallback image; user always sees a result.
4. **Stock validation (CartService / OrderService)** — Checkout decrements inventory; cancellation restocks.
5. **Review eligibility (ReviewService)** — Reviews require a delivered purchase for that product.

[← Diagram index](README.md)
