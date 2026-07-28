"""Generate standalone B&W Mermaid HTML diagram pages with SVG export."""

from __future__ import annotations

from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "diagrams" / "html"
OUT.mkdir(parents=True, exist_ok=True)
MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
HTML_TO_IMAGE_CDN = "https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js"

CSS = """
* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  background: #f0f0f0;
  color: #000000;
  font-family: "Segoe UI", Calibri, Arial, sans-serif;
}
header {
  display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between;
  gap: 0.75rem; padding: 0.75rem 1.1rem;
  border-bottom: 1px solid #000000; background: #ffffff;
  position: sticky; top: 0; z-index: 10;
}
h1 { margin: 0; font-size: 1.1rem; font-weight: 700; }
.meta { margin: 0.15rem 0 0; font-size: 0.78rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; max-width: 52rem; justify-content: flex-end; }
button, label.ctrl {
  background: #ffffff; color: #000000; border: 1px solid #000000;
  padding: 0.4rem 0.7rem; font-size: 0.8rem; cursor: pointer; border-radius: 0;
}
button:hover, button:focus { background: #000000; color: #ffffff; outline: none; }
button.active { background: #000000; color: #ffffff; }
button:disabled { opacity: 0.45; cursor: wait; background: #ffffff; color: #000000; }
label.ctrl {
  display: inline-flex; align-items: center; gap: 0.4rem; cursor: default;
}
label.ctrl input[type="range"] { width: 7.5rem; cursor: pointer; }
label.ctrl input[type="number"] {
  width: 4.2rem; border: 1px solid #000000; padding: 0.15rem 0.25rem; font-size: 0.8rem;
}
main {
  padding: 1.25rem;
  overflow: auto;
  /* Checkerboard only for on-screen preview of transparency — not baked into exports */
  background-color: #e8e8e8;
  background-image:
    linear-gradient(45deg, #d0d0d0 25%, transparent 25%),
    linear-gradient(-45deg, #d0d0d0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d0d0d0 75%),
    linear-gradient(-45deg, transparent 75%, #d0d0d0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  min-height: calc(100vh - 8rem);
}
#diagram-frame {
  margin: 0 auto;
  width: var(--diagram-width, 720px);
  max-width: 100%;
  background: transparent;
}
#diagram { background: transparent; }
#diagram svg {
  display: block;
  width: 100%;
  height: auto;
  background: transparent !important;
}
footer {
  padding: 0.65rem 1.25rem 1.25rem; font-size: 0.75rem;
  border-top: 1px solid #000000; background: #ffffff;
}
.status { font-size: 0.78rem; min-width: 10rem; }
@media print {
  header .actions, footer { display: none; }
  header { position: static; border: none; }
  main {
    padding: 0;
    background: transparent;
    background-image: none;
  }
}
"""

