# TryMe

Full-stack e-commerce web application with **Virtual Try-On (VTO)** as the core feature. Built following the Spiral Model (Evolutionary Prototyping).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Database | MongoDB (Mongoose) |
| Image Storage | ImgBB API |
| AI / VTO | IDM-VTON via Hugging Face Spaces |

## Architecture

Unified **Next.js App Router** application — UI and API live in the same codebase. Route Handlers replace a separate Express server; business logic lives in a feature-based server layer under `src/server/`.

- **Feature-based** folder structure (grouped by domain, not file type)
- **Separation of concerns**: Route Handler → Service → Repository/Client layers
- **Circuit Breaker** on VTO API: 10-second timeout or any HTTP error triggers instant fallback to a local cached composite image
- **Shared types** in `src/shared/types/` for end-to-end contracts

See [docs/README.md](docs/README.md) for the full documentation index, [docs/how-it-works.md](docs/how-it-works.md) for a feature walkthrough, [docs/sdlc-model.md](docs/sdlc-model.md) for the Spiral Model lifecycle, and [docs/swe-model.md](docs/swe-model.md) for the software engineering architecture.

## Project Structure

```
TryMe/
├── src/
│   ├── app/              # App Router pages & Route Handlers
│   │   └── api/          # /api/health, /api/products, /api/try-on
│   ├── features/         # Client-side feature modules
│   ├── shared/           # Types, UI components & API client
│   └── server/           # Server-only business logic
│       ├── db/
│       └── features/     # products, try-on, upload
├── cache/                # Fallback VTO result image
├── scripts/seed-products.ts
└── docs/
    ├── README.md           # Documentation index
    ├── how-it-works.md     # Feature walkthrough & user journeys
    ├── sdlc-model.md       # Spiral Model lifecycle
    ├── swe-model.md        # Software engineering architecture
    ├── design/             # Living design system contract
    ├── diagrams/           # Mermaid architecture diagrams
    └── reference/          # Offline AI/reference snapshots
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (optional — in-memory DB is enabled by default)
- [ImgBB API key](https://api.imgbb.com/) (free tier, optional for local dev)

### Setup

```bash
cp .env.example .env.local
# Edit .env.local with your IMGBB_API_KEY and MONGODB_URI if needed

npm install
npm run dev
```

App runs at `http://localhost:3000`. API routes are same-origin at `/api/*`.

For a persistent MongoDB database:

```bash
# Set USE_IN_MEMORY_DB=false in .env.local, then:
npm run seed
```

## Core Workflow

1. User uploads a personal reference image on the frontend
2. Next.js Route Handler receives the image at `POST /api/try-on`
3. Server uploads the image to ImgBB and gets a public URL
4. Server fetches the product garment image from MongoDB
5. Server sends both URLs to the VTO API (wrapped in Circuit Breaker)
6. On success → composite image returned; on timeout/error → local fallback cache served
7. Frontend displays the result with a `Live` or `Fallback` badge

## Authentication & Roles

TryMe uses **Auth.js (NextAuth v5)** with JWT sessions and role-based access control.

| Role | Dashboard | Capabilities |
|------|-----------|--------------|
| Guest | — | Browse catalog, rate-limited try-on (3/hour) |
| Customer | `/dashboard/customer` | Full try-on, saved history, profile |
| Merchant | `/dashboard/merchant` | Manage own products, try-on analytics |
| Support Staff | `/dashboard/support` | User lookup, view try-on history |
| Admin | `/dashboard/admin` | User/merchant management, system health |
| Super Admin | `/dashboard/super-admin` | All roles assignable, system controls |

### Demo accounts (in-memory DB only)

Password for all: `TryMe123!`

| Email | Role |
|-------|------|
| `superadmin@tryme.local` | Super Admin |
| `admin@tryme.local` | Admin |
| `merchant@tryme.local` | Merchant |
| `support@tryme.local` | Support Staff |
| `customer@tryme.local` | Customer |

### Auth routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create customer account |
| `/dashboard` | Redirects to role-specific dashboard |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (Support+ only) |
| GET | `/api/products` | List products (`?category=tops`) |
| POST | `/api/products` | Create product (Merchant/Admin) |
| GET | `/api/products/:id` | Get single product |
| PUT | `/api/products/:id` | Update product (Merchant own / Admin) |
| DELETE | `/api/products/:id` | Delete product (Merchant own / Admin) |
| POST | `/api/try-on` | Virtual try-on (`userImage` file + `productId`) |
| GET | `/api/try-on/history` | Try-on history (own or Support+) |
| POST | `/api/auth/register` | Register customer account |
| GET/POST | `/api/users` | List/create users (Support+/Admin) |
| PATCH | `/api/users/:id` | Update user profile or role |
| GET/PATCH | `/api/merchants` | List/create/update merchants |
| GET | `/api/dashboard/stats` | Platform stats (Support+) |
| GET | `/api/dashboard/merchant-stats` | Merchant product analytics |

## Environment Variables

All configuration lives in `.env.local`:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `USE_IN_MEMORY_DB` | Use in-memory MongoDB with auto-seed (default `true`) |
| `IMGBB_API_KEY` | ImgBB API key |
| `HF_TOKEN` | Hugging Face token (better rate limits / ZeroGPU quota) |
| `VTO_API_URL` | Hugging Face Gradio `/call/tryon` endpoint |
| `VTO_TIMEOUT_MS` | Circuit breaker timeout before fallback (default 300000 = 5 min) |
| `NEXT_PUBLIC_SITE_URL` | Public site origin (default `http://localhost:3000`). Set for deploy and **redeploy** after changing |
| `AUTH_SECRET` | Auth.js session secret (required on Vercel) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth credentials (required for Google sign-in) |
| `AUTH_URL` | Optional; leave unset on Vercel so Auth.js auto-detects the host. Never set to `localhost` in production |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Seed MongoDB with sample products |

## Spiral Model Notes

| Spiral | Focus | Status |
|--------|-------|--------|
| **1 — Operational Prototype** | VTO workflow, product catalog, circuit-breaker fallback | Delivered |
| **2 — Auth & RBAC** | Auth.js, 6 roles, 21 permissions, role dashboards | Delivered |
| **3 — Commerce** | Cart, checkout (COD), orders, addresses, reviews | Delivered |
| **4 — Design & Polish** | Design system, settings/i18n, VTO SSE fix, Vercel deploy | Delivered |

See [docs/sdlc-model.md](docs/sdlc-model.md) for the full SDLC process and [docs/swe-model.md](docs/swe-model.md) for architecture patterns.

## Documentation

Full index: [docs/README.md](docs/README.md)

| Topic | Document |
|-------|----------|
| Product guide | [docs/how-it-works.md](docs/how-it-works.md) |
| SDLC / Spirals | [docs/sdlc-model.md](docs/sdlc-model.md) |
| Engineering model | [docs/swe-model.md](docs/swe-model.md) |
| Diagrams | [docs/diagrams/README.md](docs/diagrams/README.md) |
| Design system | [docs/design/design.md](docs/design/design.md) |

## License

MIT
