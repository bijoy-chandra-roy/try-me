# Spiral Model Diagram — TryMe SDLC

TryMe uses the **Spiral Model** — a risk-driven iterative **meta-model** (Waterfall control + prototyping feedback). Each loop is one full cycle; radial growth represents cumulative effort.

## Axes (Boehm)

| Dimension | Meaning |
|-----------|---------|
| **Radial / horizontal (“Cumulative cost”)** | Effort grows as loops move outward |
| **Angular (“Progress through cycles”)** | Movement through the four quadrants |

## Four quadrants (each loop)

| # | Phase | Focus |
|---|--------|--------|
| **1** | **Planning** | Objectives, alternatives, constraints |
| **2** | **Risk Analysis** | Evaluate risks; build prototypes to resolve them |
| **3** | **Engineering** | Develop and test the validated increment |
| **4** | **Evaluation / Review** | Assess output; plan the next spiral |

TryMe’s prototypes are primarily **evolutionary** (refined into the product), with risk spikes and UI exploration as needed.

## Delivered spirals (TryMe)

Logical increments (scope order), not wall-clock day claims:

| Spiral | Name | Focus |
|--------|------|--------|
| **1** | Prototype | VTO, catalog, Circuit Breaker + fallback |
| **2** | Auth / RBAC | Auth.js, roles, permissions, dashboards |
| **3** | Commerce | Cart, COD, orders, reviews, merchants |
| **4** | Design / Polish | Design system, i18n, SSE fix, Vercel |

## Black-and-white HTML export

[html/spiral-model-diagram.html](html/spiral-model-diagram.html) — hand-coded inline SVG (Mermaid cannot draw spirals).

Regenerate spiral page: `python docs/scripts/write_spiral_html.py`

Full process narrative: [sdlc-model.md](../sdlc-model.md)

[← Diagram index](README.md)
