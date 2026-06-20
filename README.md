# FlowForge ERP — Intelligent Manufacturing ERP

A production-quality Mini ERP system built for a furniture manufacturing company to replace spreadsheets, WhatsApp messages, and paper records.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router + TypeScript) |
| Backend | Node.js + Express |
| Database | Supabase PostgreSQL |
| Auth | JWT (Access + Refresh Tokens) |
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
Run `database/schema.sql` in your Supabase SQL editor.

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local   # fill in your values
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
FlowForge-ERP/
├── database/
│   └── schema.sql
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
└── frontend/
    ├── app/
    ├── components/
    ├── services/
    ├── hooks/
    └── context/
```
