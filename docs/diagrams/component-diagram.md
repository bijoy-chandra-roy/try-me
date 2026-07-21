# Component Diagram — TryMe (Current)

Illustrates the unified Next.js App Router architecture: client features, Route Handlers, server feature layer, and external services.

```mermaid
graph TB
    subgraph Client["Client Layer (src/app + src/features)"]
        Pages["App Router Pages<br/>(public, auth, dashboard, settings)"]
        Features["Feature Modules<br/>(products, try-on, cart, orders, …)"]
        SharedUI["Shared UI & Hooks<br/>(Button, GlassCard, useAuth, useT)"]
        Middleware["Edge Middleware<br/>(JWT + RBAC route guard)"]
    end

    subgraph API["API Layer (src/app/api)"]
        AuthRoutes["/api/auth/*<br/>NextAuth + register + SSE events"]
        ProductRoutes["/api/products/*"]
        TryOnRoutes["/api/try-on/*"]
        CartRoutes["/api/cart · /api/checkout"]
        OrderRoutes["/api/orders/*"]
        UserRoutes["/api/users · /api/merchants"]
        SystemRoutes["/api/system · /api/dashboard · /api/health"]
    end

    subgraph Server["Server Layer (src/server/features)"]
        AuthSvc["auth.service"]
        ProductSvc["product.service"]
        TryOnSvc["try-on.service"]
        CartSvc["cart.service"]
        OrderSvc["order.service"]
        MerchantSvc["merchant.service"]
        ReviewSvc["review.service"]
        AddressSvc["address.service"]
        UploadSvc["upload.service"]
        DashboardSvc["dashboard.service"]
        SystemSvc["system-config.service"]
        CB["Circuit Breaker<br/>(VTO timeout)"]
        VTOClient["VTO API Client<br/>(SSE /call/tryon)"]
        ImgBBClient["ImgBB Client"]
        Fallback["Fallback Cache<br/>(local image)"]
        Repos["Repositories<br/>(Mongoose models)"]
    end

    subgraph External["External Services"]
        MongoDB[("MongoDB")]
        ImgBB["ImgBB API"]
        VTO["IDM-VTON<br/>(Hugging Face Space)"]
        Google["Google OAuth"]
    end

    Pages --> Features
    Features --> SharedUI
    Middleware --> Pages

    Features -->|"fetch /api/*"| AuthRoutes
    Features --> ProductRoutes
    Features --> TryOnRoutes
    Features --> CartRoutes
    Features --> OrderRoutes
    Features --> UserRoutes
    Features --> SystemRoutes

    AuthRoutes --> AuthSvc
    ProductRoutes --> ProductSvc
    TryOnRoutes --> TryOnSvc
    CartRoutes --> CartSvc
    CartRoutes --> OrderSvc
    OrderRoutes --> OrderSvc
    UserRoutes --> AuthSvc
    UserRoutes --> MerchantSvc
    SystemRoutes --> DashboardSvc
    SystemRoutes --> SystemSvc

    AuthSvc --> Repos
    ProductSvc --> Repos
    TryOnSvc --> UploadSvc
    TryOnSvc --> ProductSvc
    TryOnSvc --> CB
    CartSvc --> Repos
    OrderSvc --> Repos
    MerchantSvc --> Repos
    ReviewSvc --> Repos
    AddressSvc --> Repos

    Repos --> MongoDB

    UploadSvc --> ImgBBClient
    ImgBBClient --> ImgBB

    CB --> VTOClient
    CB -->|"timeout / HTTP error"| Fallback
    VTOClient --> VTO

    AuthSvc --> Google
```

## Layer Summary

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Client** | `src/app/`, `src/features/`, `src/shared/` | Pages, feature UI, shared primitives, i18n, theme |
| **Edge** | `src/middleware.ts` | JWT validation, role-based route access |
| **API** | `src/app/api/*/route.ts` | HTTP boundary, auth guards, request parsing |
| **Server** | `src/server/features/*/` | Business logic, orchestration, external integrations |
| **Infrastructure** | `src/server/lib/`, `src/server/db/` | Auth guards, API responses, DB connection, caching |
| **External** | MongoDB, ImgBB, Hugging Face, Google | Persistence, image hosting, AI try-on, OAuth |

[← Diagram index](README.md)
