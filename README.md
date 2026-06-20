# FlowForge ERP — Intelligent Manufacturing ERP

A production-quality Mini ERP system built for a furniture manufacturing company to replace spreadsheets, WhatsApp messages, and paper records.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Full-stack | Next.js 15 (App Router + TypeScript) |
| Database | Supabase PostgreSQL |
| ORM | Prisma |
| Auth | JWT (Access + Refresh Tokens, httpOnly cookies) |
| Styling | Tailwind CSS |
| API Client | Axios |

## Business Flow

```
Customer Order → Stock Check → Shortage Detection → Procurement Decision
→ Manufacturing Order → Raw Material Reservation → Production
→ Inventory Update → Delivery → Audit Logging
```

## Modules

- **Authentication** — JWT login, role-based access control
- **Products** — Catalog with pricing, stock levels, procurement strategy
- **Sales Orders** — Create orders, validate stock, reserve inventory, trigger procurement
- **Purchase Orders** — Procure raw materials, receive shipments
- **Bill of Materials (BoM)** — Define product recipes
- **Manufacturing** — Production orders, consume components, produce finished goods
- **Inventory** — Full stock ledger with movement history
- **Audit Logs** — Immutable action trail
- **Dashboard** — Executive KPIs, low-stock alerts, order traceability

## Roles

- `admin` — Full access
- `sales` — Sales orders, products view
- `purchase` — Purchase orders, supplier management
- `manufacturing` — Manufacturing orders, BoM
- `inventory` — Inventory movements, stock adjustments
- `owner` — Read-only executive dashboard

## Quick Start

### 1. Setup Supabase

Run `database/schema.sql` in your Supabase SQL editor, or use Prisma migrations:

```bash
cd frontend
npm run prisma:migrate
```

### 2. Configure environment

```bash
cd frontend
cp .env.example .env.local   # fill in your values
npm install
```

### 3. Run the app

```bash
npm run dev
```

Open http://localhost:3000

API routes are served at `/api/*` on the same origin — no separate backend server needed.

## Project Structure

```
FlowForge-ERP/
├── database/
│   └── schema.sql
└── frontend/
    ├── app/
    │   ├── api/          # Next.js Route Handlers (API)
    │   └── (pages)/      # UI routes
    ├── lib/
    │   └── server/       # Server-only logic (services, auth, db)
    ├── prisma/           # Schema, migrations, seed
    ├── components/
    ├── services/         # Client-side API clients
    └── hooks/
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed default admin user |
| `npm run prisma:studio` | Open Prisma Studio |
