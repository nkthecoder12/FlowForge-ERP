# Shiv Furniture Works — Mini ERP

Production-grade, workflow-driven ERP for **Shiv Furniture Works**, a furniture manufacturing company. Replaces Excel stock tracking, WhatsApp coordination, and paper records with a connected business workflow.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 15 App Router                        │
├──────────────┬──────────────────────────────┬─────────────────────┤
│  React UI    │   TanStack Query + Zustand   │  Route Handlers     │
│  (Pages)     │   (Client State)             │  (/api/*)           │
├──────────────┴──────────────────────────────┴─────────────────────┤
│                        Service Layer                               │
│  auth · users · products · boms · inventory · sales · dashboard  │
│  · audit                                                         │
├───────────────────────────────────────────────────────────────────┤
│              Prisma ORM + PostgreSQL (Supabase)                  │
└─────────────────────────────────────────────────────────────────┘
```

**Core principle:** Every stock change creates an `inventory_movements` record. Every business event writes an `audit_logs` entry. Multi-table workflows use Prisma transactions.

### Module Map

| Module | Purpose |
|--------|---------|
| Authentication | JWT login/logout, role-based access |
| Users | Admin user management |
| Products | Raw material & finished good master data |
| BoM | Component recipes, explosion for shortage analysis |
| Inventory | On-hand, reserved, free qty, ledger |
| Sales | Order lifecycle with stock check & reservation |
| Dashboard | KPIs, alerts, activity trail |
| Audit | Immutable event log |

### Sales Workflow

```
draft → [Confirm] → stock check
                      ├─ all reserved → ready → [Deliver] → delivered
                      └─ shortage     → shortage_detected (+ BoM explosion)
```

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers
- **Database:** Supabase PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (httpOnly cookies)
- **State:** Zustand + TanStack Query

## Quick Start

```bash
cd frontend
cp .env.example .env.local   # configure DATABASE_URL and JWT secrets
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open http://localhost:3000

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shivfurniture.com | Admin@123 |
| Product Manager | ravi@shivfurniture.com | Admin@123 |
| Sales | priya@shivfurniture.com | Admin@123 |
| Inventory | neha@shivfurniture.com | Admin@123 |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/users` | List/create users |
| GET/POST | `/api/products` | Products CRUD |
| GET/POST | `/api/boms` | BoM management |
| POST | `/api/boms/[id]/explode` | BoM explosion |
| GET | `/api/inventory` | Stock balances |
| POST | `/api/inventory/adjust` | Stock adjustment |
| POST | `/api/inventory/reserve` | Manual reservation |
| POST | `/api/inventory/release` | Release reservation |
| GET | `/api/inventory/movements` | Ledger |
| GET/POST | `/api/sales` | Sales orders |
| POST | `/api/sales/[id]/confirm` | Confirm + stock check |
| POST | `/api/sales/[id]/deliver` | Deliver order |
| POST | `/api/sales/[id]/cancel` | Cancel order |
| GET | `/api/dashboard/stats` | Dashboard KPIs |
| GET | `/api/audit` | Audit logs |

## Demo Workflow Walkthrough

1. **Login** as `priya@shivfurniture.com` (Sales)
2. **Dashboard** — see low-stock alerts (Wooden Leg, Wood Screws below minimum)
3. **Products** — review finished goods & raw materials with on-hand/reserved/free qty
4. **BoM** — open "Wooden Dining Table - Standard BoM" (4 legs + 1 top + screws + finish)
5. **Sales → SO-001** — demo order for 20 dining tables (draft)
6. **Confirm SO-001** — system detects shortage (5 available, 15 short), explodes BoM:
   - Wooden Leg: needs 60, has 40 → short 20
   - Wooden Table Top: needs 15, has 12 → short 3
7. **Audit Logs** — see `sales_order_confirmed`, `shortage_detected`, `bom_exploded`
8. **Inventory Ledger** — reservation movements recorded
9. Login as **Neha** (Inventory) → adjust stock → re-confirm order when ready

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/login
│   ├── (dashboard)/     # All ERP pages
│   └── api/             # REST route handlers
├── components/          # UI, layout, forms, tables
├── hooks/               # TanStack Query hooks
├── lib/server/
│   ├── modules/         # Business services
│   └── utils/           # JWT, audit, order numbers
├── prisma/              # Schema, migrations, seed
├── services/            # Client API clients
└── store/               # Zustand auth store
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:seed` | Seed demo data |
| `npm run prisma:studio` | Database browser |
