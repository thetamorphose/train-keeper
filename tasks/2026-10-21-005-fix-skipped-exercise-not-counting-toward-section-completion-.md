---
id: task-2026-10-21-005
title: "Fix skipped exercise not counting toward section completion (bug-2026-10-21-001)"
status: planned
created: "2026-10-21T13:12:56Z"
updated: "2026-10-21T13:12:56Z"
hermes_sessions: ["20261021_153710_21176d"]
skill_version: "product-agent-governance@0.4.0"
tags: ["bug"]
checkpoint:
  git_head: "a3bc994c9966e995b84c3d0464e9413d01de26c3"
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

# Fix skipped exercise not counting toward section completion (bug-2026-10-21-001)

## Input

- Bug draft `bugs/inbox/2026-10-21-skip-does-not-count-toward-section-completion.md`
  (owner report + agent root-cause analysis).
- Owner decisions (Hermes session 20261021_153710_21176d, 2026-10-21, business class):
  skipped is its own status and does NOT count as done, but has a separate counter and does not
  block completion; per-set accounting — majority of sets done → done, majority skipped → skipped;
  tie of closed sets → done (optimistic); keep current long-press skip UX.

## Acceptance criteria
- [ ] Pure logic `tkLogic.exerciseStatus` / `sectionProgress` in tk-focus.js, covered by unit tests
- [ ] Section button and header show done and skipped separately; gate unlocks on done+skipped == total
- [ ] Both set-derivation sites use the majority rule
- [ ] Bug draft updated with resolution; full suite green; validator green

## Output

## Rollback

