---
id: task-2026-10-21-008
title: "Edit well-being rating and comment of finished workouts in history"
status: planned
created: "2026-10-21T14:12:54Z"
updated: "2026-10-21T14:12:54Z"
hermes_sessions: ["20261021_153710_21176d"]
skill_version: "product-agent-governance@0.4.0"
tags: ["feature"]
checkpoint:
  git_head: "eabc5e0f8fffba474bd16339200df6760d0995d3"
  git_status_clean: false
  backup_ref: ""
result:
  commits: []
  files_changed: []
  test_command: ""
  test_result: ""
related:
  specs: []
  adr: []
  agdr: []
  bugs: []
---

# Edit well-being rating and comment of finished workouts in history

## Input

- Backlog item «Edit post-workout well-being rating after the workout is already finished»
  (added by task-2026-10-21-004).
- Owner decisions (2026-10-21): scope = rating + post-workout comment; inline editing on the
  history view screen with immediate save; ⭐ badge refreshes immediately.
- Spec: `specs/004-history-edit-rating-comment/`; AgDR-0004 records entry ids + PUT semantics.

## Acceptance criteria
- [ ] Server: history entries get stable ids (startup backfill + POST); `PUT /api/history/:id`
  merges only wellBeingRating (clamped 1–5) and comment
- [ ] UI: rating buttons enabled in history view, tap saves immediately; comment syncs on focus-out;
  badge re-renders
- [ ] Full suite green; live probe green

## Output

(work commit pending)

## Rollback

`git revert` the task's commits removes the endpoint, the UI editing and the tests; ids already
assigned to legacy entries remain (harmless additive field).

