# TryMe

Full-stack e-commerce web application with **Virtual Try-On (VTO)** as the core feature. Built following the Spiral Model (Evolutionary Prototyping).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Image Storage | ImgBB API |
| AI / VTO | IDM-VTON via Hugging Face Spaces |

## Architecture

- **Feature-based** folder structure (grouped by domain, not file type)
- **Separation of concerns**: Controller → Service → Repository/Client layers
- **Circuit Breaker** on VTO API: 10-second timeout or any HTTP error triggers instant fallback to a local cached composite image

See [docs/diagrams/](docs/diagrams/) for all architecture and project diagrams (Component, Sequence, Use Case, Class, CPM, and Swimlane).

## Project Structure

```
TryMe/
├── backend/
│   ├── cache/                    # Fallback VTO result image
│   ├── scripts/seed-products.js  # MongoDB seed data
│   └── src/features/
│       ├── products/             # Catalog CRUD
│       ├── try-on/               # VTO + Circuit Breaker
│       └── upload/               # ImgBB integration
├── frontend/
│   └── src/features/
│       ├── products/             # Catalog UI
│       └── try-on/               # Upload + result UI
└── docs/
    ├── design.md
    └── diagrams/             # One file per diagram + README index
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)
- [ImgBB API key](https://api.imgbb.com/) (free tier)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your IMGBB_API_KEY and MONGODB_URI
npm install
npm run seed
npm run dev
```

API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Core Workflow

1. User uploads a personal reference image on the frontend
2. Next.js sends the image to `POST /api/try-on`
3. Backend uploads the image to ImgBB and gets a public URL
4. Backend fetches the product garment image from MongoDB
5. Backend sends both URLs to the VTO API (wrapped in Circuit Breaker)
6. On success → composite image returned; on timeout/error → local fallback cache served
7. Frontend displays the result with a `Live` or `Fallback` badge

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List products (`?category=tops`) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/try-on` | Virtual try-on (`userImage` file + `productId`) |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `IMGBB_API_KEY` | ImgBB API key |
| `VTO_API_URL` | Hugging Face Gradio predict endpoint |
| `VTO_TIMEOUT_MS` | Circuit breaker timeout (default 10000) |
| `CORS_ORIGIN` | Frontend origin |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

## Spiral Model Notes

This repository represents **Spiral 1 — Operational Prototype**:

- End-to-end VTO workflow with resilient fallback
- Product catalog with category filtering
- Feature-based architecture ready for subsequent spirals (auth, cart, payments, enhanced VTO)

## License

MIT
