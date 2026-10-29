---
id: task-2026-10-29-004
title: "Bugfix: sets appear pre-selected at workout start"
status: done
created: "2026-10-29T11:14:49Z"
updated: "2026-10-29T11:14:49Z"
hermes_sessions: ["20261029_134711_abc123"]
skill_version: "product-agent-governance@0.4.0"
tags: ["bugfix"]
checkpoint:
  git_head: "fd1f3e1139ca5d2976014f60488aac1209dc53c8"
  git_status_clean: false
  backup_ref: ""
result:
  commits: [f9ea740]
  files_changed: ["tk-focus.js", "__tests__/exercise-sets.test.js", "specs/008-sets-preselected-bugfix/spec.md", "tasks/2026-10-29-004-bugfix-sets-appear-pre-selected-at-workout-start.md", "bugs/inbox/2026-10-29-sets-appear-preselected-at-workout-start.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Tests: 85 passed, 85 total (16 suites)"
related:
  specs: ["specs/008-sets-preselected-bugfix/spec.md"]
  adr: []
  agdr: []
  bugs: ["bugs/inbox/2026-10-29-sets-appear-preselected-at-workout-start.md"]
---

# Bugfix: sets appear pre-selected at workout start

## Input

- Bug draft `bugs/inbox/2026-10-29-sets-appear-preselected-at-workout-start.md` (owner item 3 of
  2026-10-29); owner confirmed the fix («подтверждаю») on 2026-10-29. Branch: `feature/backlog-2026-10-29`.

## Acceptance criteria

- [x] All sets start unchecked (done=false, skipped=false) at workout start regardless of stale flags
- [x] Regression test in __tests__/exercise-sets.test.js added
- [x] npm run test green (85/85); validator green; progress regen; commit

## Output

Fix per `specs/008-sets-preselected-bugfix/spec.md`: `startWorkout()` now resets `set.done/set.skipped`
after `initSetsForExercise()` and migrates missing `enabled` (specs/006 consistency). Root cause and
suggested fix in the bug draft confirmed. Bug draft left for owner triage/closure.

## Rollback

`git revert` the commits of this task restores the pre-fix behaviour (stale set flags survive workout start).
