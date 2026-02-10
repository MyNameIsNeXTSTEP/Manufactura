## What to build ?

Web application (with PWA capabilities) about manufacturing management, so it should have different modules with the following key points and modules:

- The app should be available both on the web and the module as the PWA application on IOS and android devices.
- warehouse accounting
- simple task tracker for stuff and the owner to track the operations on the manufacturing
- simple CRM for managing relationships with customers and raw materials suppliers.
  When selling - we commit its data and the fact of action in a history. when receiveing the ingredients form a supplier - we commit its data and action to the history as well.
- cookbooks (receipts) with an ability to subtract the raw materials bayes on the quantity and the kind of cooked piece. like we write off the ingredients.
- analytics
- AI assistant that can give some business and processes information based on the prompts about our data, tasks, and etc.

Use a modular, domain‑driven monolith with a clean/hexagonal layout, React+Vite PWA on the front, Fastify+TypeScript on the back, PostgreSQL via Prisma, and a dedicated AI service that talks to the same domain API.

## High‑level architecture description

- **Client:** React + Vite SPA, PWA‑enabled (service worker, offline cache, installable) with module‑based routing: Warehouse, Tasks, CRM, Cookbooks, Analytics, Admin, AI assistant.[4]
- **Backend:** Node.js (TypeScript) with Fastify, modular hexagonal/clean architecture: domain and use‑cases in the center, HTTP and background workers as primary adapters, Postgres, queues, and external AI as secondary adapters.[5][6][1]
- **Database:** PostgreSQL as the single source of truth, modeled around manufacturing domains (inventory, tasks, orders, recipes, activity history, analytics snapshots).[2][7]
- **AI Assistant:** Separate “AI API” module in the same codebase, exposing endpoints that orchestrate: vector search over your data, domain queries to Postgres, and calls to an LLM provider.[3][4]
- **Deployment:** Containerized app (Docker) with separate images for web and API, deployed to cloud or VPS with CI/CD (GitHub Actions) and automated migrations.[1][3]

## Technology choices

- **Frontend:**  
  - React + Vite + TypeScript, React Router, TanStack Query for data fetching and caching, Zustand or Redux Toolkit for global app state.  
  - UI: headless library (Radix UI) + design system of shared components (Table, Form, Layout, Charts).  
  - PWA: Workbox (or Vite PWA plugin), service worker for offline caching of shell and key API responses, background sync for queued writes when offline.[4]

- **Backend:**  
  - Fastify (TypeScript), fast‑json‑stringify + JSON schema validation, fastify‑rate‑limit, fastify‑helmet, fastify‑cors.[6][2]
  - ORM: Prisma or Drizzle as data access layer for PostgreSQL.[3]
  - Message queue (optional, for scale): Redis or RabbitMQ to process heavy analytics or AI pre‑computations asynchronously.[4]

- **Infra:**  
  - PostgreSQL: managed (RDS/similar) is ideal; use read replicas later for analytics.[3]
  - Object storage (S3‑compatible) for documents (invoices, attachments).  
  - Reverse proxy: Nginx or Traefik in front of Fastify.

## Backend codebase structure (hexagonal)

Top‑level:

- `/apps`  
  - `api` – Fastify HTTP server.  
  - `worker` – background jobs (analytics, AI pre‑indexing).  
- `/packages`  
  - `domain` – pure domain logic (entities, value objects, services).  
  - `application` – use‑cases (commands/queries) orchestrating domain + repositories.  
  - `infrastructure` – Postgres repositories, message bus, external services, AI client.  
  - `shared` – cross‑cutting utilities, result types, logging.

Example inside `packages/domain`:

- `warehouse/`  
  - `entities/InventoryItem.ts`  
  - `entities/WarehouseLocation.ts`  
  - `services/StockService.ts` (reservation, write‑off rules)  
- `tasks/`  
  - `entities/Task.ts`  
  - `services/TaskAssignmentService.ts`  
- `crm/`  
  - `entities/Customer.ts`, `Supplier.ts`, `Order.ts`  
  - `services/CrmService.ts`  
- `cookbook/`  
  - `entities/Recipe.ts`, `RecipeStep.ts`  
  - `services/RecipeService.ts` (compute required ingredients, yield, waste)  
- `analytics/`  
  - `entities/MetricSnapshot.ts`  
  - `services/AnalyticsService.ts`  
- `history/`  
  - `entities/HistoryEvent.ts` (append‑only log of actions)

`packages/application` (use‑cases):

- `warehouse/AdjustStock.ts`  
- `warehouse/RegisterReceipt.ts`  
- `warehouse/RegisterWriteOffFromRecipe.ts`  
- `tasks/CreateTask.ts`, `tasks/CompleteTask.ts`  
- `crm/CreateOrder.ts`, `crm/RecordInvoicePayment.ts`  
- `cookbook/CreateRecipe.ts`, `cookbook/UpdateRecipe.ts`  
- `analytics/GetKpiDashboard.ts`  
- `ai/AnswerBusinessQuestion.ts` (aggregates domain queries and AI call)

`packages/infrastructure`:

- `db/`  
  - `prisma/` schema and migrations.  
  - `repositories/` per aggregate (e.g., `WarehouseRepositoryPostgres`).  
