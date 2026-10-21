---
id: AgDR-0002
timestamp: "2026-10-21T13:40:00Z"
agent: "Hermes Agent"
model: "z-ai/glm-5.3-flash (nous)"
trigger: implementation-plan
decision_class: technical
owner_veto: false
status: executed
task_id: "task-2026-10-21-006"
---

<!-- AgDR records the agent's technical decision. It requires no approval (recording != approval); the owner may veto at Gate 3. -->

# Template duplication via server endpoint

## Context

Spec `specs/002-workout-list-actions/` needs to duplicate a workout/habit template with all
sections and fields intact. The copy must get a fresh server-side id and the title
«<Имя> (копия)».

## Options considered
| Option | Pros | Cons |
|---|---|---|
| Server endpoint `POST /api/templates/:id/duplicate` | one round trip; deep copy guaranteed on the source of truth; id generation stays server-side; reusable by future clients | one more route in server.js |
| Client-side: GET the template, clone in JS, POST as a new template | no server change | two round trips; client must re-implement deep-copy/id rules; race if template changed meanwhile |

## Decision

Server endpoint `POST /api/templates/:id/duplicate` (deep JSON clone, fresh `crypto.randomUUID()`,
title + « (копия)», inserted directly after the source, `201` with the copy; `404` on unknown id).

## Consequences

`DELETE /api/templates/:id` is reused as-is. The client only calls the endpoint and refreshes
its template list. Deep-copy semantics for sections/fields live in one place (server).
