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

See [docs/diagrams/diagrams.md](docs/diagrams/diagrams.md) for all architecture and project diagrams.

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
    ├── design.md
    └── diagrams/
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
| `VTO_API_URL` | Hugging Face Gradio predict endpoint |
| `VTO_TIMEOUT_MS` | Circuit breaker timeout (default 10000) |
| `AUTH_SECRET` | Auth.js session secret (required) |
| `AUTH_URL` | App URL for Auth.js (default `http://localhost:3000`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Seed MongoDB with sample products |

## Spiral Model Notes

This repository represents **Spiral 1 — Operational Prototype**:

- End-to-end VTO workflow with resilient fallback
- Product catalog with category filtering
- Role-based auth with six roles and role-specific dashboards
- Unified Next.js architecture ready for subsequent spirals (cart, payments, enhanced VTO)

## License

MIT