HELPERS_JS = r"""
const BW_THEME = {
  theme: "base",
  securityLevel: "loose",
  startOnLoad: false,
  themeVariables: {
    darkMode: false,
    background: "transparent",
    mainBkg: "transparent",
    primaryColor: "transparent",
    primaryTextColor: "#000000",
    primaryBorderColor: "#000000",
    secondaryColor: "transparent",
    secondaryTextColor: "#000000",
    secondaryBorderColor: "#000000",
    tertiaryColor: "transparent",
    tertiaryTextColor: "#000000",
    tertiaryBorderColor: "#000000",
    lineColor: "#000000",
    textColor: "#000000",
    titleColor: "#000000",
    nodeTextColor: "#000000",
    fontSize: "24px",
    clusterBkg: "transparent",
    clusterBorder: "#000000",
    edgeLabelBackground: "transparent",
    actorBkg: "transparent",
    actorBorder: "#000000",
    actorTextColor: "#000000",
    actorLineColor: "#000000",
    labelBoxBkgColor: "transparent",
    labelBoxBorderColor: "#000000",
    labelTextColor: "#000000",
    noteBkgColor: "transparent",
    noteTextColor: "#000000",
    noteBorderColor: "#000000",
    classText: "#000000",
    attributeBackgroundColorOdd: "transparent",
    attributeBackgroundColorEven: "transparent",
    relationColor: "#000000",
    relationLabelBackground: "transparent",
    relationLabelColor: "#000000"
  },
  flowchart: { htmlLabels: false, curve: "basis", diagramPadding: 12, nodeSpacing: 28, rankSpacing: 36 },
  er: { diagramPadding: 16 },
  class: { hideEmptyMembersBox: false }
};

function isInkElement(el) {
  const tag = el.tagName.toLowerCase();
  const cls = el.getAttribute("class") || "";
  if (tag === "text" || tag === "tspan") return true;
  if (cls.includes("nodeLabel") || cls.includes("edgeLabel") || cls.includes("label")) return true;
  if (cls.includes("flowchart-link") || cls.includes("edgePath") || cls.includes("relation")) return true;
  if (cls.includes("arrow") || cls.includes("marker") || tag === "marker") return true;
  return false;
}

function forceBlackInkTransparentBg(root) {
  if (!root) return;
  root.querySelectorAll("style").forEach((el) => {
    let css = el.textContent || "";
    css = css.replace(/background(-color)?\s*:\s*[^;]+/gi, "background$1:transparent");
    css = css.replace(/fill\s*:\s*#[0-9a-fA-F]{3,8}/gi, (m) => {
      const hex = m.split(":")[1].trim().toLowerCase();
      if (hex === "#000" || hex === "#000000") return "fill:#000000";
      return "fill:none";
    });
    css = css.replace(/fill\s*:\s*rgb\([^)]+\)/gi, "fill:none");
    css = css.replace(/stroke\s*:\s*[^;]+/gi, "stroke:#000000");
    css = css.replace(/color\s*:\s*[^;]+/gi, "color:#000000");
    el.textContent = css;
  });
  root.querySelectorAll("rect.bw-bg").forEach((el) => el.remove());
  root.querySelectorAll("*").forEach((el) => {
    const style = el.style;
    const tag = el.tagName.toLowerCase();
    const cls = el.getAttribute("class") || "";
    if (style.filter) style.filter = "none";
    if (style.boxShadow) style.boxShadow = "none";
    if (style.textShadow) style.textShadow = "none";
    if (style.background || style.backgroundColor) {
      style.background = "transparent";
      style.backgroundColor = "transparent";
    }

    if (el.hasAttribute("stroke") && el.getAttribute("stroke") !== "none") {
      el.setAttribute("stroke", "#000000");
    }
    if (style.stroke && style.stroke !== "none") style.stroke = "#000000";

    if (isInkElement(el) || cls.includes("arrowMarkerPath") || tag === "polygon" && cls.includes("arrow")) {
      if (el.hasAttribute("fill") && el.getAttribute("fill") !== "none") el.setAttribute("fill", "#000000");
      if (style.fill && style.fill !== "none") style.fill = "#000000";
      if (style.color) style.color = "#000000";
      return;
    }

    // Shape / cluster fills → transparent (outline-only diagram)
    if (["rect", "polygon", "circle", "ellipse", "path"].includes(tag)) {
      if (cls.includes("flowchart-link") || cls.includes("edgePath") || cls.includes("relation") || cls.includes("messageLine")) {
        el.setAttribute("stroke", "#000000");
        if (el.getAttribute("fill") && el.getAttribute("fill") !== "none") el.setAttribute("fill", "none");
      } else {
        if (el.hasAttribute("fill") && el.getAttribute("fill") !== "none") el.setAttribute("fill", "none");
        if (style.fill && style.fill !== "none") style.fill = "none";
        if (el.hasAttribute("stroke") || ["rect", "polygon", "circle", "ellipse"].includes(tag)) {
          el.setAttribute("stroke", "#000000");
        }
      }
    }
  });
  root.querySelectorAll("text, tspan, .nodeLabel, .edgeLabel, .label, foreignObject, foreignObject *").forEach((el) => {
    if (el.style) {
      el.style.color = "#000000";
      el.style.fill = "#000000";
      el.style.background = "transparent";
      el.style.backgroundColor = "transparent";
      el.style.boxShadow = "none";
      el.style.textShadow = "none";
    }
    if (el.setAttribute && el.hasAttribute && el.hasAttribute("fill")) el.setAttribute("fill", "#000000");
  });
  if (root.tagName && root.tagName.toLowerCase() === "svg") {
    root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    root.style.background = "transparent";
    root.removeAttribute("style"); // clear any leftover bg; re-apply transparent
    root.style.background = "transparent";
  }
}

function getSvgElement() {
  return document.querySelector("#diagram svg");
}

function applyDiagramWidth(px) {
  const n = Math.max(240, Math.min(2400, Number(px) || 720));
  document.documentElement.style.setProperty("--diagram-width", n + "px");
  const num = document.getElementById("width-num");
  const range = document.getElementById("width-range");
  if (num && String(num.value) !== String(n)) num.value = String(n);
  if (range && String(range.value) !== String(n)) range.value = String(n);
  try { localStorage.setItem("tryme-diagram-width", String(n)); } catch (_) {}
  return n;
}

function serializeSvg() {
  const svg = getSvgElement();
  if (!svg) throw new Error("SVG not ready");
  const clone = svg.cloneNode(true);
  forceBlackInkTransparentBg(clone);
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  // Ensure no opaque background in export
  clone.style.background = "transparent";
  clone.querySelectorAll("rect.bw-bg").forEach((el) => el.remove());
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadSvg(filename) {
  const status = document.getElementById("status");
  try {
    downloadBlob(new Blob([serializeSvg()], { type: "image/svg+xml;charset=utf-8" }), filename);
    if (status) status.textContent = "SVG saved: " + filename;
  } catch (err) {
    if (status) status.textContent = "SVG export failed: " + err.message;
    console.error(err);
  }
}

function copySvg() {
  const status = document.getElementById("status");
  navigator.clipboard.writeText(serializeSvg()).then(
    () => { if (status) status.textContent = "SVG copied to clipboard"; },
    (err) => { if (status) status.textContent = "Copy SVG failed: " + err; }
  );
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const bin = atob(parts[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** Rasterize via DOM capture — avoids tainted-canvas from Mermaid foreignObject / SVG-as-Image. */
async function diagramToPngBlob(pixelRatio) {
  const node = document.getElementById("diagram");
  if (!node || !getSvgElement()) throw new Error("SVG not ready");
  if (typeof htmlToImage === "undefined" || !htmlToImage.toPng) {
    throw new Error("html-to-image failed to load");
  }
  // Re-apply ink styles right before capture
  forceBlackInkTransparentBg(getSvgElement());
  const dataUrl = await htmlToImage.toPng(node, {
    backgroundColor: null,
    pixelRatio: pixelRatio || 2,
    cacheBust: true,
    style: { background: "transparent", backgroundColor: "transparent" }
  });
  return dataUrlToBlob(dataUrl);
}

async function downloadPng(filename) {
  const status = document.getElementById("status");
  try {
    if (status) status.textContent = "Rendering PNG…";
    const blob = await diagramToPngBlob(2);
    downloadBlob(blob, filename);
    if (status) status.textContent = "PNG saved: " + filename;
  } catch (err) {
    if (status) status.textContent = "PNG export failed: " + err.message;
    console.error(err);
  }
}

async function copyPng() {
  const status = document.getElementById("status");
  try {
    if (status) status.textContent = "Copying PNG…";
    const blob = await diagramToPngBlob(2);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    if (status) status.textContent = "PNG copied to clipboard";
  } catch (err) {
    if (status) status.textContent = "Copy PNG failed: " + err.message;
    console.error(err);
  }
}

function setExportEnabled(on) {
  ["btn-svg", "btn-copy-svg", "btn-png", "btn-copy-png"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = !on;
  });
}

async function paintDefinition(definition) {
  const status = document.getElementById("status");
  setExportEnabled(false);
  if (status) status.textContent = "Rendering…";
  mermaid.initialize(BW_THEME);
  const el = document.getElementById("diagram");
  const id = "bw-diagram-" + Date.now();
  const { svg } = await mermaid.render(id, definition);
  el.innerHTML = svg;
  forceBlackInkTransparentBg(getSvgElement());
  setExportEnabled(true);
}

function copyMermaid() {
  const status = document.getElementById("status");
  let src = "";
  if (typeof window.getMermaidSource === "function") {
    src = window.getMermaidSource() || "";
  } else if (typeof SOURCE === "string") {
    src = SOURCE;
  } else if (typeof SOURCES === "object" && SOURCES && window.ACTIVE_VIEW) {
    src = SOURCES[window.ACTIVE_VIEW] || "";
  }
  if (!src) {
    if (status) status.textContent = "No Mermaid source to copy";
    return;
  }
  navigator.clipboard.writeText(src).then(
    () => { if (status) status.textContent = "Mermaid copied — paste into Draw.io (Arrange → Insert → Advanced → Mermaid)"; },
    (err) => { if (status) status.textContent = "Copy Mermaid failed: " + err; }
  );
}

function wireControls() {
  let saved = 720;
  try {
    const v = localStorage.getItem("tryme-diagram-width");
    if (v) saved = Number(v) || 720;
  } catch (_) {}
  applyDiagramWidth(saved);

  const range = document.getElementById("width-range");
  const num = document.getElementById("width-num");
  if (range) range.addEventListener("input", () => applyDiagramWidth(range.value));
  if (num) {
    num.addEventListener("change", () => applyDiagramWidth(num.value));
    num.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyDiagramWidth(num.value);
    });
  }

  document.getElementById("btn-svg").addEventListener("click", () => {
    downloadSvg(window.SVG_FILENAME || "diagram.svg");
  });
  document.getElementById("btn-copy-svg").addEventListener("click", copySvg);
  document.getElementById("btn-png").addEventListener("click", () => {
    const name = (window.PNG_FILENAME || (window.SVG_FILENAME || "diagram.svg").replace(/\.svg$/i, ".png"));
    downloadPng(name);
  });
  document.getElementById("btn-copy-png").addEventListener("click", () => {
    copyPng();
  });
  const btnMermaid = document.getElementById("btn-copy-mermaid");
  if (btnMermaid) btnMermaid.addEventListener("click", copyMermaid);
}

// Back-compat alias used by older page boots
function wireExportButtons() { wireControls(); }
"""


