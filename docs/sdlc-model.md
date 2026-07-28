# SDLC Model — TryMe

How TryMe was planned, built, and evolved. This document describes the **actual process** followed during development, not a generic textbook model.

---

## Overview

TryMe uses the **Spiral Model** as its Software Development Life Cycle — a risk-driven, iterative **meta-model** that combines controlled Waterfall-style engineering with continuous prototyping feedback. Each loop of the spiral is one full cycle; the spiral grows as cumulative effort increases and scope is validated.

Primary focus: **proactive risk management** before committing to a full feature build (e.g. VTO API resilience in Spiral 1 via Circuit Breaker + fallback). TryMe’s increments follow **evolutionary prototyping**: working software is refined across spirals rather than thrown away.

```mermaid
flowchart LR
    subgraph Spiral["Each Spiral Cycle"]
        direction TB
        PLAN["1. Planning<br/>Objectives and alternatives"]
        RISK["2. Risk Analysis<br/>and Prototyping"]
        ENG["3. Engineering<br/>Product development"]
        REV["4. Evaluation / Review<br/>Plan next cycle"]
        PLAN --> RISK --> ENG --> REV
        REV -->|"Next spiral"| PLAN
    end
```

---

## Spirals Delivered

| Spiral | Name | Outcome |
|--------|------|---------|
| **1** | Operational Prototype | End-to-end VTO workflow, product catalog, circuit-breaker fallback |
| **2** | Auth & RBAC | Auth.js, 6 roles, permissions, role-specific dashboards |
| **3** | Commerce | Cart, checkout (COD), orders, addresses, reviews, merchant ops |
| **4** | Design & Polish | Design system, Astryx-informed UI, settings/i18n, VTO SSE fix, Vercel deploy |

Spirals are **logical delivery increments** (objectives → risks → build → review), not calendar-day estimates. Git history for this repository spans a short commit window (20–21 Jul 2026); the spiral names describe scope order, not multi-week wall-clock durations.

See [project-network-diagram.md](diagrams/project-network-diagram.md) for the CPM schedule used in planning docs.

---

## Process Per Spiral

Each spiral followed the same four-quadrant cycle (Boehm / course meta-model):

### Phase 1 — Planning (Objectives & Alternatives)

- Define what the spiral must deliver (user stories, acceptance criteria).
- Scope is **fixed per spiral** — features outside scope are deferred to the next spiral.
- Explore alternatives and constraints (e.g. free-tier VTO/ImgBB only).
- Example (Spiral 1): "A shopper can browse products and receive a try-on result, even when the VTO API is down."

**How we did it:**
- Started with README requirements and course constraints (free-tier APIs only).
- Used Cursor **Plan Mode** for large features (auth RBAC, design refactor) to agree on scope before coding.
- Documented actors and use cases in [use-case-diagram.md](diagrams/use-case-diagram.md) at spiral start.

### Phase 2 — Risk Analysis & Prototyping

- Identify technical/business risks; prototype the highest-risk part first.
- Spiral 1 risk: VTO API latency, rate limits, and downtime → **Circuit Breaker + Fallback Cache** (evolutionary prototype kept in the product).
- Spiral 2 risk: Role complexity → **Centralized permission matrix** before building dashboards.
- Spiral 4 risk: Hugging Face Gradio upgrade killed sync `/api/predict` → **SSE `/call/tryon` rewrite**.

**How we did it:**
- Built the circuit breaker before the try-on UI.
- Implemented auth guards and middleware before role dashboards.
- When the public VTO Space changed its API, we patched the SSE client and embraced Fallback as a demo feature rather than chasing guaranteed Live results on a free tier.
- Prototyping style: **evolutionary** (refined in place) with occasional **throwaway** spikes; UI explored with low- then higher-fidelity iterations in later spirals.

### Phase 3 — Engineering (Product Development)

- After risks are mitigated, build and test the increment (feature slices can follow a linear path inside the spiral).
- Feature-based vertical slices: model → repository → service → route handler → client hook → UI.
- One commit per logical feature increment.
- Manual end-to-end testing after each slice; no separate QA phase.

**How we did it:**
- Cursor **Agent Mode** for implementation; human review of diffs.
- In-memory MongoDB with auto-seed for zero-setup local dev.
- Demo accounts for every role (password: `TryMe123!`).
- Deployed to Vercel for production validation.

### Phase 4 — Evaluation / Review & Plan Next

- Customer/team evaluates the spiral’s output against objectives.
- Update diagrams and README; plan the next loop from gaps and priorities.

**How we did it:**
- README "Spiral Model Notes" section updated per spiral.
- Diagrams refreshed at project milestones (this document set).
- Deferred items explicitly noted: Stripe payments, enhanced VTO params, automated tests.

---

## Key SDLC Decisions

| Decision | Rationale |
|----------|-----------|
| **Spiral over Waterfall** | VTO API behavior was unknown; needed working prototype before investing in commerce/auth |
| **Spiral over Agile sprints** | Course/project structure maps to discrete deliverable increments, not continuous 2-week sprints |
| **AI-assisted development (Cursor)** | Faster iteration on boilerplate; human owns architecture, scope, and review |
| **Documentation alongside code** | Diagrams created at spiral boundaries, not deferred to end |
| **Deploy early** | Vercel deployment in Spiral 4 caught env/auth issues that localhost hid |
| **Embrace constraints** | Free Hugging Face Space → Fallback is a feature, not a bug |

---

## Tooling & Workflow

```mermaid
flowchart TB
    Plan["Plan Mode<br/>(scope & architecture)"]
    Agent["Agent Mode<br/>(implementation)"]
    Commit["Git commit<br/>(feature increment)"]
    Test["Manual E2E test"]
    Deploy["Vercel deploy"]
    Docs["Update diagrams & docs"]

    Plan --> Agent --> Commit --> Test
    Test -->|"Pass"| Deploy
    Test -->|"Fail"| Agent
    Deploy --> Docs
    Docs -->|"Next spiral"| Plan
```

| Tool | Role in SDLC |
|------|-------------|
| **Cursor IDE** | Primary development environment; Plan + Agent modes |
| **Git** | Version control; one feature per commit |
| **GitHub** | Remote repository |
| **Vercel** | Production deployment and env validation |
| **MongoDB** | Persistent data (in-memory for local dev) |
| **Mermaid** | Architecture and process diagrams in Markdown |
| **ImgBB + Hugging Face** | External service integrations (free tier) |

---

## Spiral Exit Criteria

Each spiral was considered complete when:

1. All planned use cases were functional end-to-end.
2. The app built and ran without errors (`npm run build`).
3. README and diagrams reflected the current architecture.
4. Known risks for the next spiral were identified.

---

## Future Spirals (Planned)

| Spiral | Scope |
|--------|-------|
| **5** | Stripe payment integration, order payment flow |
| **6** | Enhanced VTO (garment category params, multi-angle) |
| **7** | Automated testing (unit + E2E), CI pipeline |
| **8** | Performance optimization, caching strategy |

---

## Related Documents

- [SWE Model](swe-model.md) — Engineering architecture and patterns
- [Diagram Index](diagrams/README.md) — All architecture diagrams
- [Design System](design/design.md) — UI rules and tokens
- [README](../README.md) — Project overview and quick start

[← Documentation index](README.md)
