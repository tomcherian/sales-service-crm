# Washing Machine Sales & Service Management System

> Project context for AI coding assistants (GitHub Copilot, Claude Code).
> Rename or copy this file as needed:
> - GitHub Copilot: `.github/copilot-instructions.md`
> - Claude Code: `CLAUDE.md` (repo root)
> - GitHub Copilot custom agent: `.github/agents/sales-service-crm-guide.agent.md`

---

## 1. Working Style (IMPORTANT, read first)

The developer is a senior frontend engineer (React, TypeScript) with **average Node.js knowledge**. The goal is to ship the app with clear, usable code; the developer will ask follow-up questions in separate sessions when needed.

When working on this project, the assistant should:

1. **Deliver the complete requested scope together.** For Phase 1, provide a complete, coherent set of files the developer can copy into the repository, rather than stopping after each setup step or asking them to fill in skeletons.
2. **Inspect before generating.** Check the current repository state and relevant parts of this plan first. List existing files that would be replaced and preserve unrelated work; do not assume the repository is empty.
3. **Keep the result copy-ready.** Include each file's relative path and its full contents. Keep the file set consistent, TypeScript-only, and within the stated product scope.
4. **Explain decisions concisely.** Briefly clarify important architectural choices, security boundaries, and non-obvious MongoDB/Mongoose behavior, without interrupting the complete delivery with step-by-step pauses.
5. **Prefer clarity over cleverness.** Use readable, conventional code with comments only where the "why" is not obvious.
6. **Point out trade-offs honestly**, especially around authentication, validation, and access control.
7. Include setup, verification steps, and a concise recap after the complete delivery. Follow-up questions can be handled in separate sessions.

---

## 2. Product Overview

A web-based system for a **washing machine exporting company** to manage sales, customers, sites, employees and maintenance. The owner is the **Admin (Captain)**. The product is intended to be **sold later to other companies**, so it is built as a multi-tenant-ready system.

### Business context
- Sells different washing machines: different **make, model, capacity (kg), type**
- Sales are **retail and wholesale**
- Many **salespersons** organised under **team leads**
- Customers have one or more **sites** (installation locations) where machines are installed
- Company provides **maintenance** through plans, e.g. a yearly service charge, with free service visits every 3 months
- Admin wants to see **profit/loss** from both sales and maintenance

### Admin's main focus
1. Sales: which machines sell fast, in which region, and which salespersons sell best
2. Which customer sites generate sales
3. Maintenance plans and their revenue
4. Profit/loss (sales + maintenance)

---

## 3. Roles

| Role | Description | Status |
|---|---|---|
| `admin` | Owner / Captain. Full access. Focus on dashboard and analytics | Build now |
| `team_lead` | Manages a group of salespersons | Details later |
| `salesperson` | Sells machines, manages own customers. Will get a **PWA mobile app** | Details later |
| `maintenance` | Technician performing service visits | Details later |

**Design decisions**
- **Employees** (admin, team lead, salesperson, maintenance) live in **one `users` collection** with a `role` field.
- **Customers are NOT users.** They do not log in. They have their own `customers` collection.

---

## 4. Tech Stack

| Layer | Choice |
|---|---|
| Database | MongoDB + Mongoose |
| Backend | Node.js with TypeScript, Express, JWT, bcrypt, Zod (validation), helmet, cors, morgan, dotenv |
| Frontend | React + TypeScript (Vite), **MUI**, React Router, TanStack Query, React Hook Form + Zod, Axios |
| Later | PWA for salespersons (service worker + manifest) |

---

## 5. Repository Structure (monorepo)

One Git repository with two independent apps. They share no code and have their own `package.json` and `.env`.

