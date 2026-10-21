---
id: task-2026-10-21-005
title: "Fix skipped exercise not counting toward section completion (bug-2026-10-21-001)"
status: done
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
  commits: [bd26348]
  files_changed: ["tk-focus.js", "__tests__/skip-progress.test.js", "bugs/inbox/2026-10-21-skip-does-not-count-toward-section-completion.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "npm run test"
  test_result: "Test Suites: 10 passed; Tests: 59 passed (10 new in __tests__/skip-progress.test.js); validate_governance.py --strict: VALIDATION_OK"
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
- [x] Pure logic `tkLogic.exerciseStatus` / `sectionProgress` in tk-focus.js, covered by unit tests
- [x] Section button and header show done and skipped separately; gate unlocks on done+skipped == total
- [x] Both set-derivation sites use the majority rule
- [x] Bug draft updated with resolution; full suite green; validator green

## Output

Work commit `bd26348`.
- `tkLogic.exerciseStatus(ex)`: majority rule over sets (strict majority done → done; strict majority
  skipped → skipped; tie of fully closed sets → done, optimistic per owner; open sets → open);
  no-set exercises keep done/skipped flags.
- `tkLogic.sectionProgress(sec)` → {done, skipped, total}; used by section button and header sub-line
  («Выполнено X · пропущено Y из Z», skipped segment only when > 0).
- Gate: `done + skipped < total` keeps button ghost; == total unlocks next/finish — skipped no longer
  blocks finishing (the reported bug).
- Both derivation sites (set-toggle L871, long-press skip L736) replaced `every(done||skipped)` with
  the majority rule — flags stay consistent with the dots predicate (L563, unchanged).
- Long-press skip UX verified unchanged (600 ms, active mode only; cards without sets and set rows).

## Rollback

