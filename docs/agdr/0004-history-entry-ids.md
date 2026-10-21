---
id: AgDR-0004
timestamp: "2026-10-21T14:30:00Z"
agent: "Hermes Agent"
model: "z-ai/glm-5.3-flash (nous)"
trigger: implementation-plan
decision_class: technical
owner_veto: false
status: executed
task_id: "task-2026-10-21-008"
---

<!-- AgDR records the agent's technical decision. It requires no approval (recording != approval); the owner may veto at Gate 3. -->

# History entries get stable ids; partial updates via PUT /api/history/:id

## Context

Editing the well-being rating/comment of a finished workout needs an addressable history entry
(spec `specs/004-history-edit-rating-comment/`). Entries stored so far have no id; PUT over the
whole history array would work but couples the client to list indices.

## Options considered
| Option | Pros | Cons |
|---|---|---|
| Stable entry id + `PUT /api/history/:id` (partial merge) | robust addressing; legacy entries self-heal via startup backfill; merge limited to rating/comment fields | one new route + backfill pass |
| `PUT /api/history/:index` | no id concept | indices shift when entries are removed/reordered; race-prone |
| Client re-POSTs a corrected copy and deletes the old one | no PUT | duplicates the entry lifecycle; needs DELETE too; ids still required |

## Decision

Startup backfill assigns `crypto.randomUUID()` to every entry lacking an id; POST assigns ids
to new entries; `PUT /api/history/:id` merges only `wellBeingRating` (clamped 1–5 integer) and
`comment` (string). The client PUTs on rating tap and on comment focus-out while viewing history.

## Consequences

History entries become addressable for future features (e.g. deletion). Legacy records are
migrated transparently on first server start; no client-side migration needed.
