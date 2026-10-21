---
id: task-2026-10-21-007
title: "Duplicate exercise into another section or another workout"
status: planned
created: "2026-10-21T13:44:45Z"
updated: "2026-10-21T13:44:45Z"
hermes_sessions: ["20261021_153710_21176d"]
skill_version: "product-agent-governance@0.4.0"
tags: ["feature"]
checkpoint:
  git_head: "f79bc95cc49c391bc6244d647cec42a214575a1f"
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

# Duplicate exercise into another section or another workout

## Input

- Backlog item «Duplicate exercise into another section or another workout» (clarified by owner in
  task-2026-10-21-004 scope discussion).
- Owner decisions (2026-10-21): two menu items («В секцию…» / «В тренировку…»); copy goes to the
  end of the chosen section; exact clone (fields, values, sets, notes) with fresh ids.
- Spec: `specs/003-exercise-duplicate-across/`; AgDR-0003 (+ amendment) records the save strategy.

## Acceptance criteria
- [ ] `tkLogic.cloneExercise` / `addExerciseToSection` pure logic, unit-tested (clone freshness, append-to-end)
- [ ] Exercise menu: «В секцию…» / «В тренировку…» with target picker (sections / other lists / their sections), back steps
- [ ] Cross-list save via in-memory template + PUT sections + list refresh (no new API route)
- [ ] Full suite green; live probe of the list→PUT sequence green

## Output

(work commit pending)

## Rollback

`git revert` the task's commits removes the logic functions, menu items and tests; API unchanged.