def shell(
    title: str,
    subtitle: str,
    footer: str,
    actions_extra: str,
    body_scripts: str,
    *,
    extra_css: str = "",
    default_width: int = 720,
) -> str:
    width_ctrl = (
        '      <label class="ctrl">Width '
        f'<input type="range" id="width-range" min="240" max="1800" step="20" value="{default_width}" />'
        f'<input type="number" id="width-num" min="240" max="2400" step="10" value="{default_width}" />'
        " px</label>\n"
    )
    style_block = CSS + (f"\n{extra_css.strip()}\n" if extra_css.strip() else "")
    parts = [
        "<!DOCTYPE html>",
        '<html lang="en">',
        "<head>",
        '  <meta charset="UTF-8" />',
        '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
        f"  <title>{title} — TryMe (B&amp;W)</title>",
        f"  <style>{style_block}</style>",
        "</head>",
        "<body>",
        "  <header>",
        "    <div>",
        f"      <h1>{title}</h1>",
        f'      <p class="meta">{subtitle}</p>',
        "    </div>",
        '    <div class="actions">',
        actions_extra.rstrip("\n"),
        width_ctrl.rstrip("\n"),
        '      <button type="button" id="btn-svg" disabled>Save SVG</button>',
        '      <button type="button" id="btn-copy-svg" disabled>Copy SVG</button>',
        '      <button type="button" id="btn-png" disabled>Save PNG</button>',
        '      <button type="button" id="btn-copy-png" disabled>Copy PNG</button>',
        '      <button type="button" id="btn-copy-mermaid">Copy Mermaid</button>',
        '      <button type="button" id="btn-rerender">Re-render</button>',
        '      <span class="status" id="status">Loading Mermaid…</span>',
        "    </div>",
        "  </header>",
        "  <main>",
        '    <div id="diagram-frame"><div id="diagram"></div></div>',
        "  </main>",
        f"  <footer>{footer}</footer>",
        f'  <script src="{MERMAID_CDN}"></script>',
        f'  <script src="{HTML_TO_IMAGE_CDN}"></script>',
        "  <script>",
        HELPERS_JS,
        body_scripts,
        "  </script>",
        "</body>",
        "</html>",
        "",
    ]
    return "\n".join(parts)