```
sales-service-crm/
  server/
    src/
      config/          db.ts, env.ts
      models/
      routes/
      controllers/     thin: parse request, call service, send response
      services/        business logic and DB queries
      middleware/      auth.ts, requireRole.ts, validate.ts, tenant.ts, errorHandler.ts
      validators/      Zod schemas
      utils/           ApiError.ts, asyncHandler.ts
      seed/
      app.ts
      server.ts
    .env.example
    package.json
  client/
    src/
      api/             axios instance + per-resource API functions
      features/        auth, employees, customers, dashboard, ...
      components/      shared UI (DataTable, FormDialog, ConfirmDialog, Layout, Sidebar)
      routes/          router config, ProtectedRoute, RoleRoute
      context/         AuthContext
      theme/           MUI theme
      main.tsx
    .env.example
    package.json
  .gitignore
  README.md
  PROJECT_CONTEXT.md
```

**Backend layering rule:** `route -> controller -> service -> model`. Controllers never talk to Mongoose directly.

---

## 6. Multi-Tenancy (design from day 1)

The software will be sold to multiple companies, so:

- Add a `Company` collection (the tenant, i.e. the customer who bought the software).
- Every business record (user, customer, site, sale, etc.) has a `companyId`.
- A `tenant` middleware derives `companyId` from the authenticated user's JWT and **every query must filter by it**.
- Never trust a `companyId` sent from the client body.
- Full tenant onboarding/management UI is **out of scope for now**; only the field, the middleware and a seeded demo company.

> Naming note: `Company` = tenant (the exporter using this software). `Customer` = the exporter's buyer.

---

## 7. Data Model

All schemas use `timestamps: true` and include `companyId` (ObjectId -> Company, required, indexed).

### Phase 1 (build today)

**Company (tenant)**
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| currency | String | default `AED` (single currency for now) |

**User (employee)**
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique per company, lowercase |
| phone | String | |
| passwordHash | String | required, `select: false` |
| role | String | `admin` \| `team_lead` \| `salesperson` \| `maintenance` |
| isActive | Boolean | default true (prefer deactivate over hard delete) |
| teamLead | ObjectId -> User | optional, only for salespersons |

**Customer**
| Field | Type | Notes |
|---|---|---|
| name | String | required (person or business) |
| type | String | `retail` \| `wholesale` |
| email | String | |
| phone | String | |
| country | String | |
| city | String | |
| address | String | |
| assignedSalesperson | ObjectId -> User | optional |
| notes | String | |

### Phase 2 (after CRUD is done, do not build yet)

- **Site**: customer, name, address, city/region/country
- **MachineModel**: make, model, capacityKg, type, costPrice, retailPrice, wholesalePrice
- **Sale**: customer, site, machineModel, quantity, saleType, unitPrice, unitCost, salesperson, date
- **MaintenancePlan**: name, price, visitsPerYear, visitIntervalMonths, description
- **Subscription**: customer, site, machine, plan, startDate, endDate, nextServiceDate
- **ServiceVisit**: subscription, technician, scheduledDate, completedDate, status, charge, cost

> Profit = (unitPrice - unitCost) x quantity for sales; (charge - cost) for service visits. Store both price and cost on the record so history stays correct if prices change later.

---

## 8. Today's Scope (Phase 1)

Build **CRUD for Employees (team leads, salespersons, maintenance staff) and Customers**, with login and a navigation shell.

### Backend
1. Project setup: Express app, Mongo connection, env config, `asyncHandler`, `ApiError`, central error handler
2. `Company` and `User` models; seed script creating one demo company and one admin
3. Auth: `POST /auth/login`, `GET /auth/me`, JWT middleware, `requireRole` middleware, tenant middleware
4. Employee CRUD (admin only), filtered by role
5. Customer CRUD (admin only for now)
6. Validation (Zod) on all write endpoints, pagination and search on list endpoints

### Frontend
1. Vite + React + TS + MUI setup, theme, router, AuthContext, protected routes
2. Login page
3. Layout with MUI left Drawer and top bar
4. Nav items (first is Dashboard):
   - Dashboard (placeholder page only)
   - Team Leads
   - Salespersons
   - Maintenance Staff
   - Customers
