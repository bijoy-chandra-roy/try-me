# TryMe Documentation

Central index. Start with [How TryMe Works](how-it-works.md) or the [root README](../README.md) for setup.

---

## Product & engineering

| Document | Description |
|----------|-------------|
| [How TryMe Works](how-it-works.md) | Features, journeys, roles, FAQ |
| [SDLC Model](sdlc-model.md) | Spiral lifecycle (spirals 1–4 delivered) |
| [SWE Model](swe-model.md) | Layers, patterns, conventions |
| [Design system](design/design.md) | Living UI/token contract |
| [Reference dumps](reference/README.md) | Offline Astryx / Repomix snapshots (not maintained) |

---

## Diagrams

| Kind | Where |
|------|--------|
| Mermaid sources | [diagrams/](diagrams/README.md) (`*.md`) |
| **Defense Draw.io** (11×4.11″) | [diagrams/drawio/](diagrams/drawio/) |
| B&W HTML exporters | [diagrams/html/](diagrams/html/README.md) |

Regenerate HTML: `python docs/scripts/generate_bw_diagram_html.py`  
Spiral SVG page: `python docs/scripts/write_spiral_html.py`

---

## Defense (team presentation)

| Asset | Path |
|-------|------|
| Claude / deck prompt | [defense/defense-claude-prompt.md](defense/defense-claude-prompt.md) |
| PowerPoint | [defense/TryMe-Defense-Slides.pptx](defense/TryMe-Defense-Slides.pptx) |
| Slide PNGs | [defense/assets/](defense/assets/) |
| Defense notes | [defense/README.md](defense/README.md) |

Build PPTX: `python docs/scripts/build_defense_pptx.py`

---

## Spiral delivery

| Spiral | Focus | Status |
|--------|-------|--------|
| **1** | VTO prototype, catalog, circuit breaker | Delivered |
| **2** | Auth.js, RBAC, dashboards | Delivered |
| **3** | Cart, checkout, orders, reviews | Delivered |
| **4** | Design system, i18n, deploy | Delivered |
| **5** | Stripe payments | Planned |
| **6** | Enhanced VTO, automated testing | Planned |
