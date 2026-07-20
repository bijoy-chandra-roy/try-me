# Activity / Swimlane Diagram — Virtual Try-On Flow

End-to-end process flow partitioned by responsible lane.

```mermaid
flowchart TB
    subgraph User["👤 User"]
        U1([Open TryMe app])
        U2([Browse / filter catalog])
        U3([Select a product])
        U4([Upload reference photo])
        U5([View try-on result])
        U6{Accept result?}
        U7([Try another product])
    end

    subgraph Frontend["🖥️ Next.js Frontend"]
        F1[Load product catalog]
        F2[Apply category filter]
        F3[Open Try-On modal]
        F4[Validate image file]
        F5[POST /api/try-on<br/>multipart form]
        F6[Render composite image]
        F7[Show Live or Fallback badge]
    end

    subgraph Backend["⚙️ Express Backend"]
        B1[Receive try-on request]
        B2[Upload image via UploadService]
        B3[Fetch product from ProductService]
        B4[Invoke Circuit Breaker]
        B5[Return JSON response]
    end

    subgraph External["🌐 External Services"]
        E1[(MongoDB<br/>product lookup)]
        E2[ImgBB API<br/>image hosting]
        E3[VTO API<br/>IDM-VTON]
        E4[Fallback cache<br/>local image]
    end

    U1 --> F1
    U2 --> F2
    F2 --> U3
    U3 --> F3
    F3 --> U4
    U4 --> F4
    F4 --> F5

    F1 --> E1
    F5 --> B1
    B1 --> B2
    B2 --> E2
    B2 --> B3
    B3 --> E1
    B3 --> B4

    B4 --> E3
    B4 -->|timeout or HTTP error| E4
    E3 -->|success within 10s| B5
    E4 --> B5

    B5 --> F6
    F6 --> F7
    F7 --> U5
    U5 --> U6
    U6 -->|No| U7
    U7 --> U2
    U6 -->|Yes| U1
```

## Lane Responsibilities

| Lane | Activities |
|------|------------|
| **User** | Navigation, product selection, photo upload, result review |
| **Next.js Frontend** | Catalog rendering, client validation, API calls, result display |
| **Express Backend** | Request orchestration, service delegation, circuit-breaker logic |
| **External Services** | Persistent catalog, image storage, AI try-on, fallback resilience |

## Decision Points

1. **Image validation (Frontend)** — Rejects invalid files before hitting the API.
2. **Circuit Breaker (Backend → External)** — On VTO timeout (>10 s) or HTTP error, serves pre-cached fallback image instead of failing the request.
3. **User acceptance** — Shopper may retry with a different product or restart the session.

[← Diagram index](diagrams.md)