5. Reusable `DataTable` (pagination, search), `FormDialog` (add/edit), `ConfirmDialog` (delete)
6. Employee pages (one reusable page parameterised by role) and Customer page

### Explicitly out of scope today
Dashboard analytics, sites, machines, sales, maintenance plans, team lead and salesperson specific features, PWA, multi-currency, tenant management UI.

---

## 9. API Specification (Phase 1)

Base URL: `/api/v1`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Returns JWT + user |
| GET | `/auth/me` | Current user |

### Employees (admin only)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/employees` | Create employee (role in body) |
| GET | `/employees?role=&page=&limit=&search=` | List |
| GET | `/employees/:id` | Detail |
| PUT | `/employees/:id` | Update |
| DELETE | `/employees/:id` | Deactivate / delete |

### Customers (admin only for now)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers` | Create |
| GET | `/customers?type=&page=&limit=&search=` | List |
| GET | `/customers/:id` | Detail |
| PUT | `/customers/:id` | Update |
| DELETE | `/customers/:id` | Delete |

### Response format

```json
// success
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 10, "total": 42 } }

// error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "Invalid email" }] }
```

---

## 10. Coding Standards

**Backend**
- TypeScript only, strict type-checking, ES modules, async/await, no callbacks
- All async handlers wrapped with `asyncHandler`; throw `ApiError(statusCode, message)` for expected errors
- Never return `passwordHash`; hash with bcrypt (cost 10 or more)
- Validate with Zod at the route level; never trust request bodies
- Every query filters by `companyId`
- Use `.lean()` for read-only queries; add indexes for fields used in filters
- Use environment variables for secrets; never commit `.env`

**Frontend**
- TypeScript strict mode; types for every API response
- Server state via TanStack Query only (no Redux)
- Forms via React Hook Form + Zod
- Feature-based folders; shared components stay generic
- Always handle loading, empty and error states
- Use MUI components and theme tokens rather than ad-hoc CSS

**Git**
- Small commits with clear messages (e.g. `feat(server): add employee CRUD`)
- Commit `.env.example`, never `.env`

---

## 11. Learning Roadmap (guided)

Cover each concept when it first appears in the build:

1. How Express handles a request: middleware chain, routes, controllers
2. Mongoose schemas, validation, and basic CRUD queries
3. Async/await and centralised error handling
4. Authentication: password hashing, JWT, role-based access, tenant isolation
5. Querying: filtering, search, pagination, `populate`, indexes
6. **Aggregation pipeline** (needed for the Phase 2 dashboard: sales by machine, region, salesperson, profit/loss)
7. Testing the API (Postman/Thunder Client, then optionally Jest + Supertest)

---

## 12. Definition of Done (Phase 1)

- [ ] Admin can log in and stay logged in after refresh
- [ ] Non-admin tokens are rejected on admin routes
- [ ] Employees can be created, listed, edited and deleted for each role
- [ ] Customers can be created, listed, edited and deleted
- [ ] Lists support pagination and search
- [ ] Every query is scoped by `companyId`
- [ ] Validation errors show up correctly in forms
- [ ] Left nav shows Dashboard, Team Leads, Salespersons, Maintenance Staff, Customers
- [ ] Seed script creates demo company + admin
- [ ] README has setup steps
- [ ] Code is pushed to GitHub with a clean commit history

---

## 13. Starter Prompts

**Copilot Chat / Agent**

1. > Read plan.md and inspect the current repository. Provide the complete Phase 1 implementation as copy-ready files, with each relative path and full file contents. Use TypeScript only, preserve existing work, stay within Phase 1 scope, and include setup and verification steps.
2. > Review my copied Phase 1 files against plan.md. Identify concrete errors or missing pieces and tell me the smallest changes needed to fix them.

**Claude Code (later)**

> Read plan.md and inspect the current repo state. Compare the copied implementation against section 12, point out concrete gaps or security issues, then provide complete copy-ready corrections for the requested scope.