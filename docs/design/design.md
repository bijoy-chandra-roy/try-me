# TryMe Design System

Canonical UI rules for TryMe. Liquid glass + sand/olive/clay remain the brand. Structural conventions (tokens, frames, cards vs rows, elevation) are informed by Meta’s Astryx — **do not install `@astryxdesign` packages** unless a future decision revisits that. Offline Astryx dumps in this folder are reference only.

---

## Brand & Aesthetic

- **Palette:** Earth tones — sand (backgrounds), olive (primary/surfaces), clay (accent chips). No purple gradients, no Inter/Roboto defaults.
- **Typography:** Urbanist (UI) + Cormorant Garamond (display, brand, titles).
- **Liquid glass:** Frosted backdrop blur, sheen overlay, optional mouse elasticity on gallery cards. Apply via `.glass-card` / glass tokens. Light / Dark / System via class strategy + FOUC boot script.
- **Anti-slop:** Prefer semantic tokens over raw hex; quiet shadows (no colored glow); intentional spacing on a 4px grid.

---

## Semantic Tokens (not appearance names)

Components and pages use **role** tokens. Raw `sand-*` / `olive-*` belong in token definitions only.

| Role | Examples |
| :--- | :--- |
| Surfaces | `body` → `surface` → `card` (glass) → `popover` |
| Text | `primary`, `secondary`, `disabled`, `accent` |
| Status | `success`, `error`, `warning` (+ muted / on-*) — meaning only |
| Spacing | `--spacing-*` (4px grid; half-steps for optical work) |
| Control size | `--size-element-sm` 28 · `md` 32 · `lg` 36 |
| Radius | `inner` · `element` · `container` · `page` · `full` — nested ≈ parent − padding |
| Elevation | shadow `low` / `med` / `high`; z `base` < `dropdown` < `sticky` < `overlay` < `toast` < `tooltip` |
| Motion | `--duration-fast` / `medium` / `slow`, `--ease-standard`; honor `prefers-reduced-motion` |

Glass vars (`--glass-*`) implement card/popover surfaces; they are not a second color system.

---

## Frame-First Layout

Decide the shell before content. Content-first “card soup” reads as a prototype.

| Archetype | Frame | Container policy |
| :--- | :--- | :--- |
| Catalog / try-on gallery | TopNav (`Header`) + content column | **Card grid** for products |
| Cart / checkout / auth | Narrower content column | Form sections; **one Card** to group a form |
| Role dashboards | AppShell: SideNav ~256 + content | **Rows** for users/merchants/orders; **Cards** for StatCards / settings groups |

**Responsive contract (dashboards):**

```
> 1024px   nav 256 | content
<= 768px   nav → MobileNav drawer; global Header remains
```

Layout widths: `--layout-content-max`, `--layout-form-max`, `--layout-narrow-max`.

---

## Cards vs Rows

- **Card** = widget container: KPI tiles, gallery entries, form groups, settings/dangerous action groups.
- **Row** = dense scannable data: users, merchants, order lines — edge-to-edge with dividers inside one surface, not one card per record.
- Do not nest cards inside cards.
- Do not wrap every list item in a Card.

---

## Progressive Disclosure

- One **primary** Button per region; secondary actions in Popover / IconButton menus.
- Row actions: reveal on hover (`action-reveal`) where density allows.
- Status chips = enumerated states only (active / approved / …), not decoration.
- Destructive actions use `destructive` / ghost variants — never the primary olive pill.

---

## Components (conventions)

| Primitive | Use |
| :--- | :--- |
| `Button` | `variant`: primary \| secondary \| ghost \| destructive; `size`: sm \| md \| lg |
| `IconButton` | Toolbar / overflow triggers |
| `ListRow` / `DataList` | Dense dashboard lists |
| `StatusChip` | Enumerated status |
| `GlassCard` | Widgets, gallery, form groups; elasticity optional (gallery) |
| Popover / Tooltip | Popover surface token + elevation z-tier; portal out of overflow |

Buttons and inputs share **md** height rhythm unless a size prop says otherwise.

---

## Data Dictates Form

- Categorical data → chips; numbers right-aligned; long text truncated; inactive rows dimmed (`.row-dimmed`).
- Color conveys meaning (urgency, status), not decoration.
- Prefer timelines/summaries over dumping timestamp columns.

---

## Agent Workflow

1. Pick archetype → frame → container policy.
2. Use semantic tokens / shared primitives; do not invent one-off hex or purple themes.
3. Dense data → rows; widgets → cards.
4. Read this file (and `.cursor/rules/tryme-design.mdc`) before building UI.

`docs/design/astryx-docs.md` and related dumps are offline reference — not the living contract.
