# Phase 9 — Live Monitoring Dashboard

> **Goal**: A supervisor UI showing active calls, call history, error code frequency analytics, and a CRUD interface for managing the error code dictionary — all backed by MongoDB.

---

## Architecture Decisions

| Decision | Choice |
|---|---|
| Data fetching | **Server Components** — direct MongoDB queries, no extra API round-trip for reads |
| Client interactivity | **Isolated Client Components** only for: auto-refresh, CRUD modals, chart |
| Real-time | **30-second polling** via a lightweight `AutoRefresh` client component (SSE deferred) |
| Layout | **Dedicated `/dashboard` layout** — does not inherit landing page styles |
| Auth | **None for MVP** — add basic password protection before public deployment |

---

## Folder Structure

```
src/app/dashboard/
├── layout.tsx                    ← Dashboard shell (sidebar, dark theme, nav)
├── page.tsx                      ← Overview page (Server Component)
├── calls/
│   └── page.tsx                  ← Full paginated call history
├── error-codes/
│   └── page.tsx                  ← Error code CRUD management
└── _components/
    ├── StatsCards.tsx            ← 4 stat cards: Active / Resolved / Escalated / Dropped
    ├── ActiveCallsList.tsx       ← Live list of in-progress calls
    ├── CallsTable.tsx            ← Paginated history table with expandable transcript rows
    ├── ErrorFrequencyChart.tsx   ← Bar chart of most common error codes (Client Component)
    ├── AutoRefresh.tsx           ← Client: triggers router.refresh() every 30s
    └── ErrorCodeEditor.tsx       ← Client: modal for creating/editing/deleting error codes
```

---

## API Routes

```
src/app/api/dashboard/
├── stats/route.ts                ← GET — aggregated call outcome counts
├── calls/route.ts                ← GET — paginated call history (?page=1&limit=20)
└── error-codes/
    ├── route.ts                  ← GET all | POST new error code
    └── [id]/route.ts             ← PUT update | DELETE (soft delete via isActive=false)
```

---

## Dashboard Pages

### 1. Overview (`/dashboard`)

**Widgets:**

| Widget | Description | Data |
|---|---|---|
| Stat Cards | Total active, resolved, escalated, dropped | `CallSession` aggregate |
| Active Calls | Live list of in-progress calls with duration | `status: "active"` |
| Error Frequency | Bar chart of top error codes this week | `aggregate` on `detectedErrorCode` |
| Recent Calls | Last 10 completed calls with outcome badge | `status: "completed"`, sorted by `startedAt: -1` |

---

### 2. Call History (`/dashboard/calls`)

Full paginated table of all completed calls:

| Column | Field |
|---|---|
| Date/Time | `startedAt` |
| Caller | `callerNumber` (masked: `+234 *** *** 4578`) |
| Region | `region` badge (NG / EU / unknown) |
| Provider | `detectedProvider` |
| Error Code | `detectedErrorCode` |
| Outcome | `outcome` badge (resolved / escalated / dropped / dtmf_fallback) |
| Duration | `durationMs` formatted (e.g. "1m 23s") |
| Transcript | Expandable row showing full conversation |

**Filters:** by outcome, date range, region, provider

---

### 3. Error Code Manager (`/dashboard/error-codes`)

Full CRUD table for the `ErrorCode` MongoDB collection:

| Column | Field |
|---|---|
| Code | `code` |
| Provider | `provider` badge |
| Category | `category` |
| Severity | `severity` badge |
| Automatable | `isAutomatable` toggle |
| Active | `isActive` toggle (soft delete) |
| Actions | Edit / Delete buttons |

**Create/Edit Modal fields:**
- Code (text)
- Provider (select: dstv / gotv / startimes / all)
- Meaning (text)
- Fix if Active (textarea)
- Fix if Expired (textarea)
- Fix Generic (textarea)
- USSD Code (text, optional)
- Is Automatable (checkbox)
- Severity (select: low / medium / high / critical)
- Category (select: subscription / signal / hardware / software)

> [!NOTE]
> Changes to error codes here update MongoDB immediately. The AI picks them up on the **next call** (the system prompt is built fresh per call via `buildSystemPrompt()`).

---

## Real-Time Strategy (SSE — Deferred)

For the MVP, the dashboard uses **30-second polling** via:
```tsx
// AutoRefresh.tsx (Client Component)
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
```

**SSE upgrade path (post-MVP):**
- WS server emits events to a Redis pub/sub channel on `call.started`, `call.tool_called`, `call.ended`
- Next.js `/api/dashboard/events` route streams these as SSE
- Dashboard subscribes and updates without polling

---

## Design System

- **Theme**: Dark (`#0a0a0f` background), consistent with landing page
- **Accent**: Electric blue `#3b82f6` for interactive elements
- **Font**: `Space Grotesk` (already loaded in root layout)
- **Charts**: Use `recharts` (lightweight, tree-shakeable, no SSR issues)
- **Cards**: Glassmorphism style — `backdrop-blur`, subtle border, gradient glow on hover
- **Badges**: Color-coded outcomes:
  - `resolved` → green
  - `escalated_to_agent` → amber
  - `dropped` → red
  - `dtmf_fallback` → purple

---

## Dependencies to Install

```bash
npm install recharts
```

> `recharts` is the only new dependency. Everything else uses existing Next.js + Mongoose stack.

---

## Execution Order

1. **API Routes** — stats, calls, error-codes (server-side data layer)
2. **Dashboard Layout** — shell, sidebar, nav
3. **Overview Page** — stats cards + active calls + recent calls
4. **AutoRefresh** — client component for polling
5. **Error Frequency Chart** — recharts bar chart
6. **Call History Page** — paginated table with transcript expand
7. **Error Code Manager** — CRUD table + modal

---

## Open Questions Before Building

- [ ] Should the dashboard be password-protected? (Basic HTTP auth, or a simple env-based PIN?)
- [ ] Pagination: how many calls per page? (Suggested: 20)
- [ ] Should the transcript viewer show raw text or styled chat bubbles?
- [ ] Should deleting an error code be a hard delete or soft delete (`isActive: false`)?
