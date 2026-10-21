---
id: task-2026-10-21-006
title: "Workout list actions: duplicate and delete templates from home list"
status: done
created: "2026-10-21T13:26:03Z"
updated: "2026-10-21T13:26:03Z"
hermes_sessions: ["20261021_153710_21176d"]
skill_version: "product-agent-governance@0.4.0"
tags: ["feature"]
checkpoint:
  git_head: "eeb89e1f1097cc7608e11ca6c4102181c115c8f6"
  git_status_clean: false
  backup_ref: ""
result:
  commits: [c8ffcd9]
  files_changed: ["server.js", "tk-focus.js", "tk-focus.css", "__tests__/templates-api.test.js", "specs/002-workout-list-actions/", "docs/agdr/0002-template-duplicate-endpoint.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Test Suites: 10 passed; Tests: 62 passed (+3 duplicate API); live probe on dev server: duplicate 201, unknown id 404, delete 200; validate_governance.py --strict: VALIDATION_OK"
related:
  specs: ["specs/002-workout-list-actions"]
  adr: []
  agdr: []
  bugs: []
---

# Workout list actions: duplicate and delete templates from home list

## Input

- Backlog item «Delete & duplicate a whole workout session» (added by task-2026-10-21-004).
- Owner decisions (2026-10-21): scope = templates in «Мои списки» (not history); actions in a «⋯»
  menu on the card; system confirm on delete; duplicate named «<Имя> (копия)».
- Spec: `specs/002-workout-list-actions/` (spec/plan/tasks); AgDR-0002 records the endpoint choice.

## Acceptance criteria
- [x] Duplicate endpoint returns deep copy with new id and « (копия)» title; 404 on unknown id
- [x] Home card «⋯» menu: Дублировать / Удалить (confirm); list refreshed; toast; activeTemplateId reset on delete
- [x] Full suite green; live probe on dev server green

## Output

Work commit `c8ffcd9`.
- Server: `POST /api/templates/:id/duplicate` — deep JSON clone, fresh id, title «<Имя> (копия)»,
  inserted after the source, 201; 404 on unknown id (AgDR-0002). `DELETE /api/templates/:id` reused.
- UI: home card «⋯» button (`.h-menu`, `data-act="tmenu"`) opens a `.kmenu` (reused exercise-menu
  markup) with «Дублировать» (`tdup`) and «Удалить» (`tdel`); delete asks `confirm('Удалить «Имя»?')`,
  clears `activeTemplateId` when it pointed at the deleted list; both refresh templates via
  `tkLogic.fetchTemplates` and toast. Click-away handler now also keeps the menu open for `tmenu`.
- CSS: `.h-menu` button styling in tk-focus.css.
- Live probe (dev server): duplicate returned 201 with fresh id and «Live probe (копия)»; unknown id
  → 404; delete → 200; probe entries removed afterwards.


## Rollback

`git revert` the task's commits removes the endpoint, the card menu and the tests; no data migration involved.

