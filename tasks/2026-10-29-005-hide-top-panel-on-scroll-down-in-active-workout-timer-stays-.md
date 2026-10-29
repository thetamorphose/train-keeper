---
id: task-2026-10-29-005
title: "Hide top panel on scroll down in active workout (timer stays in place)"
status: done
created: "2026-10-29T11:58:49Z"
updated: "2026-10-29T11:58:49Z"
hermes_sessions: ["20261029_134711_abc123"]
skill_version: "product-agent-governance@0.4.0"
tags: ["feature"]
checkpoint:
  git_head: "93741f4bdf3e72b44589100d6126a07f9d030382"
  git_status_clean: false
  backup_ref: ""
result:
  commits: []
  files_changed: ["tk-focus.js", "tk-focus.css", "__tests__/header-collapse.test.js", "specs/009-header-collapse-on-scroll/spec.md", "specs/009-header-collapse-on-scroll/plan.md", "specs/009-header-collapse-on-scroll/tasks.md", "tasks/2026-10-29-005-hide-top-panel-on-scroll-down-in-active-workout-timer-stays-.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Tests: 87 passed, 87 total (17 suites)"
related:
  specs: ["specs/009-header-collapse-on-scroll/spec.md"]
  adr: []
  agdr: []
  bugs: []
---

# Hide top panel on scroll down in active workout (timer stays in place)

## Input

- Backlog line «Hide top panel on scroll down» (owner item 4 of 2026-10-29, task-2026-10-29-001).
- Owner decisions (2026-10-29): active workout mode only; the timer does NOT move — it keeps its
  top-right position while the rest of the header zone collapses.
- Branch: `feature/backlog-2026-10-29`.

## Acceptance criteria

- [x] Scrolling down >40px in active mode collapses crumb, title, description, section nav and dots
- [x] Timer pill stays visible in its usual top-right position (no repositioning)
- [x] Scrolling back to top (<40px) re-expands the header; render()/mode change resets the class
- [x] Build mode and habit lists unaffected (class removed unless mode==='active')
- [x] Jest suite green (87/87)

## Output

CSS `.screen.scrolled` collapse rules (opacity+max-height, .18s; timer excluded, border-bottom
faded) in `tk-focus.css`; `updateHeaderCollapse()` + passive scroll listener on `#exBody`
(threshold 40px, active mode only) called from `render()` in `tk-focus.js`. Tests:
`__tests__/header-collapse.test.js` (CSS/JS contract).

## Rollback

`git revert` the commits of this task restores the always-visible header; the scroll listener
and class toggle disappear with the code.
