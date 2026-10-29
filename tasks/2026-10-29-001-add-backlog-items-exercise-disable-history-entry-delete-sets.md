---
id: task-2026-10-29-001
title: "Add backlog items: exercise disable, history entry delete, sets preselected bug, scroll header, unfix bottom button, section-time summary, per-exercise comments, rest timer"
status: done
created: "2026-10-29T10:47:28Z"
updated: "2026-10-29T10:47:28Z"
hermes_sessions: ["20261029_134711_abc123"]
skill_version: "product-agent-governance@0.4.0"
tags: ["chore"]
checkpoint:
  git_head: "7eb85bebc7e8e115e859416b024ee59c3d2de24a"
  git_status_clean: false
  backup_ref: ""
result:
  commits: [38ad06a]
  files_changed: ["BACKLOG.md", "bugs/inbox/2026-10-29-sets-appear-preselected-at-workout-start.md", "tasks/2026-10-29-001-add-backlog-items-exercise-disable-history-entry-delete-sets.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "python tools/ai-agent-governance/scripts/validate_governance.py --project-root . --strict"
  test_result: "VALIDATION_OK (docs-only task; no application code changed, npm suite untouched)"
related:
  specs: []
  adr: []
  agdr: []
  bugs: ["bugs/inbox/2026-10-29-sets-appear-preselected-at-workout-start.md"]
---

# Add backlog items: exercise disable, history entry delete, sets preselected bug, scroll header, unfix bottom button, section-time summary, per-exercise comments, rest timer

## Input

- Owner message in Hermes session `20261029_134711_abc123` (2026-10-29): add 9 items to `BACKLOG.md` —
  (1) exercise enable/disable toggle (temporary exclusion from a session without deletion, keeping parameters);
  (2) delete individual entries from workout history; (3) bug: at workout start, sets of any exercise with
  sets appear pre-selected; (4) hide top panel on scroll down (only the timer stays visible); (5) unpin the
  bottom workout-finish/next-section button (normal flow at page bottom); (6) show time spent per section on
  workout finish; (7) optional per-exercise comments and emotional rating during an active workout;
  (8) per-exercise rest timer between sets, started when a set is marked done, sound at the end (implementation
  may derive rest time from total workout time); (9) think through auto-progression of planned reps on the
  session-setup screen (increase by % after N workouts) and planned-vs-actual mapping (default planned value =
  actual value of the previous workout, which is currently saved and not reset).
- Per SKILL.md step 8, item (3) is recorded as a bug draft
  `bugs/inbox/2026-10-29-sets-appear-preselected-at-workout-start.md` (owner triages priority/status).
- Item (9) overlaps existing backlog lines «Auto-progression» and «Smart plan adjustment» — no new line added;
  both lines extended with the owner's 2026-10-29 detail instead.

## Acceptance criteria

- [x] 8 new lines appended to `BACKLOG.md` (items 1-8; item 3 references the bug draft)
- [x] Item 9 merged into the existing auto-progression / smart-plan-adjustment lines (no duplicate)
- [x] Bug draft created under `bugs/inbox/` with symptom, agent root-cause analysis (tk-focus.js:678-685
      `startWorkout` resets only `e.done`; `initSetsForExercise` :88-125 preserves existing `set.done` flags)
      and suggested fix
- [x] No application code changed; validator green

## Output

8 backlog lines appended; bug draft `bugs/inbox/2026-10-29-sets-appear-preselected-at-workout-start.md` created
with agent root-cause analysis (startWorkout does not reset set.done/set.skipped; initSetsForExercise keeps
existing done flags when the set count already matches) and a suggested fix for triage. Items 9's details merged
into the two existing progression lines.

## Rollback

`git revert` the commits of this task restores the previous `BACKLOG.md` and removes the bug draft; no code touched.
