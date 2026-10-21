---
id: task-2026-10-21-004
title: "Add backlog items: session delete/duplicate, skip-count bug, exercise duplication, well-being edit, settings page"
status: done
created: "2026-10-21T12:58:48Z"
updated: "2026-10-21T12:58:48Z"
hermes_sessions: ["20261021_153710_21176d"]
skill_version: "product-agent-governance@0.4.0"
tags: ["chore"]
checkpoint:
  git_head: "026ebfa25298a595bc72802ef6e810e8e33893c4"
  git_status_clean: false
  backup_ref: ""
result:
  commits: [3f4cf2f]
  files_changed: ["BACKLOG.md", "bugs/inbox/2026-10-21-skip-does-not-count-toward-section-completion.md", "tasks/2026-10-21-004-add-backlog-items-session-delete-duplicate-skip-count-bug-ex.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "python tools/ai-agent-governance/scripts/validate_governance.py --project-root . --strict"
  test_result: "VALIDATION_OK (docs-only task; no application code changed, npm suite untouched)"
related:
  specs: []
  adr: []
  agdr: []
  bugs: []
---

# Add backlog items: session delete/duplicate, skip-count bug, exercise duplication, well-being edit, settings page

## Input

- Owner message in Hermes session `20261021_153710_21176d` (2026-10-21): add 5 items to `BACKLOG.md` —
  (1) delete & duplicate a workout session; (2) bug: skipped exercise does not count toward section
  completion, blocking workout finish; (3) exercise duplication; (4) edit post-workout well-being rating
  after finish; (5) workout settings page (separate screen).
- Per SKILL.md step 8, item (2) is recorded as a bug draft `bugs/inbox/2026-10-21-skip-does-not-count-toward-section-completion.md`
  (owner triages priority/status); the backlog line references it.
- Agent code probe found the likely root cause (`tk-focus.js:551` counts only `e.done`, while the dots
  at `:563` already accept `done || skipped`) — recorded in the bug draft, not fixed here.

## Acceptance criteria
- [x] 5 new lines appended to `BACKLOG.md` (one per owner item, item 2 references the bug draft)
- [x] Bug draft created under `bugs/inbox/` with symptom, agent root-cause analysis and file:line evidence
- [x] Exercise-duplication overlap with task-2026-10-21-003 (card-level dup already done) surfaced to owner
- [x] No application code changed; validator green

## Output

Work commit `3f4cf2f`: 5 backlog lines appended; bug draft `bugs/inbox/2026-10-21-skip-does-not-count-toward-section-completion.md`
created with agent root-cause analysis (tk-focus.js:551 counts only `e.done`, dots at :563 already accept `done || skipped`).
Scope question for the owner: item 3 (exercise duplication) may be already covered by the card-level
«Дублировать» action closed in task-2026-10-21-003 — clarification pending, line kept in backlog.

## Rollback

`git revert` the commits of this task restores the previous `BACKLOG.md` and removes the bug draft; no code touched.

