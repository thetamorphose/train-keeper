---
id: task-2026-10-21-009
title: "Workout settings page (stub, entry from list card menu)"
status: done
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
  commits: [c77eaf1]
  files_changed: ["tk-focus.js", "__tests__/settings-page.test.js", "specs/005-workout-settings-page/", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Test Suites: 14 passed; Tests: 77 passed (+2 navigation); validate_governance.py --strict: VALIDATION_OK"
related:
  specs: ["specs/005-workout-settings-page"]
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
- [x] Card «⋯» menu gains «Настройки»; opens a dedicated stub page for that list
- [x] Back action returns home; no data changed; full suite green

## Output

Work commit `c77eaf1`.
- New `state.mode = 'settings'` + `state.settingsTemplateId`; render() branch mirrors `home`:
  crumb «Настройки», list title, placeholder «Страница настроек — параметры появятся позже»,
  section button «← К спискам» (`closesettings`).
- Card «⋯» menu (homeHTML) gains «Настройки» (`tset`) between Дублировать and Удалить; opening
  it resets menu/dupMode and sets the title from the template. No data is changed by the page.
- Stub: no settings parameters by explicit owner decision; the page is the docking point for
  future per-workout options.


## Rollback

`git revert` the task's commits removes the view mode, menu item and tests.

