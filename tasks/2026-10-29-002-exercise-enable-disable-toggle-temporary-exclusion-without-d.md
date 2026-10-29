---
id: task-2026-10-29-002
title: "Exercise enable/disable toggle (temporary exclusion without deletion)"
status: done
created: "2026-10-29T11:00:29Z"
updated: "2026-10-29T11:00:29Z"
hermes_sessions: ["20261029_134711_abc123"]
skill_version: "product-agent-governance@0.4.0"
tags: ["feature"]
checkpoint:
  git_head: "9edac4c30c0f206704f754197919f743ccdb5566"
  git_status_clean: false
  backup_ref: ""
result:
  commits: [7665c56]
  files_changed: ["tk-focus.js", "tk-focus.css", "__tests__/exercise-enable-disable.test.js", "specs/006-exercise-enable-disable/spec.md", "specs/006-exercise-enable-disable/plan.md", "specs/006-exercise-enable-disable/tasks.md", "tasks/2026-10-29-002-exercise-enable-disable-toggle-temporary-exclusion-without-d.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Tests: 82 passed, 82 total (15 suites)"
related:
  specs: ["specs/006-exercise-enable-disable/spec.md"]
  adr: []
  agdr: []
  bugs: []
---

# Exercise enable/disable toggle (temporary exclusion without deletion)

## Input

- Backlog line «Exercise enable/disable toggle» (owner item 1 of 2026-10-29, task-2026-10-29-001).
- Owner decisions (2026-10-29, «принимаю предложения»): toggle is build-mode only (long-press skip
  covers active mode); all-disabled section auto-completes; disabled exercises are excluded from history.
- Branch: `feature/backlog-2026-10-29`.

## Acceptance criteria

- [x] Card menu has «Выключить»/«Включить»; disabled cards render dimmed (dashed border, muted name)
- [x] Disabled exercises excluded from section progress, dots and completion checks; all-disabled section auto-completes
- [x] Active mode hides disabled exercises; history payload excludes them (empty sections dropped)
- [x] State migration: `enabled` absent → `true` on load; template PUT carries the field (server ignores unknown fields)
- [x] Jest suite green (82/82)

## Output

Spec-first implementation per `specs/006-exercise-enable-disable/`. New `tkLogic.setExerciseEnabled`
and `isEnabled`; `exerciseStatus` returns 'disabled' for `enabled === false`; `sectionProgress` counts
only enabled exercises; active render and history payload filter disabled exercises; menu action
`toggle-en` with toasts; `.card.disabled` CSS. Old data needs no migration script (absent field = enabled).

## Rollback

`git revert` the commits of this task restores the previous behaviour; the `enabled` field left in
stored state/templates is ignored by the reverted code.
