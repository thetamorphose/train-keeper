---
id: AgDR-0003
timestamp: "2026-10-21T14:05:00Z"
agent: "Hermes Agent"
model: "z-ai/glm-5.3-flash (nous)"
trigger: implementation-plan
decision_class: technical
owner_veto: false
status: executed
task_id: "task-2026-10-21-007"
---

<!-- AgDR records the agent's technical decision. It requires no approval (recording != approval); the owner may veto at Gate 3. -->

# Cross-list exercise duplication: GET-modify-PUT instead of a new endpoint

## Context

Duplicating one exercise into a section of another workout list must persist server-side
(spec `specs/003-exercise-duplicate-across/`, AC 2).

## Options considered
| Option | Pros | Cons |
|---|---|---|
| GET target template → push clone → PUT whole `sections` | reuses existing PUT merge semantics; no API growth; template merge covered by tests | transfers the whole sections array; last-writer-wins if two clients edit the same list concurrently |
| New endpoint `POST /api/templates/:id/sections/:si/exercises` | minimal payload; atomic | one more route for a single UI flow; duplicate id/clone rules would live in a second place |

## Decision

GET-modify-PUT of the target template's `sections`. The PUT handler already merges by id and
is covered by `templates-api.test.js`. Concurrency risk is accepted: the app is single-user
(personal training tracker), and list editing already works through whole-object PUTs.

## Consequences

No API changes. Clone construction stays in `tkLogic.cloneExercise` (client-side, unit-tested);
the server remains a dumb store for this flow.

## Amendment (same task, live-probe correction)

The original plan said "GET target template" — but `GET /api/templates/:id` does not exist
(only the list route). Instead the client reads the target from the already-loaded
`state.templates` list and, after the PUT, refreshes the list via `tkLogic.fetchTemplates`
(unconditionally — the target list changed even when it is not the active one). No new GET
route is added; the API surface stays unchanged as decided.
