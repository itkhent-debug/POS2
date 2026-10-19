---
name: pos-n8n
description: Cafe Brewm POS backend (n8n webhooks + Supabase main DB + n8n Data Table failover). Use when changing, debugging, testing or adding features to the POS/ledger backend, n8n workflows, Supabase tables, webhooks, or when the user asks for new POS features (inventory auto-deduct, end-of-day report, staff PIN, receipts, etc.).
---

# Cafe Brewm POS backend

Frontend: Vite/React in `src/` (PosApp.jsx = POS, LedgerDashboard.jsx = ledger at `/ledger.html`), deployed on Vercel.
Backend: n8n at `https://n8n.n8nserverhome.dpdns.org`; webhook base is `N8N_WEBHOOK_BASE` in `src/apiFetch.js` (override with `VITE_N8N_BASE_URL`).

## Secrets: never write them to the repo, memory or this file
The user pasted their n8n API key, Supabase DB password and Groq key in chat. They live only inside n8n (credential "Supabase (Cafe Brewm)", id `Dic8RHgCyJgeUz5D`; Groq key in the "Call Groq" node header). Ask the user for the n8n API key (header `X-N8N-API-KEY`) each session; the user was told to rotate all of them.

## Architecture
- **Main DB: Supabase Postgres** (project ref `jxmunrqsnzxyahfptkiz`, pooler `aws-0-ap-south-1.pooler.supabase.com:5432`, user `postgres.<ref>`). Tables: orders, customers, shifts, inventory, expenses (RLS on). Schema: `n8n/supabase-schema.sql`. `src_id` = id of the same row in the n8n Data Table.
- **Failover: n8n Data Tables** `pos_orders fs5gd1Bh8dGqu1fd`, `pos_customers tv1CtiN4HM6Z0lQ9`, `pos_shifts 4j15txQ3CA8J8oXH`, `pos_inventory 8jxkuKymWTBQDBiO`, `pos_expenses KUbINzSQsqrEx4n1`.
- **Reads**: Supabase first (pg node with `onError: continueErrorOutput`), error output falls back to the Data Table read. Both paths must emit the same camelCase fields (SQL aliases) so the shared "Shape ..." Code node works.
- **Writes**: Data Table first, then mirror to Supabase (`onError: continueRegularOutput`, never blocks the POS). `POS Supabase Sync` runs every 5 min and upserts + prunes Supabase from the Data Tables, healing anything missed while Supabase was down.
- Live orders are stamped with server time if within 2 min of it (device clock skew); older orders (offline queue) keep `placedAt`.

## n8n workflows (ids)
| Workflow | id | webhooks |
|---|---|---|
| POS Orders & Ledger | 9CMEOMLq8Bw4be51 | POST pos-order, GET pos-ledger-data |
| POS Staff Shifts | ItBCSxMxzBwC94JR | POST pos-clockin, POST pos-clockout, GET pos-shifts |
| POS Inventory | NiomnuBga6PoJkSI | GET/POST pos-inventory |
| POS Expenses | OlhcZH3hPoPVEf1a | GET/POST pos-expenses (`action: add|delete`) |
| POS Reset Data | PkgEQidN4UXBaUhK | POST pos-reset-data (clears both DBs) |
| POS Session Log | B5asj6P35UVwjpFa | POST pos-session-log (just acks) |
| POS AI Assistant (Groq) | 2btRj3IO6LikMhrP | POST ai-assistant (model openai/gpt-oss-120b) |
| POS Supabase Sync | IQ2uRQeLrssfZ6oa | schedule, 5 min |

JSON copies are in `n8n/` (gitignored). Unrelated workflows "Caloocan Urgent Bot" and "Realtime Location" belong to the user: do not touch.

## How to change a workflow
1. Edit the JSON in `n8n/` (or regenerate), then `PUT /api/v1/workflows/<id>` with only `name, nodes, connections, settings`, then `POST /api/v1/workflows/<id>/activate`.
2. New workflow: `POST /api/v1/workflows`. Data tables: `/api/v1/data-tables`.
3. Gotchas learned: `$env` is blocked in n8n (inline keys instead); Data Table reserved column names (`id, createdAt, updatedAt`); a node run with N input items runs N times (use `executeOnce` on get-all nodes); empty reads need `alwaysOutputData`; Cloudflare 403s the default Python user-agent (send a browser UA); `queryReplacement` must be an array expression; webhook paths only work when the workflow is Active.
4. Respond to webhooks with `{success, ...}`: the frontend relies on `success` (order rejected non-retryably if `success` is false).

## Testing
Hit the production webhooks with an end-to-end script (clock in, orders incl. duplicate resend and apostrophes, shift totals, clock out, inventory, expenses, reset) and check Supabase rows via pg8000 (`pip install pg8000` in a venv; connect with ssl verify off). Always finish with `pos-reset-data` and confirm both DBs are empty. The failover test (rename Supabase tables or pause the project) was NOT yet verified; the sandbox blocked renaming the user's tables, so ask first.

## Feature backlog the user may ask for
Receipts/print, inventory auto-deduct on order + low-stock alert, top sellers/peak hours charts, end-of-day report to Slack/email, customer loyalty, cash-drawer count per shift, void/refund with approver, per-staff PIN (staff passwords are currently hardcoded in `PosApp.jsx` STAFF_ACCOUNTS: a security issue), menu editor. Recommended first: inventory auto-deduct, end-of-day report, per-staff PIN.