USER_FLOW = r"""
flowchart LR
    Ref["User Reference Photo"]
    Garment["Garment Image"]
    Engine["TryMe Engine"]
    Preview["Virtual Preview"]
    Ref --> Engine
    Garment --> Engine
    Engine --> Preview
"""

USE_CASE = r"""
flowchart LR
    %% REFERENCE ONLY for Copy Mermaid → Draw.io.
    %% Defense deliverable is docs/diagrams/drawio/tryme-use-case-diagram.drawio
    %% (umlActor stick figures, ellipses, one boundary, no nested boxes).

    Guest(("Guest"))
    Customer(("Customer"))
    Customer -.->|generalization| Guest

    subgraph TryMe["TryMe System"]
        direction LR
        UC1(["Browse Catalog"])
        UC2(["Trigger Virtual Try-On"])
        UC3(["Fallback Circuit Breaker"])
        UC4(["Register / Sign In"])
        UC5(["Manage Cart"])
        UC6(["Checkout COD"])
        UC7(["Track Orders"])
        UC8(["Manage Products"])
        UC9(["View Store Analytics"])
        UC10(["Manage Users & Roles"])
        UC11(["System Configuration"])
    end

    Merchant(("Merchant"))
    Admin(("Admin"))
    SuperAdmin(("Super Admin"))

    Guest --- UC1
    Guest --- UC2
    Guest --- UC4

    Customer --- UC5
    Customer --- UC6
    Customer --- UC7

    UC8 --- Merchant
    UC9 --- Merchant
    UC10 --- Admin
    UC11 --- SuperAdmin

    UC6 -.->|<<include>>| UC5
    UC3 -.->|<<extend>>| UC2
"""

# PowerPoint slot: 4.11 in tall × 11 in wide (H×W) — CSS aspect-ratio is width/height
USE_CASE_SLIDE_CSS = """
#diagram-frame {
  width: var(--diagram-width, 1100px);
  max-width: 100%;
  height: auto;
  aspect-ratio: 11 / 4.11;
  max-height: none;
  overflow: hidden;
  background: transparent;
}
#diagram {
  width: 100%;
  height: 100%;
  background: transparent;
}
#diagram svg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent !important;
}
"""

ACTIVITY = r"""
flowchart TB
    subgraph UserLane["User"]
        U0(( ))
        U1([Browse / filter catalog])
        U2([Try on a product])
        U3([Add to cart])
        U4([Checkout COD + address])
        U5([Track order / write review])
        U6((( )))
    end
    subgraph Frontend["Next.js Frontend"]
        F1[Load catalog useProducts]
        F2[TryOnModal POST /api/try-on]
        F3[Show Live / Fallback badge]
        F4[useCart / addresses]
        F5[POST /api/checkout]
        F6[OrdersPanel / review form]
    end
    subgraph Middleware["Edge Middleware"]
        MW1{Authenticated?}
        MW2{Has permission?}
    end
    subgraph API["Route Handlers"]
        R1[GET /api/products]
        R2[Try-on + guest limit]
        R3[Cart routes]
        R4[Checkout route]
        R5[Orders / reviews API]
    end
    subgraph Server["Server Services"]
        S1[ProductService]
        S2[TryOnService + Circuit Breaker]
        S3[CartService]
        S4[OrderService.checkout]
        S5[ReviewService]
    end
    subgraph External["External Services"]
        E1[(MongoDB)]
        E2[ImgBB]
        E3[VTO API SSE]
        E4[Fallback cache]
    end
    U0 --> U1 --> F1 --> R1 --> S1 --> E1
    U1 --> U2 --> F2 --> MW1
    MW1 -->|Guest| R2
    MW1 -->|Auth| MW2 --> R2
    R2 --> S2
    S2 --> E2
    S2 --> E3
    S2 -->|timeout or error| E4
    S2 --> F3
    U2 --> U3 --> F4 --> MW2 --> R3 --> S3 --> E1
    U3 --> U4 --> F5 --> R4 --> S4
    S4 --> S3
    S4 --> E1
    U4 --> U5 --> F6 --> R5 --> S5 --> E1
    U5 --> U6
"""

# PowerPoint slot: 4.11 in tall × 11 in wide (same as use-case) — CSS aspect-ratio is width/height
ACTIVITY_SLIDE_CSS = """
#diagram-frame {
  width: var(--diagram-width, 1100px);
  max-width: 100%;
  height: auto;
  aspect-ratio: 11 / 4.11;
  max-height: none;
  overflow: hidden;
  background: transparent;
}
#diagram {
  width: 100%;
  height: 100%;
  background: transparent;
}
#diagram svg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent !important;
}
"""

