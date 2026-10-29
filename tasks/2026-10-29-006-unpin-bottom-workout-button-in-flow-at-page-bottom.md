---
id: task-2026-10-29-006
title: "Unpin bottom workout button (in-flow at page bottom)"
status: done
created: "2026-10-29T12:02:41Z"
updated: "2026-10-29T12:02:41Z"
hermes_sessions: ["20261029_134711_abc123"]
skill_version: "product-agent-governance@0.4.0"
tags: ["feature"]
checkpoint:
  git_head: "ebdfde166fc73072bee19555503820cc3d304c26"
  git_status_clean: false
  backup_ref: ""
result:
  commits: [5ba27d3]
  files_changed: ["Train Keeper - Фокус.html", "tk-focus.js", "tk-focus.css", "__tests__/header-collapse.test.js", "__tests__/habits.test.js", "__tests__/exercise-sets.test.js", "__tests__/exercise-enable-disable.test.js", "__tests__/exercise-duplicate-across.test.js", "__tests__/navigation.test.js", "__tests__/section-management.test.js", "__tests__/settings-page.test.js", "__tests__/skip-progress.test.js", "__tests__/wellbeing.test.js", "__tests__/wellbeing-edit.test.js", "specs/010-unpin-bottom-button/spec.md", "specs/010-unpin-bottom-button/plan.md", "specs/010-unpin-bottom-button/tasks.md", "tasks/2026-10-29-006-unpin-bottom-workout-button-in-flow-at-page-bottom.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Tests: 88 passed, 88 total (17 suites)"
related:
  specs: ["specs/010-unpin-bottom-button/spec.md"]
  adr: []
  agdr: []
  bugs: []
---

# Unpin bottom workout button (in-flow at page bottom)

## Input

- Backlog line «Unpin bottom workout button» (owner item 5 of 2026-10-29, task-2026-10-29-001).
- Owner confirmed the agent plan («продолжаем»): move the button into the scrollable flow at the end
  of the page content; actions/labels unchanged.
- Branch: `feature/backlog-2026-10-29`.

## Acceptance criteria

- [x] .secfoot no longer position:absolute; no gradient backdrop; .body padding-bottom normal
- [x] Button rendered by render() as the last element inside exBody in ALL modes (workout/home/settings/summary)
- [x] Button logic (labels, classes, actions) unchanged
- [x] Jest suite green (88/88)

## Output

HTML: static `.secfoot` block removed (the button is now JS-rendered). JS: `secfootHTML()` helper
appended to every branch's exBody content — this also fixed a latent prod-crash: home/settings/summary
branches called `$('#secbtn')` on content that no longer contained the button (null deref); the
workout-branch `display` reset is now guarded. CSS: `.secfoot` static flow, `.body` padding-bottom
86px → 14px. Tests: stale static `#secbtn` stubs removed from 11 suite mock-DOMs (jsdom duplicate-id
map returned the stale static node over the freshly rendered one); layout-contract test added in
header-collapse.test.js.

## Rollback

`git revert` the commits of this task restores the pinned button and static HTML block.
