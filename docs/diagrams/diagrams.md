# TryMe Documentation

Central index for all project documentation, architecture diagrams, and process models.

---

## Guides

| Document | Description |
|----------|-------------|
| [How TryMe Works](../how-it-works.md) | Plain-language explanation of features, user journeys, and request flow |

## Process Models

| Document | Description |
|----------|-------------|
| [SDLC Model](../sdlc-model.md) | Spiral Model lifecycle — how each spiral was planned, built, and reviewed |
| [SWE Model](../swe-model.md) | Software engineering architecture — layers, patterns, conventions, and principles |

---

## Architecture Diagrams

All diagrams use [Mermaid](https://mermaid.js.org/) syntax. Preview them on GitHub or in any Mermaid-capable Markdown viewer.

| # | Diagram | File | Purpose |
|---|---------|------|---------|
| 1 | Component | [component-diagram.md](component-diagram.md) | Structural wiring of frontend, API, server features, and external services |
| 2 | Sequence | [sequence-diagram.md](sequence-diagram.md) | Try-on flow with auth, rate limiting, SSE, and circuit-breaker fallback |
| 3 | Use Case | [use-case-diagram.md](use-case-diagram.md) | Actors (6 roles), use cases, and system boundaries across all spirals |
| 4 | Class | [class-diagram.md](class-diagram.md) | Domain models, service layers, auth/RBAC, and frontend types |
| 5 | Project Network (CPM) | [project-network-diagram.md](project-network-diagram.md) | Full project task dependencies, critical path, and spiral milestones |
| 6 | Activity / Swimlane | [activity-swimlane-diagram.md](activity-swimlane-diagram.md) | End-to-end commerce and try-on flow by responsible lane |

---

## Design

| Document | Description |
|----------|-------------|
| [Design System](../design/design.md) | Canonical UI rules — tokens, frames, cards vs rows, components |
| [Liquid Glass](../design/liquid-glass.md) | Glass effect implementation details |
| [Astryx Reference](../design/astryx-docs.md) | Offline Astryx docs (reference only, not the living contract) |

---

## Spiral Delivery Summary

| Spiral | Focus | Status |
|--------|-------|--------|
| **1** | VTO prototype, product catalog, circuit breaker | Delivered |
| **2** | Auth.js, RBAC, 6 roles, dashboards | Delivered |
| **3** | Cart, checkout, orders, reviews, merchant ops | Delivered |
| **4** | Design system, settings/i18n, VTO SSE fix, deploy | Delivered |
| **5** | Stripe payments | Planned |
| **6** | Enhanced VTO, automated testing | Planned |