COMPONENT = r"""
graph TB
    subgraph Client["Client Layer src/app + src/features"]
        Pages["App Router Pages<br/>public, auth, dashboard, settings"]
        Features["Feature Modules<br/>products, try-on, cart, orders"]
        SharedUI["Shared UI and Hooks<br/>Button, GlassCard, useAuth, useT"]
        Middleware["Edge Middleware<br/>JWT + RBAC route guard"]
    end
    subgraph API["API Layer src/app/api"]
        AuthRoutes["/api/auth/*<br/>NextAuth + register + SSE events"]
        ProductRoutes["/api/products/*"]
        TryOnRoutes["/api/try-on/*"]
        CartRoutes["/api/cart · /api/checkout"]
        OrderRoutes["/api/orders/*"]
        UserRoutes["/api/users · /api/merchants"]
        SystemRoutes["/api/system · /api/dashboard · /api/health"]
    end
    subgraph Server["Server Layer src/server/features"]
        AuthSvc["auth.service"]
        ProductSvc["product.service"]
        TryOnSvc["try-on.service"]
        CartSvc["cart.service"]
        OrderSvc["order.service"]
        MerchantSvc["merchant.service"]
        ReviewSvc["review.service"]
        AddressSvc["address.service"]
        UploadSvc["upload.service"]
        DashboardSvc["dashboard.service"]
        SystemSvc["system-config.service"]
        CB["Circuit Breaker<br/>VTO timeout"]
        VTOClient["VTO API Client<br/>SSE /call/tryon"]
        ImgBBClient["ImgBB Client"]
        Fallback["Fallback Cache<br/>local image"]
        Repos["Repositories<br/>Mongoose models"]
    end
    subgraph External["External Services"]
        MongoDB[("MongoDB")]
        ImgBB["ImgBB API"]
        VTO["IDM-VTON<br/>Hugging Face Space"]
        Google["Google OAuth"]
    end
    Pages --> Features
    Features --> SharedUI
    Middleware --> Pages
    Features -->|"fetch /api/*"| AuthRoutes
    Features --> ProductRoutes
    Features --> TryOnRoutes
    Features --> CartRoutes
    Features --> OrderRoutes
    Features --> UserRoutes
    Features --> SystemRoutes
    AuthRoutes --> AuthSvc
    ProductRoutes --> ProductSvc
    TryOnRoutes --> TryOnSvc
    CartRoutes --> CartSvc
    CartRoutes --> OrderSvc
    OrderRoutes --> OrderSvc
    UserRoutes --> AuthSvc
    UserRoutes --> MerchantSvc
    SystemRoutes --> DashboardSvc
    SystemRoutes --> SystemSvc
    AuthSvc --> Repos
    ProductSvc --> Repos
    TryOnSvc --> UploadSvc
    TryOnSvc --> ProductSvc
    TryOnSvc --> CB
    CartSvc --> Repos
    OrderSvc --> Repos
    MerchantSvc --> Repos
    ReviewSvc --> Repos
    AddressSvc --> Repos
    Repos --> MongoDB
    UploadSvc --> ImgBBClient
    ImgBBClient --> ImgBB
    CB --> VTOClient
    CB -->|"timeout / HTTP error"| Fallback
    VTOClient --> VTO
    AuthSvc --> Google
"""

ER = r"""
erDiagram
    USER ||--o| MERCHANT : "owns via merchantId"
    USER ||--|| CART : has
    USER ||--o{ ORDER : places
    USER ||--o{ ADDRESS : stores
    USER ||--o{ REVIEW : writes
    USER ||--o{ TRYON_HISTORY : records
    MERCHANT ||--o{ PRODUCT : lists
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--o{ TRYON_HISTORY : used_in
    ORDER ||--o{ REVIEW : eligible_for
    USER {
        ObjectId id PK
        string email
        string passwordHash
        string name
        string role
        ObjectId merchantId FK
        string status
    }
    MERCHANT {
        ObjectId id PK
        string name
        ObjectId ownerId FK
        string status
    }
    PRODUCT {
        ObjectId id PK
        string name
        number price
        string category
        string imageUrl
        ObjectId merchantId FK
        boolean inStock
        number stockQuantity
    }
    CART {
        ObjectId id PK
        ObjectId userId FK
        array items
    }
    ORDER {
        ObjectId id PK
        ObjectId userId FK
        string orderNumber
        string status
        number total
    }
    ADDRESS {
        ObjectId id PK
        ObjectId userId FK
        string street
        boolean isDefault
    }
    REVIEW {
        ObjectId id PK
        ObjectId userId FK
        ObjectId productId FK
        ObjectId orderId FK
        number rating
        string comment
    }
    TRYON_HISTORY {
        ObjectId id PK
        ObjectId userId FK
        ObjectId productId FK
        string compositeImageUrl
        boolean fromFallback
    }
    SYSTEM_CONFIG {
        ObjectId id PK
        boolean maintenanceMode
        number guestTryOnLimit
    }
"""

