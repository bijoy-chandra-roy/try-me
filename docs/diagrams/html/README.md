# Black-and-White Diagram HTML Exports

Standalone HTML pages for defense slides. **Transparent diagram background**, **black ink only** (no colors, gradients, or shadows). On-screen checkerboard is preview-only and is **not** included in exports.

| Diagram | HTML | SVG / PNG download |
|---------|------|--------------------|
| Spiral Model (SDLC) | [spiral-model-diagram.html](spiral-model-diagram.html) | `tryme-spiral-model-diagram.svg` / `.png` (**hand-coded SVG** — `python docs/scripts/write_spiral_html.py`) |
| Solution & User Flow | [user-flow-diagram.html](user-flow-diagram.html) | `tryme-user-flow-diagram.svg` / `.png` |
| Use Case | [use-case-diagram.html](use-case-diagram.html) | Mermaid sketch only — **defense:** [../drawio/tryme-use-case-diagram.drawio](../drawio/tryme-use-case-diagram.drawio) |
| Activity / Swimlane | [activity-swimlane-diagram.html](activity-swimlane-diagram.html) | Mermaid sketch — **defense:** [../drawio/tryme-activity-swimlane.drawio](../drawio/tryme-activity-swimlane.drawio) |
| Component | [component-diagram.html](component-diagram.html) | `tryme-component-diagram.svg` / `.png` |
| ER / Class | [er-class-diagram.html](er-class-diagram.html) | Mermaid sketch — **defense:** [../drawio/tryme-er-diagram.drawio](../drawio/tryme-er-diagram.drawio), [../drawio/tryme-class-diagram.drawio](../drawio/tryme-class-diagram.drawio) |

## Export for slides

1. Open an HTML file in Chrome/Edge/Firefox (needs network once for the Mermaid / html-to-image CDN).
2. Set **Width** (px) with the slider or number box so the diagram fits your slide.
3. Wait until status shows **Ready**.
4. Click **Save SVG** / **Save PNG**, or **Copy SVG** / **Copy PNG**.
5. Insert into PowerPoint / Google Slides.

Regenerate:

```bash
python docs/scripts/generate_bw_diagram_html.py
```

Sources mirror `docs/diagrams/*.md`, `docs/sdlc-model.md`, and `docs/swe-model.md`.
Defense deck: [../../defense/](../../defense/). Draw.io UML: [../drawio/](../drawio/).
