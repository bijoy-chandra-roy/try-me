"""One-shot: write hand-coded spiral-model-diagram.html (not Mermaid)."""
from __future__ import annotations

import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "diagrams" / "html" / "spiral-model-diagram.html"

cx, cy = 520.0, 520.0
r0, r1 = 36.0, 280.0
turns = 4
N = 480
max_t = turns * 2 * math.pi
FONT = "Segoe UI, Calibri, Arial, sans-serif"

parts: list[str] = []
for i in range(N + 1):
    t = (i / N) * max_t
    r = r0 + (r1 - r0) * (t / max_t)
    x = cx + r * math.cos(t)
    y = cy + r * math.sin(t)
    parts.append(("M" if i == 0 else "L") + f"{x:.1f},{y:.1f}")
path_d = "".join(parts)

# Markers at top of each loop; white fill masks the path. Labels past outer spiral.
spiral_labels = [
    "S1 Prototype / Circuit Breaker",
    "S2 Auth / RBAC",
    "S3 Commerce",
    "S4 Polish / Deploy",
]
marker_svg = []
for k in range(1, 5):
    t = 2 * math.pi * k - math.pi / 2
    r = r0 + (r1 - r0) * (t / max_t)
    x = cx + r * math.cos(t)
    y = cy + r * math.sin(t)
    lx = 820
    ly = y + 8
    marker_svg.append(
        f'<circle cx="{x:.1f}" cy="{y:.1f}" r="16" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>'
        f'<text x="{x:.1f}" y="{y + 8:.1f}" text-anchor="middle" font-family="{FONT}" font-size="22" font-weight="700" fill="#000000">{k}</text>'
        f'<text x="{lx:.1f}" y="{ly:.1f}" text-anchor="start" font-family="{FONT}" font-size="28" font-weight="700" fill="#000000">{spiral_labels[k - 1]}</text>'
    )

axis_len = 340
left_x = cx - axis_len
right_x = cx + axis_len
top_y = cy - axis_len
bot_y = cy + axis_len
mid_upper = (top_y + cy) / 2

# Quadrant labels near spiral; larger type for 16:9 slide export
q_labels = [
    ("1. Planning", 720, 175, "start"),
    ("2. Risk Analysis", 320, 175, "end"),
    ("3. Engineering", 320, 870, "end"),
    ("4. Evaluation / Review", 720, 870, "start"),
]
q_svg = "\n  ".join(
    f'<text x="{x:.0f}" y="{y:.0f}" text-anchor="{anchor}" font-family="{FONT}" font-size="34" font-weight="700" fill="#000000">{label}</text>'
    for label, x, y, anchor in q_labels
)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" width="1200" height="1000" style="background:transparent">
  <defs>
    <marker id="arrowHead" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
      <path d="M0,0 L12,5 L0,10 Z" fill="#000000"/>
    </marker>
  </defs>

  <!-- X / Y axes — four SDLC quadrants -->
  <line x1="{left_x}" y1="{cy}" x2="{right_x}" y2="{cy}" stroke="#000000" stroke-width="2.5" marker-end="url(#arrowHead)"/>
  <line x1="{cx}" y1="{bot_y}" x2="{cx}" y2="{top_y}" stroke="#000000" stroke-width="2.5" marker-end="url(#arrowHead)"/>

  <!-- Axis labels — presentation-scale type -->
  <text x="{right_x}" y="{cy + 48}" text-anchor="end" font-family="{FONT}" font-size="28" font-weight="700" fill="#000000">Cumulative cost →</text>
  <text transform="rotate(-90 {cx - 40} {mid_upper})" text-anchor="middle" font-family="{FONT}" font-size="28" font-weight="700" fill="#000000">Progress through cycles →</text>
  <text x="{left_x}" y="{cy + 48}" font-family="{FONT}" font-size="26" fill="#000000">← start</text>

  <!-- Subtle quadrant guides -->
  <line x1="{cx - 250}" y1="{cy - 250}" x2="{cx + 250}" y2="{cy + 250}" stroke="#000000" stroke-width="1.5" stroke-dasharray="6 6"/>
  <line x1="{cx - 250}" y1="{cy + 250}" x2="{cx + 250}" y2="{cy - 250}" stroke="#000000" stroke-width="1.5" stroke-dasharray="6 6"/>

  <!-- Continuous expanding spiral (drawn under nodes) -->
  <path d="{path_d}" fill="none" stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Quadrant phase labels -->
  {q_svg}

  <!-- Iteration nodes + labels -->
  {"".join(marker_svg)}
