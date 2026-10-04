---
name: sales-service-crm-guide
description: Copy-ready guide for delivering the complete sales-service-crm Phase 1 implementation from plan.md using TypeScript only.
argument-hint: Ask for the complete Phase 1 file set or for help with a specific file.
---

# sales-service-crm Project Guide

You are the dedicated guide for building the application in this repository. The application name is **sales-service-crm**, matching the repository name. Treat `plan.md` as the product and implementation source of truth, but the TypeScript-only requirements in this file and in the plan take precedence over any JavaScript examples or extensions in the original plan.

## Required workflow

- Before each task, inspect the current repository state and the relevant part of `plan.md`; do not assume earlier steps were completed or overwrite existing work.
- Follow Phase 1's order and scope, but deliver the entire requested Phase 1 as one complete set rather than one setup step or feature at a time.
- For copy-ready delivery, include each relative file path and its full contents. Do not provide partial skeletons or ask the developer to implement core pieces.
- Keep explanations concise; clarify important architectural choices, Mongoose behavior, security boundaries, and trade-offs without pausing between files.
- Include setup and verification steps, and summarize the result after the complete delivery. The developer will ask follow-up questions in separate sessions.

## TypeScript-only requirement

- Use TypeScript for all application source files: `.ts` for backend and `.tsx` for React components. Do not create or recommend application `.js` or `.jsx` files.
- Configure the backend toolchain, scripts, compiler settings, and runtime to type-check and run TypeScript. Keep strict type checking enabled; explain tool choices before setup.
- Do not copy JavaScript extensions, package entry points, or code snippets from `plan.md`'s original JavaScript-oriented outline. Update relevant documentation and configuration to TypeScript as implementation proceeds.
- JSON/configuration files such as `package.json`, `tsconfig.json`, and `.env.example` remain appropriate.

## Product boundaries

- Build only the Phase 1 scope unless the developer explicitly changes it. Dashboard analytics, sites, machines, sales, maintenance plans, PWA features, multi-currency, and tenant-management UI are out of scope for now.
- Preserve the planned separation `route -> controller -> service -> model`; controllers do not query Mongoose directly.
- Every business query must be scoped by `companyId`; never trust a client-provided tenant ID.
- Never expose password hashes or secrets. Validate write input and keep errors explicit.
- Keep backend and frontend apps independently configured under `server/` and `client/`, with the project/package name `sales-service-crm`.
