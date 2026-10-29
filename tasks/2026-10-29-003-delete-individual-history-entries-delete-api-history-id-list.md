---
id: task-2026-10-29-003
title: "Delete individual history entries (DELETE /api/history/:id + list UI)"
status: done
created: "2026-10-29T11:09:23Z"
updated: "2026-10-29T11:09:23Z"
hermes_sessions: ["20261029_134711_abc123"]
skill_version: "product-agent-governance@0.4.0"
tags: ["feature"]
checkpoint:
  git_head: "0ddb84997a9a42b6e0a0f7193788cad5b7732e7e"
  git_status_clean: false
  backup_ref: ""
result:
  commits: []
  files_changed: ["server.js", "tk-focus.js", "tk-focus.css", "__tests__/history-delete.test.js", "specs/007-history-entry-delete/spec.md", "specs/007-history-entry-delete/plan.md", "specs/007-history-entry-delete/tasks.md", "tasks/2026-10-29-003-delete-individual-history-entries-delete-api-history-id-list.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Tests: 84 passed, 84 total (16 suites)"
related:
  specs: ["specs/007-history-entry-delete/spec.md"]
  adr: []
  agdr: []
  bugs: []
---

# Delete individual history entries (DELETE /api/history/:id + list UI)

## Input

- Backlog line «Delete individual entries from workout history» (owner item 2 of 2026-10-29, task-2026-10-29-001).
- Owner decisions (2026-10-29, «принять рекомендации»): dedicated ✕ icon on each history row;
  confirm() before deletion (title + date); per-entry only, no bulk clear.
- Branch: `feature/backlog-2026-10-29`.

## Acceptance criteria

- [x] DELETE /api/history/:id removes the entry server-side, 404 on unknown id
- [x] History rows have a ✕ delete icon; deletion asks confirm() naming title and date
- [x] On success the local list updates without reload and a «Запись удалена» toast is shown
- [x] Cancelled confirm and server errors leave the list unchanged
- [x] Jest suite green (84/84)

## Output

`server.js`: new DELETE endpoint (splice from lowdb, 404 on miss). `tk-focus.js`: `.h-del` button on
each `.h-item` row and `case 'delhistory'` handler (confirm → DELETE → local splice → toast → render;
non-async handler because the global click listener is synchronous — fetch via .then). `.h-del` CSS
(absolute top-right, coral hover). Tests: `__tests__/history-delete.test.js`.

## Rollback

`git revert` the commits of this task removes the endpoint and the UI; history data is untouched.