CLASS = r"""
classDiagram
    direction TB
    class User {
        <<Mongoose Model>>
        +String email
        +String passwordHash
        +String name
        +UserRole role
        +ObjectId merchantId
        +UserStatus status
    }
    class Product {
        <<Mongoose Model>>
        +String name
        +Number price
        +ProductCategory category
        +String imageUrl
        +Boolean inStock
        +Number stockQuantity
        +ObjectId merchantId
    }
    class Merchant {
        <<Mongoose Model>>
        +String name
        +ObjectId ownerId
        +MerchantStatus status
    }
    class Cart {
        <<Mongoose Model>>
        +ObjectId userId
        +CartItem[] items
    }
    class Order {
        <<Mongoose Model>>
        +ObjectId userId
        +String orderNumber
        +OrderStatus status
        +Number total
    }
    class Address {
        <<Mongoose Model>>
        +ObjectId userId
        +String street
        +Boolean isDefault
    }
    class Review {
        <<Mongoose Model>>
        +ObjectId userId
        +ObjectId productId
        +ObjectId orderId
        +Number rating
    }
    class TryOnHistory {
        <<Mongoose Model>>
        +ObjectId userId
        +ObjectId productId
        +String compositeImageUrl
        +Boolean fromFallback
    }
    class SystemConfig {
        <<Mongoose Model>>
        +Boolean maintenanceMode
        +Number guestTryOnLimit
    }
    class UserRepository {
        +findById(id) User
        +findByEmail(email) User
        +create(data) User
    }
    class ProductRepository {
        +findAll(filters) Product[]
        +findById(id) Product
        +create(data) Product
    }
    class CartRepository {
        +findByUserId(userId) Cart
        +upsert(userId, items) Cart
    }
    class OrderRepository {
        +findByUserId(userId) Order[]
        +create(data) Order
        +updateStatus(id, status) Order
    }
    class TryOnHistoryRepository {
        +findByUserId(userId) TryOnHistory[]
        +create(data) TryOnHistory
    }
    class AuthService {
        +register(data) User
        +validateCredentials(email, password) User
    }
    class ProductService {
        +getProducts(filters) Product[]
        +getProductById(id) Product
    }
    class TryOnService {
        +processTryOn(file, productId, userId) TryOnResponse
    }
    class CartService {
        +getCart(userId) Cart
        +addItem(userId, item) Cart
    }
    class OrderService {
        +checkout(userId, address) Order
        +updateStatus(id, status) Order
    }
    class UploadService {
        +uploadUserImage(file) String
        +uploadImageFromSource(url) String
    }
    class TryOnHistoryService {
        +saveHistory(userId, result) TryOnHistory
        +getHistory(userId) TryOnHistory[]
    }
    class CircuitBreaker {
        -Number timeoutMs
        +execute(operation) CircuitBreakerResult
    }
    class VtoApiClient {
        +generateTryOn(userUrl, garmentUrl) VtoResult
    }
    class ImgBBClient {
        +uploadImage(buffer, filename) String
    }
    class FallbackCache {
        +getFallbackResult() VtoResult
    }
    UserRepository --> User
    ProductRepository --> Product
    CartRepository --> Cart
    OrderRepository --> Order
    TryOnHistoryRepository --> TryOnHistory
    AuthService --> UserRepository
    ProductService --> ProductRepository
    TryOnService --> ProductService
    TryOnService --> UploadService
    TryOnService --> CircuitBreaker
    TryOnService --> TryOnHistoryService
    CartService --> CartRepository
    OrderService --> OrderRepository
    OrderService --> CartService
    UploadService --> ImgBBClient
    CircuitBreaker --> VtoApiClient
    CircuitBreaker --> FallbackCache
    TryOnHistoryService --> TryOnHistoryRepository
    User "1" --> "0..1" Merchant : merchantId
    User "1" --> "1" Cart : userId
    User "1" --> "*" Order : userId
    Merchant "1" --> "*" Product : merchantId
    User "1" --> "*" TryOnHistory : userId
    Product "1" --> "*" TryOnHistory : productId
"""

FOOTER = (
    "TryMe — Sonargaon University. Black ink on <strong>transparent</strong> background (checkerboard is preview-only). "
    "Adjust <strong>Width</strong>, then Save/Copy SVG or PNG for slide embedding."
)


def single_page(
    title: str,
    subtitle: str,
    svg_name: str,
    source: str,
    *,
    extra_css: str = "",
    default_width: int = 720,
) -> str:
    # Use JSON-ish embedding via text/plain script tags to avoid JS escaping issues
    return shell(
        title,
        subtitle,
        FOOTER,
        "",
        f"""
const SOURCE = {source!r};
window.SVG_FILENAME = {svg_name!r};
window.PNG_FILENAME = {svg_name!r}.replace('.svg', '.png');

async function renderDiagram() {{
  await paintDefinition(SOURCE);
  const status = document.getElementById("status");
  if (status) status.textContent = "Ready — set width, then Save SVG/PNG";
}}

wireExportButtons();
applyDiagramWidth({default_width});
document.getElementById("btn-rerender").addEventListener("click", () => renderDiagram().catch(console.error));
renderDiagram().catch((err) => {{
  const status = document.getElementById("status");
  if (status) status.textContent = "Render error: " + err.message;
  console.error(err);
}});
""",
        extra_css=extra_css,
        default_width=default_width,
    )


