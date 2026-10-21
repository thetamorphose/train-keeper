---
id: task-2026-10-21-009
title: "Workout settings page (stub, entry from list card menu)"
status: planned
created: "2026-10-21T14:43:58Z"
updated: "2026-10-21T14:43:58Z"
hermes_sessions: ["20261021_153710_21176d"]
skill_version: "product-agent-governance@0.4.0"
tags: ["feature"]
checkpoint:
  git_head: "bfaeb888aa9ab1f24b1de789da0b4bdf1edc3ff6"
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

# Workout settings page (stub, entry from list card menu)

## Input

- Backlog item «Workout settings page (separate screen)» (added by task-2026-10-21-004).
- Owner decisions (2026-10-21): the page is a **stub** — no settings parameters yet; entry point
  from the card «⋯» menu (owner picked it over the recommended header button).
- Spec: `specs/005-workout-settings-page/`.

## Acceptance criteria
- [ ] Card «⋯» menu gains «Настройки»; opens a dedicated stub page for that list
- [ ] Back action returns home; no data changed; full suite green

## Output

(work commit pending)

## Rollback

`git revert` the task's commits removes the view mode, menu item and tests.

