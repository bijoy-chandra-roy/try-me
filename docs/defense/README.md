# Defense materials

Team defense deck and supporting assets for Sonargaon University.

## Contents

| File | Purpose |
|------|---------|
| [defense-claude-prompt.md](defense-claude-prompt.md) | Locked slide content / Claude prompt (11 slides) |
| [TryMe-Defense-Slides.pptx](TryMe-Defense-Slides.pptx) | Built PowerPoint |
| [assets/](assets/) | PNG exports used in / next to the deck |

## Diagrams for slides

Prefer Draw.io exports (transparent PNG/SVG) from:

- [../diagrams/drawio/tryme-use-case-diagram.drawio](../diagrams/drawio/tryme-use-case-diagram.drawio)
- [../diagrams/drawio/tryme-activity-swimlane.drawio](../diagrams/drawio/tryme-activity-swimlane.drawio)
- [../diagrams/drawio/tryme-er-diagram.drawio](../diagrams/drawio/tryme-er-diagram.drawio)
- [../diagrams/drawio/tryme-class-diagram.drawio](../diagrams/drawio/tryme-class-diagram.drawio)

Page size for those files: **1100×411** (11″ × 4.11″).

## Rebuild PPTX

```bash
python docs/scripts/build_defense_pptx.py
```

Output: `docs/defense/TryMe-Defense-Slides.pptx`