def dual_page() -> str:
    er_class_css = """
#diagram-frame {
  width: var(--diagram-width, 1100px);
  max-width: 100%;
  height: auto;
  aspect-ratio: 11 / 4.11;
  max-height: none;
  overflow: hidden;
  background: transparent;
}
#diagram {
  width: 100%;
  height: 100%;
  background: transparent;
}
#diagram svg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent !important;
}
"""
    return shell(
        "ER / Class Diagram",
        "Defense: Draw.io files — Mermaid is a sketch. Toggle ER / Class view.",
        FOOTER
        + " Toggle <strong>ER View</strong> or <strong>Class View</strong>. Prefer "
        + "<code>docs/diagrams/drawio/tryme-er-diagram.drawio</code> / "
        + "<code>drawio/tryme-class-diagram.drawio</code> for slides.",
        """
      <button type="button" id="btn-er" class="active">ER View</button>
      <button type="button" id="btn-class">Class View</button>
""",
        f"""
const SOURCES = {{
  er: {ER!r},
  class: {CLASS!r}
}};
const FILENAMES = {{
  er: "tryme-er-diagram.svg",
  class: "tryme-class-diagram.svg"
}};
const PNG_FILENAMES = {{
  er: "tryme-er-diagram.png",
  class: "tryme-class-diagram.png"
}};
window.ACTIVE_VIEW = "er";
window.SVG_FILENAME = FILENAMES.er;
window.PNG_FILENAME = PNG_FILENAMES.er;

async function renderDiagram() {{
  await paintDefinition(SOURCES[window.ACTIVE_VIEW]);
  window.SVG_FILENAME = FILENAMES[window.ACTIVE_VIEW];
  window.PNG_FILENAME = PNG_FILENAMES[window.ACTIVE_VIEW];
  const status = document.getElementById("status");
  if (status) status.textContent = "Ready — " + (window.ACTIVE_VIEW === "class" ? "Class" : "ER") + " view";
}}

function setView(view) {{
  window.ACTIVE_VIEW = view;
  document.getElementById("btn-er").classList.toggle("active", view === "er");
  document.getElementById("btn-class").classList.toggle("active", view === "class");
  renderDiagram().catch(console.error);
}}

wireExportButtons();
applyDiagramWidth(1100);
document.getElementById("btn-er").addEventListener("click", () => setView("er"));
document.getElementById("btn-class").addEventListener("click", () => setView("class"));
document.getElementById("btn-rerender").addEventListener("click", () => renderDiagram().catch(console.error));
renderDiagram().catch((err) => {{
  const status = document.getElementById("status");
  if (status) status.textContent = "Render error: " + err.message;
  console.error(err);
}});
""",
        extra_css=er_class_css,
        default_width=1100,
    )


