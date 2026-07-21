# TryMe Documentation

Central index for project documentation. Start with [How TryMe Works](how-it-works.md) for a plain-language product guide, or the [root README](../README.md) for setup and API reference.

---

## Guides

| Document | Audience | Description |
|----------|----------|-------------|
| [How TryMe Works](how-it-works.md) | Everyone | Features, user journeys, roles, request flow, and FAQ |
| [README](../README.md) | Developers | Quick start, env vars, API endpoints, demo accounts |

---

## Process & Architecture

| Document | Description |
|----------|-------------|
| [SDLC Model](sdlc-model.md) | Spiral Model lifecycle — how each spiral was planned, built, and reviewed |
| [SWE Model](swe-model.md) | Software engineering architecture — layers, patterns, conventions |

---

## Diagrams

All diagrams use [Mermaid](https://mermaid.js.org/) syntax. See the [diagram index](diagrams/README.md) for the full list.

| Diagram | File |
|---------|------|
| Component | [diagrams/component-diagram.md](diagrams/component-diagram.md) |
| Sequence | [diagrams/sequence-diagram.md](diagrams/sequence-diagram.md) |
| Use Case | [diagrams/use-case-diagram.md](diagrams/use-case-diagram.md) |
| Class | [diagrams/class-diagram.md](diagrams/class-diagram.md) |
| Project Network (CPM) | [diagrams/project-network-diagram.md](diagrams/project-network-diagram.md) |
| Activity / Swimlane | [diagrams/activity-swimlane-diagram.md](diagrams/activity-swimlane-diagram.md) |

---

## Design

| Document | Description |
|----------|-------------|
| [Design System](design/design.md) | **Living contract** — tokens, frames, cards vs rows, components |
| [Reference dumps](reference/README.md) | Offline Astryx docs and Repomix snapshots (not maintained) |

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
