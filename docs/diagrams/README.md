# Architecture Diagrams

Mermaid sources, defense Draw.io files, and B&W HTML exporters.

## Defense Draw.io (source of truth for slides)

All pages **1100×411** (11″ wide × 4.11″ tall). Open in [diagrams.net](https://app.diagrams.net/), export transparent PNG/SVG.

| Diagram | Draw.io |
|---------|---------|
| Use Case | [drawio/tryme-use-case-diagram.drawio](drawio/tryme-use-case-diagram.drawio) |
| Activity / Swimlane | [drawio/tryme-activity-swimlane.drawio](drawio/tryme-activity-swimlane.drawio) |
| ER | [drawio/tryme-er-diagram.drawio](drawio/tryme-er-diagram.drawio) |
| Class | [drawio/tryme-class-diagram.drawio](drawio/tryme-class-diagram.drawio) |

## Mermaid sources

| # | Diagram | File |
|---|---------|------|
| 1 | Component | [component-diagram.md](component-diagram.md) |
| 2 | Sequence | [sequence-diagram.md](sequence-diagram.md) |
| 3 | Use Case | [use-case-diagram.md](use-case-diagram.md) |
| 4 | Class | [class-diagram.md](class-diagram.md) |
| 5 | ER | [er-diagram.md](er-diagram.md) |
| 6 | Project Network (CPM) | [project-network-diagram.md](project-network-diagram.md) |
| 7 | Activity / Swimlane | [activity-swimlane-diagram.md](activity-swimlane-diagram.md) |
| 8 | Spiral Model (SDLC) | [spiral-model-diagram.md](spiral-model-diagram.md) |

## B&W HTML exporters

See [html/README.md](html/README.md). Regenerate:

```bash
python docs/scripts/generate_bw_diagram_html.py
python docs/scripts/write_spiral_html.py
```

## Course classworks

Optional local reference samples can live in `classworks/` (not required for the product).

[← Docs index](../README.md)