SPIRAL_PAGE_JS = r"""
window.SVG_FILENAME = "tryme-spiral-model-diagram.svg";
window.PNG_FILENAME = "tryme-spiral-model-diagram.png";

function buildSpiralSvg() {
  const W = 1200;
  const H = 1000;
  const cx = 520;
  const cy = 520;
  const turns = 4;
  const maxTheta = turns * 2 * Math.PI;
  const r0 = 36;
  const r1 = 280;
  const font = "Segoe UI, Calibri, Arial, sans-serif";

  const parts = [];
  const N = 900;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * maxTheta;
    const r = r0 + (r1 - r0) * (t / maxTheta);
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    parts.push((i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2));
  }
  const spiralD = parts.join(" ");

  const spiralNames = [
    "S1  Prototype / Circuit Breaker",
    "S2  Auth / RBAC",
    "S3  Commerce",
    "S4  Polish / Deploy"
  ];
  const markers = [];
  for (let k = 1; k <= turns; k++) {
    // Top of each loop — open arc, clear of dense windings
    const t = 2 * Math.PI * k - Math.PI / 2;
    const r = r0 + (r1 - r0) * (t / maxTheta);
    const mx = cx + r * Math.cos(t);
    const my = cy + r * Math.sin(t);
    markers.push({
      k: k,
      name: spiralNames[k - 1],
      x: mx,
      y: my,
      // Iteration labels in Planning-zone whitespace, past outer spiral
      lx: 820,
      ly: my + 8
    });
  }

  const markerSvg = markers.map(function (m) {
    return (
      '<circle cx="' + m.x.toFixed(1) + '" cy="' + m.y.toFixed(1) + '" r="16" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>' +
      '<text x="' + m.x.toFixed(1) + '" y="' + (m.y + 8).toFixed(1) + '" text-anchor="middle" font-family="' + font + '" font-size="22" font-weight="700" fill="#000000">' + m.k + "</text>" +
      '<text x="' + m.lx.toFixed(1) + '" y="' + m.ly.toFixed(1) + '" text-anchor="start" font-family="' + font + '" font-size="28" font-weight="700" fill="#000000">' + m.name + "</text>"
    );
  }).join("");

  // Quadrant labels near spiral (not canvas corners), zone-aligned anchors
  const q = [
    { x: 720, y: 175, t: "1. Planning", a: "start" },
    { x: 320, y: 175, t: "2. Risk Analysis", a: "end" },
    { x: 320, y: 870, t: "3. Engineering", a: "end" },
    { x: 720, y: 870, t: "4. Evaluation / Review", a: "start" }
  ];
  const quadSvg = q.map(function (item) {
    return '<text x="' + item.x + '" y="' + item.y + '" text-anchor="' + item.a + '" font-family="' + font + '" font-size="34" font-weight="700" fill="#000000">' + item.t + "</text>";
  }).join("");

  const axisLen = 340;
  const topY = cy - axisLen;
  const leftX = cx - axisLen;
  const midUpperY = (topY + cy) / 2;

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" style="background:transparent">' +
    "<defs>" +
    '<marker id="arrowHead" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">' +
    '<path d="M0,0 L12,5 L0,10 Z" fill="#000000"/>' +
    "</marker>" +
    "</defs>" +
    '<line x1="' + leftX + '" y1="' + cy + '" x2="' + (cx + axisLen) + '" y2="' + cy + '" stroke="#000000" stroke-width="2.5" marker-end="url(#arrowHead)"/>' +
    '<line x1="' + cx + '" y1="' + (cy + axisLen) + '" x2="' + cx + '" y2="' + topY + '" stroke="#000000" stroke-width="2.5" marker-end="url(#arrowHead)"/>' +
    '<text x="' + (cx + axisLen) + '" y="' + (cy + 48) + '" text-anchor="end" font-family="' + font + '" font-size="28" font-weight="700" fill="#000000">Cumulative cost →</text>' +
    '<text transform="rotate(-90 ' + (cx - 40) + " " + midUpperY + ')" text-anchor="middle" font-family="' + font + '" font-size="28" font-weight="700" fill="#000000">Progress through cycles →</text>' +
    '<text x="' + leftX + '" y="' + (cy + 48) + '" font-family="' + font + '" font-size="26" fill="#000000">← start</text>' +
    '<line x1="' + (cx - 250) + '" y1="' + (cy - 250) + '" x2="' + (cx + 250) + '" y2="' + (cy + 250) + '" stroke="#000000" stroke-width="1.5" stroke-dasharray="6 6"/>' +
    '<line x1="' + (cx - 250) + '" y1="' + (cy + 250) + '" x2="' + (cx + 250) + '" y2="' + (cy - 250) + '" stroke="#000000" stroke-width="1.5" stroke-dasharray="6 6"/>' +
    '<path d="' + spiralD + '" fill="none" stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    quadSvg +
    markerSvg +
    "</svg>"
  );
}

function renderDiagram() {
  const status = document.getElementById("status");
  const el = document.getElementById("diagram");
  el.innerHTML = buildSpiralSvg();
  forceBlackInkTransparentBg(getSvgElement());
  setExportEnabled(true);
  if (status) status.textContent = "Ready — set width, then Save SVG/PNG";
}

wireExportButtons();
document.getElementById("btn-rerender").addEventListener("click", function () {
  try { renderDiagram(); } catch (err) { console.error(err); }
});
try {
  applyDiagramWidth(900);
  renderDiagram();
} catch (err) {
  const status = document.getElementById("status");
  if (status) status.textContent = "Render error: " + err.message;
  console.error(err);
}
"""



def spiral_page() -> str:
    """Boehm-style spiral with axes — custom SVG (Mermaid cannot draw this well)."""
    return shell(
        "Spiral Model — SDLC",
        "TryMe evolutionary prototyping — 4 delivered spirals (Boehm spiral with axes)",
        FOOTER
        + " Custom geometric spiral (not Mermaid). Same export controls apply.",
        "",
        SPIRAL_PAGE_JS,
    )


def main():
    files = {
        # spiral-model-diagram.html is HAND-MAINTAINED (inline SVG).
        # Regenerate it with: python docs/scripts/write_spiral_html.py
        # Do NOT generate it here — Mermaid cannot draw spirals.
        "user-flow-diagram.html": single_page(
            "The TryMe Solution & User Flow",
            "High-level virtual try-on path — guest 3/hr, then authenticated conversion",
            "tryme-user-flow-diagram.svg",
            USER_FLOW.strip(),
        ),
        "use-case-diagram.html": single_page(
            "Use Case Diagram",
            "Draw.io is the defense deliverable — Mermaid sketch only (one boundary; Copy Mermaid)",
            "tryme-use-case-diagram.svg",
            USE_CASE.strip(),
            extra_css=USE_CASE_SLIDE_CSS,
            default_width=1100,
        ),
        "activity-swimlane-diagram.html": single_page(
            "Activity / Swimlane Diagram",
            "Defense deliverable is Draw.io — Mermaid is a sketch (Copy Mermaid available)",
            "tryme-activity-swimlane-diagram.svg",
            ACTIVITY.strip(),
            extra_css=ACTIVITY_SLIDE_CSS,
            default_width=1100,
        ),
        "component-diagram.html": single_page(
            "Component Diagram",
            "Unified Next.js 15 App Router — Client, API, Server, External",
            "tryme-component-diagram.svg",
            COMPONENT.strip(),
        ),
        "er-class-diagram.html": dual_page(),
    }
    for name, html in files.items():
        path = OUT / name
        path.write_text(html, encoding="utf-8")
        print(f"Wrote {path}")

    (OUT / "README.md").write_text(
        """# Black-and-White Diagram HTML Exports

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
""",
        encoding="utf-8",
    )
    print(f"Wrote {OUT / 'README.md'}")


if __name__ == "__main__":
    main()
