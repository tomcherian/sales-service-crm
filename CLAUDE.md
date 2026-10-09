# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Multi-tenant CRM for a washing machine exporter (sales, customers, employees, later maintenance and profit/loss analytics). [plan.md](plan.md) is the product and scope source of truth: read the relevant section before starting a task. Phase 1 (auth, employee CRUD, customer CRUD, nav shell) is built; Phase 2 models (Site, MachineModel, Sale, MaintenancePlan, Subscription, ServiceVisit) are specified there but should only be built when asked.

The developer is a senior React/TypeScript engineer with average Node.js knowledge. Briefly explain non-obvious backend, Mongoose and security decisions, and call out trade-offs around auth, validation and access control.

## Commands

`server/` and `client/` are independent npm apps (no root package.json, no shared code). Run commands inside each directory.

```sh
# server/
npm run dev     # tsx watch src/server.ts (port 4000)
npm run build   # tsc type-check + emit to dist/
npm run seed    # creates the demo Company + admin from SEED_* env vars
npm start       # node dist/server.js

# client/
npm run dev     # Vite (port 5173)
npm run build   # tsc -b && vite build (this is the type-check)

# full stack from repo root (needs server/.env with JWT_SECRET >= 32 chars)
docker compose up --build   # client :8080, API :4000, Mongo on 127.0.0.1:27018
```

There is no test runner or linter configured yet. Verify changes with `npm run build` in each app you touched.

Env: the server validates its environment with Zod in `server/src/config/env.ts` and refuses to start if it's invalid. The client only reads `VITE_API_URL`.

## Server architecture

Express 5 + Mongoose, ESM with TypeScript. Relative imports must use the `.js` extension (e.g. `from "../utils/ApiError.js"`).

**Layering: route → controller → service → model.** Controllers never touch Mongoose; services take `companyId` as their first argument and hold all queries and business rules. Follow `customerService.ts` / `customerRoutes.ts` as the reference pattern for new resources.

**Request pipeline for protected routes** (applied with `router.use(...)` at the top of each route file):
1. `authenticate` verifies the JWT (`sub` = userId, `companyId` claim), then re-loads the user to check they still exist and are `isActive`, and sets `request.auth`.
2. `tenant` copies `request.auth.companyId` to `request.companyId`.
3. `requireAdmin` checks the role (all Phase 1 resource routes are admin only).
4. Per-route `validateBody` / `validateParams` / `validateQuery` (Zod schemas in `validators/schemas.ts`). `validateBody` replaces `request.body` with the parsed data. `validateQuery` only validates because `req.query` is read-only in Express 5, so list controllers call `schema.parse(request.query)` again to get coerced values.

**Multi-tenancy rules:** every business query filters by `companyId`, which comes only from `request.companyId` and never from the request body or params. Cross-references (e.g. a customer's `assignedSalesperson`, a salesperson's `teamLead`) must be checked to belong to the same tenant with the right role (see `verifySalesperson`).

**Errors:** throw `ApiError(status, message, details?)`. Express 5 forwards rejected async handlers to the error handler, so controllers are plain async functions. `asyncHandler` is only used in `authenticate`. `middleware/errorHandler.ts` maps ApiError, Mongoose ValidationError/CastError and duplicate key (11000 → 409) to the standard response shape.

**Response shape** (the client relies on it):
```json
{ "success": true, "data": ..., "meta": { "page": 1, "limit": 10, "total": 42 } }
{ "success": false, "message": "...", "errors": [{ "field": "email", "message": "..." }] }
```

**Data conventions:** all models have `timestamps: true` and a required, indexed `companyId`. Employees of every role live in the single `User` model with a `role` field; customers are a separate `Customer` collection and never log in. `passwordHash` is `select: false` and hashed with `bcryptjs` (cost 10). Employees are deactivated (`isActive: false`) rather than deleted; customers are hard-deleted. Use `.lean()` for reads and escape user input before using it in `$regex` search. For Phase 2 sales and service visits, store both price and cost on each record so historical profit stays correct.

## Client architecture

React 19 + Vite + MUI 6 + React Router 7 + TanStack Query 5 + React Hook Form/Zod + Axios. Organised as **domain modules** (one per bounded context from plan.md), with `@/` aliased to `src/`.

```
src/
  app/        App.tsx (router), navigation.tsx (nav items = routes), providers.tsx, layout/, routing/, theme.ts
  shared/     api/ (http, envelope types, DTO mappers, server-error helpers), ui/ (DataTable, FormDialog, ConfirmDialog), hooks/
  domains/<domain>/
    api/          DTO types + fetch functions; maps server data to the domain model
    model/        domain types, labels, form schema + form<->payload mapping
    hooks/        query-key factory + TanStack Query hooks
    components/   form dialog, table columns
    pages/        thin pages wiring hooks to shared UI
    index.ts      the domain's public API
```

Boundary rules:
- Other domains and `app/` import a domain only through `@/domains/<name>` (its `index.ts`), never a deep path. Inside a domain, use relative imports.
- `shared/` never imports from `domains/`. `auth` is upstream of everything (owns `User`/`UserRole`). `dashboard` may read from other domains, and nothing depends on it.
- Mongo shapes (`_id`, populated-or-ID refs) stop at `api/`. Components only see the domain model (`id`, `teamLeadId`, `assignedSalespersonId`).
- Each domain has a key factory (`staffKeys`, `customerKeys`) and mutations invalidate `keys.all`. For example, a staff change refreshes the customer form's salesperson picker via `useSalespeople()`.

Page pattern (copy `domains/customers` for a new resource): `usePagedList()` gives debounced list params plus `DataTable` props, `useEntityDialogs()` holds create/edit/delete dialog state, and the `<X>FormDialog` owns its form and save mutation. `applyServerErrors` puts the server's `errors[].field` messages on the matching inputs and returns a message for anything else.

Auth: `domains/auth/context/AuthContext.tsx` stores the JWT in `localStorage` (`crm-token`), which `shared/api/http.ts` attaches. It restores the session through `/auth/me` and clears the query cache on logout. To add a page, add a domain plus an entry in `app/navigation.tsx` (route and drawer link together).

Server state goes through TanStack Query only (no Redux). Use MUI components and theme tokens rather than ad-hoc CSS, and handle loading, empty and error states.

## Conventions

- TypeScript only (`.ts` / `.tsx`), strict mode. No application `.js`/`.jsx` files.
- Commit messages follow `feat(server): ...` / `fix(client): ...`.
- Phase 1 "Definition of Done" checklist is section 12 of plan.md.
