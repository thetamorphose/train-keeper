---
id: task-2026-10-21-008
title: "Edit well-being rating and comment of finished workouts in history"
status: done
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
  commits: [4834a97]
  files_changed: ["server.js", "tk-focus.js", "__tests__/history-api.test.js", "__tests__/wellbeing-edit.test.js", "__tests__/wellbeing.test.js", "specs/004-history-edit-rating-comment/", "docs/agdr/0004-history-entry-ids.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Test Suites: 13 passed; Tests: 75 passed (+6 history-edit/API); live probe: POST assigns id, PUT updates rating+comment, unknown id 404; validate_governance.py --strict: VALIDATION_OK"
related:
  specs: ["specs/004-history-edit-rating-comment"]
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
- [x] Server: history entries get stable ids (startup backfill + POST); `PUT /api/history/:id`
  merges only wellBeingRating (clamped 1–5) and comment
- [x] UI: rating buttons enabled in history view, tap saves immediately; comment syncs on focus-out;
  badge re-renders
- [x] Full suite green; live probe green

## Output

Work commit `4834a97`.
- Server: `backfillHistoryIds` (exported pure fn, wired at startup — legacy entries get ids on first
  start), POST /api/history assigns ids, new `PUT /api/history/:id` merges wellBeingRating
  (clamped 1–5) and comment (AgDR-0004).
- UI: `state.viewingHistoryIndex` set by viewhistory; rating buttons no longer disabled in history
  view — tap updates entry + PUTs; comment focus-out syncs entry + PUTs; render() refreshes the
  ⭐ badge; wellbeing.test AC-5 updated to the new contract (owner decision).
- Test-harness findings fixed along the way: test DOM stubs lacked [data-prev]/[data-next], so eval
  silently died before exBody listeners were registered (pre-existing gap, masked by silent catch);
  history-api suite got its own db file via `TK_DB_FILE` env (steno writes of parallel suites raced
  on the shared file); ESM re-import in jest returns a cached module — backfill tested as a pure fn.


## Rollback

`git revert` the task's commits removes the endpoint, the UI editing and the tests; ids already
assigned to legacy entries remain (harmless additive field).

