# Washing Machine Sales & Service CRM

A web-based CRM for washing machine exporters to manage employees and customer relationships from one place. It provides a secure, tenant-aware foundation for coordinating sales teams and maintenance staff, with customer records that can be assigned to salespeople.

## What the app provides

- A centralized workspace for employee and customer records
- Secure admin sign-in and session persistence
- Employee management for team leads, salespersons, and maintenance staff
- Customer management with retail/wholesale classification and optional salesperson assignment
- Search and pagination for employee and customer lists
- Tenant-scoped business data, so records belong to the company that owns them
- A responsive navigation shell with a dashboard landing page

The current dashboard is a landing page. Sales reporting, machine and site records, maintenance scheduling, and financial analytics are not currently available.

## Roles

| Role | Responsibility |
|---|---|
| **Admin** | Company owner who manages employees and customer records |
| **Team Lead** | Leads and coordinates a group of salespersons |
| **Salesperson** | Manages customer relationships and sales |
| **Maintenance Staff** | Performs customer equipment maintenance |

All employee roles use the shared employee account model. Employee and customer management is currently restricted to admins.

## Technology

| Area | Technologies |
|---|---|
| Client | React, TypeScript, Vite, Material UI, React Router, TanStack Query, React Hook Form, Zod, Axios |
| Server | Node.js, TypeScript, Express |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| Validation and middleware | Zod, Helmet, CORS, Morgan |

## Requirements

- Node.js 20 or later and npm
- A running MongoDB instance, local or hosted

The client and server are separate applications with independent package manifests. Run the following commands from the repository root.