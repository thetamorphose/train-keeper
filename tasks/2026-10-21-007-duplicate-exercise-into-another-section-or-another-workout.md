---
id: task-2026-10-21-007
title: "Duplicate exercise into another section or another workout"
status: done
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
  commits: [7f2ce69]
  files_changed: ["tk-focus.js", "tk-focus.css", "__tests__/exercise-duplicate-across.test.js", "specs/003-exercise-duplicate-across/", "docs/agdr/0003-exercise-duplication-save.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Test Suites: 11 passed; Tests: 67 passed (+5 clone/append); live probe of list->PUT sequence: clone persisted, original untouched; validate_governance.py --strict: VALIDATION_OK"
related:
  specs: ["specs/003-exercise-duplicate-across"]
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
- [x] `tkLogic.cloneExercise` / `addExerciseToSection` pure logic, unit-tested (clone freshness, append-to-end)
- [x] Exercise menu: «В секцию…» / «В тренировку…» with target picker (sections / other lists / their sections), back steps
- [x] Cross-list save via in-memory template + PUT sections + list refresh (no new API route)
- [x] Full suite green; live probe of the list→PUT sequence green

## Output

Work commit `7f2ce69`.
- `tkLogic.cloneExercise(ex)`: deep clone, fresh ids for card/fields/sets, done/skipped reset;
  `tkLogic.addExerciseToSection(sections, si, clone)`: append to end, false on bad index.
- Exercise menu gains «В секцию…» (`dupsec`) and «В тренировку…» (`dupwrk`); `dupMode` turns the
  same `.kmenu` into a target picker: current sections (`dupgo`), other lists (`duppick`), their
  sections (`dupgo2`), with `dupback` steps. Existing «Дублировать» unchanged.
- Same-workout duplication saves via `tkLogic.saveTemplate`; cross-list via in-memory target +
  PUT `{sections}` + unconditional `tkLogic.fetchTemplates` refresh (AgDR-0003 amendment: no
  GET /api/templates/:id route — it does not exist and is not needed).
- Live probe found the plan's GET-by-id was wrong (404) — caught and corrected before commit.


## Rollback

`git revert` the task's commits removes the logic functions, menu items and tests; API unchanged.

