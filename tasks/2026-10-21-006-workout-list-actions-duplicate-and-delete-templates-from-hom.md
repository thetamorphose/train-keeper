---
id: task-2026-10-21-006
title: "Workout list actions: duplicate and delete templates from home list"
status: planned
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

# Workout list actions: duplicate and delete templates from home list

## Input

- Backlog item «Delete & duplicate a whole workout session» (added by task-2026-10-21-004).
- Owner decisions (2026-10-21): scope = templates in «Мои списки» (not history); actions in a «⋯»
  menu on the card; system confirm on delete; duplicate named «<Имя> (копия)».
- Spec: `specs/002-workout-list-actions/` (spec/plan/tasks); AgDR-0002 records the endpoint choice.

## Acceptance criteria
- [ ] Duplicate endpoint returns deep copy with new id and « (копия)» title; 404 on unknown id
- [ ] Home card «⋯» menu: Дублировать / Удалить (confirm); list refreshed; toast; activeTemplateId reset on delete
- [ ] Full suite green; live probe on dev server green

## Output

(work commit pending)

## Rollback

`git revert` the task's commits removes the endpoint, the card menu and the tests; no data migration involved.

