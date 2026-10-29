---
id: task-2026-10-29-007
title: "Show time spent per section on workout finish"
status: done
created: "2026-10-29T12:15:49Z"
updated: "2026-10-29T12:15:49Z"
hermes_sessions: ["20261029_134711_abc123"]
skill_version: "product-agent-governance@0.4.0"
tags: ["feature"]
checkpoint:
  git_head: "00d3374c07b133f8ca8c94ebcf71921a0e52c3e5"
  git_status_clean: false
  backup_ref: ""
result:
  commits: [678e676]
  files_changed: ["tk-focus.js", "tk-focus.css", "__tests__/section-time.test.js", "specs/011-section-time-summary/spec.md", "specs/011-section-time-summary/plan.md", "specs/011-section-time-summary/tasks.md", "tasks/2026-10-29-007-show-time-spent-per-section-on-workout-finish.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Tests: 92 passed, 92 total (18 suites)"
related:
  specs: ["specs/011-section-time-summary/spec.md"]
  adr: []
  agdr: []
  bugs: []
---

# Show time spent per section on workout finish

## Input

- Backlog line «Show time spent per section on workout finish» (owner item 6 of 2026-10-29, task-2026-10-29-001).
- Owner decisions (2026-10-29): during the workout ONLY the total timer is shown; per-section time
  appears in the finish summary at each section («у каждой секции в итоге показано время»); habit
  lists excluded (elapsed = 0 there).
- Branch: `feature/backlog-2026-10-29`.

## Acceptance criteria

- [x] Summary shows a compact `⏱ м:сс` badge per section header (workout type only)
- [x] Time sums across section revisits (arrows/dots/nextsec all tracked); sum == elapsed ± rounding
- [x] History payload carries `sectionTimes`; view-history restores it
- [x] No per-section time UI during the active workout; habit lists show no badge
- [x] Jest suite green (92/92)

## Output

`state.sectionTimes` + `state.curSectionStartedAt` persisted in localStorage state. `trackSectionTime`
closes the current interval, `switchSection` wraps every section switch (dot/prev/next/nextsec);
`startWorkout` opens, `finishWorkout` closes and clears the cursor, closeSummary resets. Summary
renders `.sec-time` badge; history POST includes `sectionTimes`; `viewhistory` restores them.
`switchSection` still changes `state.i` outside active mode (regression guard from navigation test).
Tests: `__tests__/section-time.test.js`.

## Rollback

`git revert` the commits of this task removes the badge and tracking; stale `sectionTimes` fields in
stored state/history are ignored by reverted code.
