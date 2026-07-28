# ER Diagram — TryMe (Physical MongoDB)

Physical collections mapped 1:1 to Mongoose models. **Defense source of truth is Draw.io.**

## Open for the panel slide

**[tryme-er-diagram.drawio](drawio/tryme-er-diagram.drawio)** — page **1100×411** (11″ × 4.11″).

| Element | Notes |
|---------|--------|
| Entities | USER, MERCHANT, PRODUCT, CART, ORDER, ADDRESS, REVIEW, TRYON_HISTORY, SYSTEM_CONFIG |
| Notation | Crow’s foot; PK / FK labeled |
| SYSTEM_CONFIG | Singleton (`maintenanceMode`, `guestTryOnLimit`) — no FK edges |

### Export

File → Export as → PNG/SVG (transparent) → paste into Slide 7.

## Mermaid sketch

Interactive: [html/er-class-diagram.html](html/er-class-diagram.html) (ER View). Prefer the `.drawio` for defense.

[← Diagram index](README.md)