- `ai/`  
  - `LLMClient.ts`, `EmbeddingClient.ts`  
  - `VectorStore.ts` (could be pgvector or external).  
- `http/` (if you want a separate adapter library) // most probaly we don't want it
  - DTO mappers from HTTP to use‑case input.

`apps/api`:

- `server.ts` – Fastify bootstrap, plugin registration, routes registration.[2][6]
- `routes/`  
  - `warehouse.routes.ts`  
  - `tasks.routes.ts`  
  - `crm.routes.ts`  
  - `cookbook.routes.ts`  
  - `analytics.routes.ts`  
  - `ai.routes.ts`  
- `plugins/` – Postgres, logger, auth, etc.  
- `schemas/` – JSON schemas for route validation.

## Frontend structure

- `/src`  
  - `app/` – App shell, routing, layout.  
  - `modules/`  
    - `warehouse/` – screens for inventory, receipts, write‑offs.  
    - `tasks/` – Kanban/table for tasks, calendar view.  
    - `crm/` – customers, suppliers, deals, contact log.  
    - `cookbook/` – recipe editor, production planning view.  
    - `analytics/` – dashboards, charts.  
    - `ai/` – chat UI, context selection (period, module).  
  - `components/` – reusable UI elements.  
  - `api/` – React Query hooks per module (e.g., `useWarehouseItems`).  
  - `pwa/` – service worker, manifest, offline strategies.  

Each module’s UI should consume the backend’s REST (or GraphQL) via thin hooks that map DTOs into view models; domain logic remains on the server.

## Data model and access layer

Key tables (simplified):

- `warehouses`, `locations`, `inventory_items`, `inventory_movements` (receipt, write‑off, transfer).  
- `tasks` (with status, assignee, linked entity like order or production batch).  
- `customers`, `suppliers`, `contacts`, `deals`, `orders`, `order_items`.  
- `recipes`, `recipe_ingredients`, `batches` (production runs).  
- `history_events` (event_type, entity_type, entity_id, payload JSONB, created_at).  
- `analytics_snapshots` (pre‑aggregated KPIs for dashboards).

DAL pattern:

- Repository interfaces in `domain` (e.g., `WarehouseRepository`).  
- Implementations in `infrastructure/db` using Prisma, exposing aggregate‑level methods (e.g., `findItemWithMovements`, `saveMovement`).  
- Transactions wrapped at use‑case level; complex operations like “produce batch” run in a single transaction: read recipe, compute ingredients, insert movements, append history event.

## API layer

Consider REST for simplicity with consistent patterns:

- `GET /warehouse/items`, `POST /warehouse/receipts`, `POST /warehouse/write-offs`  
- `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id/status`  
- `GET /crm/customers`, `POST /crm/customers`, etc.  
- `GET /cookbook/recipes`, `POST /cookbook/recipes`, `POST /cookbook/produce`  
- `GET /analytics/dashboard`  
- `POST /ai/query` (body: prompt + filters)

Controllers (route handlers) do:

- Validation via JSON schemas.  
- Mapping request → use‑case input DTO.  
- Calling application use‑case.  
- Mapping domain result → HTTP response DTO.

Keep auth and multi‑tenant handling in cross‑cutting middleware; inject tenant/user into use‑cases.

## PWA strategy

- **Installable:** proper `manifest.json` with icons, theme color, standalone display.  
- **Offline‑first:** cache app shell and static assets; cache critical data (open tasks, today’s production, current stock) with versioned cache keys.  
- **Background sync:** queue mutations (e.g., task status changes, inventory movements) when offline and replay when online.  
- **Notifications:** use Web Push where possible; on iOS/Android installed PWA, use push for task assignments and low‑stock alerts.[4]

## Analytics design

- Operational queries (e.g., “stock level now”) directly from normalized tables.  
- Heavy analytics via:  
  - Pre‑aggregated `analytics_snapshots` updated by `worker` using cron/queue.  
  - Optional columnar/OLAP store later if needed.  
- Fast APIs for dashboards using either SQL views or materialized views with refresh jobs.[7][8]

## AI assistant integration

- Data prep:  
  - Extract business facts from domain (orders, tasks, stock, recipes, history events).  
  - Maintain vector index on textified records (e.g., “Task #123: pack order for Customer X, due tomorrow”).  
- Request flow (`POST /ai/query`):  
  1. Validate and classify prompt (report vs. operational question).  
  2. Run semantic search over vector store and/or domain queries over Postgres.  
  3. Build context (top N relevant records, KPI summaries).  
  4. Call LLM with system prompt describing domain, return answer + cited records.  
- Guardrails: never let the LLM mutate; all writes go via normal domain API.

## CI/CD and environments

- **Repo:** mono‑repo with apps + packages.  
- **CI (GitHub Actions):**  
  - Lint, type‑check, run tests, build web and API images.  
  - Run DB migrations (Prisma/Drizzle) on staging, then production.[1][3]
- **CD:**  
  - Deploy API container(s) behind reverse proxy.  
  - Deploy web as static assets to CDN or Nginx.  
  - Run smoke tests against health endpoints.

This setup keeps domain logic clean, is friendly to TypeScript everywhere, scales vertically first (single Postgres, a few API instances), and gives you clear seams to split into services later if the product grows.