</svg>'''

# Escape for embedding as JS template? We'll put SVG inline in HTML and also as SPIRAL_SVG const for re-render.
svg_js = svg.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Spiral Model — SDLC — TryMe (B&amp;W)</title>
  <style>
* {{ box-sizing: border-box; }}
html, body {{
  margin: 0; padding: 0;
  background: #f0f0f0;
  color: #000000;
  font-family: "Segoe UI", Calibri, Arial, sans-serif;
}}
header {{
  display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between;
  gap: 0.75rem; padding: 0.75rem 1.1rem;
  border-bottom: 1px solid #000000; background: #ffffff;
  position: sticky; top: 0; z-index: 10;
}}
h1 {{ margin: 0; font-size: 1.1rem; font-weight: 700; }}
.meta {{ margin: 0.15rem 0 0; font-size: 0.78rem; }}
.actions {{ display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; max-width: 52rem; justify-content: flex-end; }}
button, label.ctrl {{
  background: #ffffff; color: #000000; border: 1px solid #000000;
  padding: 0.4rem 0.7rem; font-size: 0.8rem; cursor: pointer; border-radius: 0;
}}
button:hover, button:focus {{ background: #000000; color: #ffffff; outline: none; }}
button.active {{ background: #000000; color: #ffffff; }}
button:disabled {{ opacity: 0.45; cursor: wait; background: #ffffff; color: #000000; }}
label.ctrl {{
  display: inline-flex; align-items: center; gap: 0.4rem; cursor: default;
}}
label.ctrl input[type="range"] {{ width: 7.5rem; cursor: pointer; }}
label.ctrl input[type="number"] {{
  width: 4.2rem; border: 1px solid #000000; padding: 0.15rem 0.25rem; font-size: 0.8rem;
}}
main {{
  padding: 1.25rem;
  overflow: auto;
  background-color: #e8e8e8;
  background-image:
    linear-gradient(45deg, #d0d0d0 25%, transparent 25%),
    linear-gradient(-45deg, #d0d0d0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d0d0d0 75%),
    linear-gradient(-45deg, transparent 75%, #d0d0d0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  min-height: calc(100vh - 8rem);
}}
#diagram-frame {{
  margin: 0 auto;
  width: var(--diagram-width, 720px);
  max-width: 100%;
  background: transparent;
}}
#diagram {{ background: transparent; }}
#diagram svg {{
  display: block;
  width: 100%;
  height: auto;
  background: transparent !important;
}}
footer {{
  padding: 0.65rem 1.25rem 1.25rem; font-size: 0.75rem;
  border-top: 1px solid #000000; background: #ffffff;
}}
.status {{ font-size: 0.78rem; min-width: 10rem; }}
@media print {{
  header .actions, footer {{ display: none; }}
  header {{ position: static; border: none; }}
  main {{
    padding: 0;
    background: transparent;
    background-image: none;
  }}
}}
</style>
</head>
<body>
  <header>
    <div>
      <h1>Spiral Model — SDLC</h1>
      <p class="meta">Hand-coded SVG (Mermaid cannot draw spirals) — TryMe evolutionary / risk-driven meta-model</p>
    </div>
    <div class="actions">
      <label class="ctrl">Width <input type="range" id="width-range" min="240" max="1800" step="20" value="900" /><input type="number" id="width-num" min="240" max="2400" step="10" value="900" /> px</label>
      <button type="button" id="btn-svg" disabled>Save SVG</button>
      <button type="button" id="btn-copy-svg" disabled>Copy SVG</button>
      <button type="button" id="btn-png" disabled>Save PNG</button>
      <button type="button" id="btn-copy-png" disabled>Copy PNG</button>
      <button type="button" id="btn-rerender">Re-render</button>
      <span class="status" id="status">Loading…</span>
    </div>
  </header>
  <main>
    <div id="diagram-frame"><div id="diagram">{svg}</div></div>
  </main>
  <footer>TryMe — Sonargaon University. Black ink on <strong>transparent</strong> background (checkerboard is preview-only). Adjust <strong>Width</strong>, then Save/Copy SVG or PNG for slide embedding. This page is hand-maintained (not overwritten by generate_bw_diagram_html.py).</footer>
  <script src="https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js"></script>
  <script>
window.SVG_FILENAME = "tryme-spiral-model-diagram.svg";
window.PNG_FILENAME = "tryme-spiral-model-diagram.png";

const SPIRAL_SVG = `{svg_js}`;

function getSvgElement() {{
  return document.querySelector("#diagram svg");
}}

function applyDiagramWidth(px) {{
  const n = Math.max(240, Math.min(2400, Number(px) || 900));
  document.documentElement.style.setProperty("--diagram-width", n + "px");
  const num = document.getElementById("width-num");
  const range = document.getElementById("width-range");
  if (num && String(num.value) !== String(n)) num.value = String(n);
  if (range && String(range.value) !== String(n)) range.value = String(n);
  try {{ localStorage.setItem("tryme-diagram-width", String(n)); }} catch (_) {{}}
  return n;
}}

function serializeSvg() {{
  const svg = getSvgElement();
  if (!svg) throw new Error("SVG not ready");
  const clone = svg.cloneNode(true);
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.style.background = "transparent";
  return '<?xml version="1.0" encoding="UTF-8"?>\\n' + new XMLSerializer().serializeToString(clone);
}}

function downloadBlob(blob, filename) {{
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}}

function downloadSvg(filename) {{
  const status = document.getElementById("status");
  try {{
    downloadBlob(new Blob([serializeSvg()], {{ type: "image/svg+xml;charset=utf-8" }}), filename);
    if (status) status.textContent = "SVG saved: " + filename;
  }} catch (err) {{
    if (status) status.textContent = "SVG export failed: " + err.message;
    console.error(err);
  }}
}}

function copySvg() {{
  const status = document.getElementById("status");
  navigator.clipboard.writeText(serializeSvg()).then(
    () => {{ if (status) status.textContent = "SVG copied to clipboard"; }},
    (err) => {{ if (status) status.textContent = "Copy SVG failed: " + err; }}
  );
}}

function dataUrlToBlob(dataUrl) {{
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const bin = atob(parts[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], {{ type: mime }});
}}

async function diagramToPngBlob(pixelRatio) {{
  const node = document.getElementById("diagram");
  if (!node || !getSvgElement()) throw new Error("SVG not ready");
  if (typeof htmlToImage === "undefined" || !htmlToImage.toPng) {{
    throw new Error("html-to-image failed to load");
  }}
  const dataUrl = await htmlToImage.toPng(node, {{
    backgroundColor: null,
    pixelRatio: pixelRatio || 2,
    cacheBust: true,
    style: {{ background: "transparent", backgroundColor: "transparent" }}
  }});
  return dataUrlToBlob(dataUrl);
}}

async function downloadPng(filename) {{
  const status = document.getElementById("status");
  try {{
    if (status) status.textContent = "Rendering PNG…";
    const blob = await diagramToPngBlob(2);
    downloadBlob(blob, filename);
    if (status) status.textContent = "PNG saved: " + filename;
  }} catch (err) {{
    if (status) status.textContent = "PNG export failed: " + err.message;
    console.error(err);
  }}
}}

async function copyPng() {{
  const status = document.getElementById("status");
  try {{
    if (status) status.textContent = "Copying PNG…";
    const blob = await diagramToPngBlob(2);
    await navigator.clipboard.write([new ClipboardItem({{ "image/png": blob }})]);
    if (status) status.textContent = "PNG copied to clipboard";
  }} catch (err) {{
    if (status) status.textContent = "Copy PNG failed: " + err.message;
    console.error(err);
  }}
}}

function setExportEnabled(on) {{
  ["btn-svg", "btn-copy-svg", "btn-png", "btn-copy-png"].forEach((id) => {{
    const el = document.getElementById(id);
    if (el) el.disabled = !on;
  }});
}}

function renderDiagram() {{
  const status = document.getElementById("status");
  document.getElementById("diagram").innerHTML = SPIRAL_SVG;
  setExportEnabled(true);
  if (status) status.textContent = "Ready — set width, then Save SVG/PNG";
}}

function wireControls() {{
  let saved = 900;
  try {{
    const v = localStorage.getItem("tryme-diagram-width");
    if (v) saved = Number(v) || 900;
  }} catch (_) {{}}
  applyDiagramWidth(saved);

  const range = document.getElementById("width-range");
  const num = document.getElementById("width-num");
  if (range) range.addEventListener("input", () => applyDiagramWidth(range.value));
  if (num) {{
    num.addEventListener("change", () => applyDiagramWidth(num.value));
    num.addEventListener("keydown", (e) => {{
      if (e.key === "Enter") applyDiagramWidth(num.value);
    }});
  }}

  document.getElementById("btn-svg").addEventListener("click", () => {{
    downloadSvg(window.SVG_FILENAME || "diagram.svg");
  }});
  document.getElementById("btn-copy-svg").addEventListener("click", copySvg);
  document.getElementById("btn-png").addEventListener("click", () => {{
    downloadPng(window.PNG_FILENAME || "diagram.png");
  }});
  document.getElementById("btn-copy-png").addEventListener("click", copyPng);
  document.getElementById("btn-rerender").addEventListener("click", renderDiagram);
}}

wireControls();
setExportEnabled(true);
document.getElementById("status").textContent = "Ready — set width, then Save SVG/PNG";
  </script>
</body>
</html>
'''

OUT.write_text(html, encoding="utf-8")
print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")
